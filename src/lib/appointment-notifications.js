import { format } from 'date-fns';

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
};

const STATUS_SUBJECTS = {
  confirmed: 'Your appointment request has been confirmed',
  cancelled: 'Your appointment request has been cancelled',
};

export function getAppointmentStatusLabel(status) {
  return STATUS_LABELS[status] || 'Updated';
}

function formatPreferredDate(preferredDate) {
  if (!preferredDate) {
    return 'Not specified';
  }

  const parsedDate = new Date(preferredDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return preferredDate;
  }

  return format(parsedDate, 'MMMM d, yyyy');
}

export function getAppointmentStatusEmailPreview(appointment, status) {
  const subject = STATUS_SUBJECTS[status];

  if (!subject || !appointment?.email) {
    return null;
  }

  const statusLabel = getAppointmentStatusLabel(status);
  const preferredDate = formatPreferredDate(appointment.preferred_date);
  const body = status === 'confirmed'
    ? `Hello ${appointment.patient_name},

Your appointment request has been ${statusLabel.toLowerCase()}.

Reason for visit: ${appointment.reason}
Preferred date: ${preferredDate}

If you need to make any changes, please reply to this email or contact the clinic directly.

Thank you,
Clinic Team`
    : `Hello ${appointment.patient_name},

Your appointment request has been ${statusLabel.toLowerCase()}.

Reason for visit: ${appointment.reason}
Preferred date: ${preferredDate}

Please contact the clinic if you would like to request another appointment date.

Thank you,
Clinic Team`;

  return { subject, body };
}
