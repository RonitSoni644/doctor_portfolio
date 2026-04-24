import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import { neon } from '@neondatabase/serverless';

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const PORT = Number(process.env.PORT || 3001);
const API_PREFIX = '/api';
const DATABASE_URL = process.env.DATABASE_URL;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me-in-production';
const SESSION_COOKIE = 'doctor_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const DATABASE_RETRY_DELAY_MS = Number(process.env.DATABASE_RETRY_DELAY_MS || 5000);
const PUBLIC_CONTENT_CACHE_TTL_MS = Number(process.env.PUBLIC_CONTENT_CACHE_TTL_MS || 30000);

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required.');
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required.');
}

const sql = neon(DATABASE_URL);
let isDatabaseReady = false;
let databaseInitPromise = null;
let databaseRetryTimer = null;
let lastDatabaseError = null;
let publicContentCache = {
  data: null,
  expiresAt: 0,
};

const entityConfigs = {
  doctorProfile: {
    table: 'doctor_profiles',
    sortable: false,
    columns: ['name', 'title', 'specialty', 'tagline', 'bio', 'photo_url', 'email', 'phone', 'location', 'years_experience', 'patients_treated', 'awards', 'theme'],
    normalize: (input) => ({
      name: toNullableString(input.name) ?? '',
      title: toNullableString(input.title),
      specialty: toNullableString(input.specialty),
      tagline: toNullableString(input.tagline),
      bio: toNullableString(input.bio),
      photo_url: toNullableString(input.photo_url),
      email: toNullableString(input.email),
      phone: toNullableString(input.phone),
      location: toNullableString(input.location),
      years_experience: toNullableNumber(input.years_experience),
      patients_treated: toNullableNumber(input.patients_treated),
      awards: toNullableNumber(input.awards),
      theme: input.theme === 'dark' ? 'dark' : 'light',
    }),
    listQuery: `
      select
        id,
        name,
        title,
        specialty,
        tagline,
        bio,
        photo_url,
        email,
        phone,
        location,
        years_experience,
        patients_treated,
        awards,
        theme,
        created_at as created_date,
        updated_at as updated_date
      from doctor_profiles
      order by updated_at desc, created_at desc
    `,
  },
  specialties: {
    table: 'specialties',
    sortable: true,
    columns: ['title', 'description', 'icon', 'sort_order'],
    normalize: (input) => ({
      title: toNullableString(input.title),
      description: toNullableString(input.description),
      icon: toNullableString(input.icon),
      sort_order: toNullableNumber(input.order),
    }),
    listQuery: `
      select
        id,
        title,
        description,
        icon,
        sort_order as "order",
        created_at as created_date,
        updated_at as updated_date
      from specialties
      order by sort_order asc nulls last, created_at asc
    `,
  },
  experiences: {
    table: 'experiences',
    sortable: true,
    columns: ['type', 'title', 'institution', 'period', 'description', 'sort_order'],
    normalize: (input) => ({
      type: input.type === 'education' ? 'education' : 'experience',
      title: toNullableString(input.title),
      institution: toNullableString(input.institution),
      period: toNullableString(input.period),
      description: toNullableString(input.description),
      sort_order: toNullableNumber(input.order),
    }),
    listQuery: `
      select
        id,
        type,
        title,
        institution,
        period,
        description,
        sort_order as "order",
        created_at as created_date,
        updated_at as updated_date
      from experiences
      order by sort_order asc nulls last, created_at asc
    `,
  },
  publications: {
    table: 'publications',
    sortable: true,
    columns: ['title', 'journal', 'year', 'link', 'description', 'sort_order'],
    normalize: (input) => ({
      title: toNullableString(input.title),
      journal: toNullableString(input.journal),
      year: toNullableString(input.year),
      link: toNullableString(input.link),
      description: toNullableString(input.description),
      sort_order: toNullableNumber(input.order),
    }),
    listQuery: `
      select
        id,
        title,
        journal,
        year,
        link,
        description,
        sort_order as "order",
        created_at as created_date,
        updated_at as updated_date
      from publications
      order by sort_order asc nulls last, created_at asc
    `,
  },
  testimonials: {
    table: 'testimonials',
    sortable: true,
    columns: ['patient_name', 'rating', 'text', 'condition', 'approved', 'sort_order'],
    normalize: (input) => ({
      patient_name: toNullableString(input.patient_name),
      rating: toNullableNumber(input.rating),
      text: toNullableString(input.text),
      condition: toNullableString(input.condition),
      approved: toBoolean(input.approved, true),
      sort_order: toNullableNumber(input.order),
    }),
    listQuery: `
      select
        id,
        patient_name,
        rating,
        text,
        condition,
        approved,
        sort_order as "order",
        created_at as created_date,
        updated_at as updated_date
      from testimonials
      order by sort_order asc nulls last, created_at asc
    `,
  },
};

app.use(express.json({ limit: '6mb' }));

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.get(`${API_PREFIX}/health`, async (_req, res) => {
  if (!isDatabaseReady) {
    return res.status(503).json({
      ok: false,
      databaseReady: false,
      error: lastDatabaseError?.message || 'Database is still initializing.',
    });
  }

  await sql`select 1`;
  res.json({ ok: true, databaseReady: true });
});

app.get(`${API_PREFIX}/public/content`, async (_req, res) => {
  if (publicContentCache.data && publicContentCache.expiresAt > Date.now()) {
    return res.json(publicContentCache.data);
  }

  await ensureDatabaseReady();

  const [doctor, specialties, experiences, publications, testimonials] = await Promise.all([
    listEntity('doctorProfile'),
    listEntity('specialties'),
    listEntity('experiences'),
    listEntity('publications'),
    sql`
      select
        id,
        patient_name,
        rating,
        text,
        condition,
        approved,
        sort_order as "order",
        created_at as created_date,
        updated_at as updated_date
      from testimonials
      where approved = true
      order by sort_order asc nulls last, created_at asc
    `,
  ]);

  const payload = {
    doctor: doctor[0] || null,
    specialties,
    experiences,
    publications,
    testimonials,
  };

  publicContentCache = {
    data: payload,
    expiresAt: Date.now() + PUBLIC_CONTENT_CACHE_TTL_MS,
  };

  res.json(payload);
});

app.post(`${API_PREFIX}/public/appointments`, async (req, res) => {
  await ensureDatabaseReady();
  const payload = normalizeAppointment(req.body);

  if (!payload.patient_name || !payload.email || !payload.reason) {
    return res.status(400).json({ error: 'patient_name, email, and reason are required.' });
  }

  const [created] = await sql`
    insert into appointments (patient_name, email, phone, reason, preferred_date, message, status)
    values (
      ${payload.patient_name},
      ${payload.email},
      ${payload.phone},
      ${payload.reason},
      ${payload.preferred_date},
      ${payload.message},
      ${payload.status}
    )
    returning
      id,
      patient_name,
      email,
      phone,
      reason,
      preferred_date,
      message,
      status,
      created_at as created_date,
      updated_at as updated_date
  `;

  res.status(201).json(created);
});

app.get(`${API_PREFIX}/admin/session`, async (req, res) => {
  const session = getSessionFromRequest(req);

  if (!session) {
    return res.status(401).json({ user: null });
  }

  res.json({ user: { email: session.email } });
});

app.post(`${API_PREFIX}/admin/login`, async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signSession({ email });
  setSessionCookie(res, token);
  res.json({ user: { email } });
});

app.post(`${API_PREFIX}/admin/logout`, async (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.use(`${API_PREFIX}/admin`, requireAdmin);

app.get(`${API_PREFIX}/admin/content`, async (_req, res) => {
  await ensureDatabaseReady();
  const [doctorProfiles, specialties, experiences, publications, testimonials, appointments] = await Promise.all([
    listEntity('doctorProfile'),
    listEntity('specialties'),
    listEntity('experiences'),
    listEntity('publications'),
    listEntity('testimonials'),
    sql`
      select
        id,
        patient_name,
        email,
        phone,
        reason,
        preferred_date,
        message,
        status,
        created_at as created_date,
        updated_at as updated_date
      from appointments
      order by created_at desc
    `,
  ]);

  res.json({
    doctor: doctorProfiles[0] || null,
    specialties,
    experiences,
    publications,
    testimonials,
    appointments,
  });
});

app.post(`${API_PREFIX}/admin/upload`, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'A file is required.' });
  }

  const mimeType = req.file.mimetype || 'application/octet-stream';
  const base64 = req.file.buffer.toString('base64');
  const fileUrl = `data:${mimeType};base64,${base64}`;

  res.status(201).json({ file_url: fileUrl });
});

app.post(`${API_PREFIX}/admin/doctor-profile`, async (req, res) => {
  await ensureDatabaseReady();
  const created = await createEntity('doctorProfile', req.body);
  res.status(201).json(created);
});

app.put(`${API_PREFIX}/admin/doctor-profile/:id`, async (req, res) => {
  await ensureDatabaseReady();
  const updated = await updateEntity('doctorProfile', req.params.id, req.body);
  res.json(updated);
});

app.post(`${API_PREFIX}/admin/:entity`, async (req, res) => {
  await ensureDatabaseReady();
  const entity = getAdminCollectionEntity(req.params.entity);
  const created = await createEntity(entity, req.body);
  res.status(201).json(created);
});

app.put(`${API_PREFIX}/admin/:entity/:id`, async (req, res) => {
  await ensureDatabaseReady();
  const entity = getAdminCollectionEntity(req.params.entity);
  const updated = await updateEntity(entity, req.params.id, req.body);
  res.json(updated);
});

app.delete(`${API_PREFIX}/admin/:entity/:id`, async (req, res) => {
  await ensureDatabaseReady();
  const entity = getAdminCollectionEntity(req.params.entity);
  const config = getEntityConfig(entity);
  await sql.unsafe(`delete from ${config.table} where id = $1`, [req.params.id]);
  invalidatePublicContentCache();
  res.status(204).end();
});

app.put(`${API_PREFIX}/admin/appointments/:id/status`, async (req, res) => {
  await ensureDatabaseReady();
  const status = normalizeAppointmentStatus(req.body?.status);

  const [updated] = await sql`
    update appointments
    set
      status = ${status},
      updated_at = now()
    where id = ${req.params.id}
    returning
      id,
      patient_name,
      email,
      phone,
      reason,
      preferred_date,
      message,
      status,
      created_at as created_date,
      updated_at as updated_date
  `;

  if (!updated) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  await sendAppointmentStatusEmail(updated);
  res.json(updated);
});

app.use((error, _req, res, _next) => {
  console.error(error);

  if (error instanceof multer.MulterError) {
    return res.status(400).json({ error: error.message });
  }

  res.status(error.statusCode || 500).json({ error: error.message || 'Something went wrong.' });
});

void initializeDatabase();

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});

async function initializeDatabase() {
  if (isDatabaseReady) {
    return true;
  }

  if (databaseInitPromise) {
    return databaseInitPromise;
  }

  databaseInitPromise = (async () => {
    try {
      await ensureSchema();
      isDatabaseReady = true;
      lastDatabaseError = null;
      console.log('Database connection initialized.');
      return true;
    } catch (error) {
      isDatabaseReady = false;
      lastDatabaseError = error;
      scheduleDatabaseRetry();
      console.error('Database initialization failed. Retrying in background...', error);
      return false;
    } finally {
      databaseInitPromise = null;
    }
  })();

  return databaseInitPromise;
}

function scheduleDatabaseRetry() {
  if (databaseRetryTimer) {
    return;
  }

  databaseRetryTimer = setTimeout(() => {
    databaseRetryTimer = null;
    void initializeDatabase();
  }, DATABASE_RETRY_DELAY_MS);
}

async function ensureDatabaseReady() {
  const ready = await initializeDatabase();

  if (!ready) {
    const error = new Error('Database is temporarily unavailable. Please try again shortly.');
    error.statusCode = 503;
    throw error;
  }
}

function invalidatePublicContentCache() {
  publicContentCache = {
    data: null,
    expiresAt: 0,
  };
}

async function ensureSchema() {
  await sql.transaction([
    sql`create extension if not exists pgcrypto`,
    sql`
      create table if not exists doctor_profiles (
        id uuid primary key default gen_random_uuid(),
        name text not null default '',
        title text,
        specialty text,
        tagline text,
        bio text,
        photo_url text,
        email text,
        phone text,
        location text,
        years_experience integer,
        patients_treated integer,
        awards integer,
        theme text not null default 'light',
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `,
    sql`
      create table if not exists specialties (
        id uuid primary key default gen_random_uuid(),
        title text not null,
        description text,
        icon text,
        sort_order integer,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `,
    sql`
      create table if not exists experiences (
        id uuid primary key default gen_random_uuid(),
        type text not null,
        title text not null,
        institution text not null,
        period text,
        description text,
        sort_order integer,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `,
    sql`
      create table if not exists publications (
        id uuid primary key default gen_random_uuid(),
        title text not null,
        journal text,
        year text,
        link text,
        description text,
        sort_order integer,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `,
    sql`
      create table if not exists testimonials (
        id uuid primary key default gen_random_uuid(),
        patient_name text not null,
        rating integer,
        text text not null,
        condition text,
        approved boolean not null default true,
        sort_order integer,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `,
    sql`
      create table if not exists appointments (
        id uuid primary key default gen_random_uuid(),
        patient_name text not null,
        email text not null,
        phone text,
        reason text not null,
        preferred_date text,
        message text,
        status text not null default 'pending',
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `,
  ]);
}

function requireAdmin(req, res, next) {
  const session = getSessionFromRequest(req);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.admin = session;
  next();
}

function getSessionFromRequest(req) {
  const cookieHeader = req.headers.cookie || '';
  const token = parseCookie(cookieHeader)[SESSION_COOKIE];

  if (!token) {
    return null;
  }

  const [payloadPart, signaturePart] = token.split('.');
  if (!payloadPart || !signaturePart) {
    return null;
  }

  const expectedSignature = signValue(payloadPart);
  const signatureBuffer = Buffer.from(signaturePart);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
    if (payload.exp <= Date.now() || payload.email !== ADMIN_EMAIL) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function signSession({ email }) {
  const payloadPart = Buffer.from(JSON.stringify({
    email,
    exp: Date.now() + SESSION_TTL_MS,
  })).toString('base64url');

  return `${payloadPart}.${signValue(payloadPart)}`;
}

function signValue(value) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('base64url');
}

function setSessionCookie(res, token) {
  const cookie = [
    `${SESSION_COOKIE}=${token}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];

  if (process.env.NODE_ENV === 'production') {
    cookie.push('Secure');
  }

  res.setHeader('Set-Cookie', cookie.join('; '));
}

function clearSessionCookie(res) {
  const cookie = [`${SESSION_COOKIE}=`, 'HttpOnly', 'Path=/', 'SameSite=Lax', 'Max-Age=0'];

  if (process.env.NODE_ENV === 'production') {
    cookie.push('Secure');
  }

  res.setHeader('Set-Cookie', cookie.join('; '));
}

function parseCookie(cookieHeader) {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const separator = part.indexOf('=');
      if (separator === -1) {
        return acc;
      }

      const key = decodeURIComponent(part.slice(0, separator));
      const value = decodeURIComponent(part.slice(separator + 1));
      acc[key] = value;
      return acc;
    }, {});
}

function getEntityConfig(entityKey) {
  const config = entityConfigs[entityKey];

  if (!config) {
    throw new Error(`Unsupported entity: ${entityKey}`);
  }

  return config;
}

function getAdminCollectionEntity(entityKey) {
  if (!['specialties', 'experiences', 'publications', 'testimonials'].includes(entityKey)) {
    const error = new Error(`Unsupported admin entity: ${entityKey}`);
    error.statusCode = 404;
    throw error;
  }

  return entityKey;
}

async function listEntity(entityKey) {
  const config = getEntityConfig(entityKey);
  return sql.unsafe(config.listQuery);
}

async function createEntity(entityKey, input) {
  const config = getEntityConfig(entityKey);
  const normalized = config.normalize(input || {});
  const values = config.columns.map((column) => normalized[column] ?? null);
  const placeholders = config.columns.map((_, index) => `$${index + 1}`).join(', ');
  const returningQuery = `insert into ${config.table} (${config.columns.join(', ')}) values (${placeholders}) returning id`;
  const [created] = await sql.unsafe(returningQuery, values);
  const rows = await listEntity(entityKey);
  invalidatePublicContentCache();
  return rows.find((row) => row.id === created.id);
}

async function updateEntity(entityKey, id, input) {
  const config = getEntityConfig(entityKey);
  const normalized = config.normalize(input || {});
  const assignments = config.columns.map((column, index) => `${column} = $${index + 1}`);
  const values = config.columns.map((column) => normalized[column] ?? null);
  const query = `
    update ${config.table}
    set ${assignments.join(', ')}, updated_at = now()
    where id = $${config.columns.length + 1}
    returning id
  `;
  const [updated] = await sql.unsafe(query, [...values, id]);

  if (!updated) {
    throw new Error('Record not found.');
  }

  const rows = await listEntity(entityKey);
  invalidatePublicContentCache();
  return rows.find((row) => row.id === updated.id);
}

function normalizeAppointment(input) {
  return {
    patient_name: toNullableString(input.patient_name),
    email: toNullableString(input.email),
    phone: toNullableString(input.phone),
    reason: toNullableString(input.reason),
    preferred_date: toNullableString(input.preferred_date),
    message: toNullableString(input.message),
    status: normalizeAppointmentStatus(input.status),
  };
}

function normalizeAppointmentStatus(status) {
  return ['confirmed', 'cancelled'].includes(status) ? status : 'pending';
}

function toNullableString(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized ? normalized : null;
}

function toNullableNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : null;
}

function toBoolean(value, fallback = false) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }

  return fallback;
}

async function sendAppointmentStatusEmail(appointment) {
  if (!appointment?.email) {
    return;
  }

  const transporter = createMailTransport();
  if (!transporter) {
    return;
  }

  const statusLabel = appointment.status === 'confirmed' ? 'confirmed' : 'cancelled';
  const subject = appointment.status === 'confirmed'
    ? 'Your appointment request has been confirmed'
    : 'Your appointment request has been cancelled';

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: appointment.email,
    subject,
    text: `Hello ${appointment.patient_name},\n\nYour appointment request has been ${statusLabel}.\n\nReason for visit: ${appointment.reason}\nPreferred date: ${appointment.preferred_date || 'Not specified'}\n\nThank you,\nClinic Team`,
  });
}

function createMailTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}
