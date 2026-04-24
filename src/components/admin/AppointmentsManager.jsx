import React from 'react';
import { Calendar, Clock, User, Mail, Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getAppointmentStatusLabel } from '@/lib/appointment-notifications';
import { adminApi } from '@/lib/api';

const statusColors = {
  pending: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  confirmed: 'text-green-400 bg-green-400/10 border-green-400/30',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/30',
};
const StatusIcon = { pending: AlertCircle, confirmed: CheckCircle, cancelled: XCircle };

export default function AppointmentsManager({ appointments, onUpdate }) {
  const updateStatus = async (appointment, status) => {
    try {
      await adminApi.updateAppointmentStatus(appointment.id, status);
      toast.success(`Appointment ${getAppointmentStatusLabel(status).toLowerCase()}.`);
      await onUpdate();
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      toast.error('Appointment status was not updated. Please try again.');
    }
  };

  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl font-bold text-foreground">Appointments</h2>

      <div className="space-y-4">
        {appointments?.map(appt => {
          const Icon = StatusIcon[appt.status] || AlertCircle;
          return (
            <div key={appt.id} className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-card-foreground">{appt.patient_name}</h3>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[appt.status]}`}>
                      <Icon size={12} /> {getAppointmentStatusLabel(appt.status)}
                    </span>
                  </div>
                  <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <span className="flex items-center gap-2"><Mail size={13} /> {appt.email}</span>
                    {appt.phone && <span className="flex items-center gap-2"><Phone size={13} /> {appt.phone}</span>}
                    <span className="flex items-center gap-2"><User size={13} /> {appt.reason}</span>
                    {appt.preferred_date && (
                      <span className="flex items-center gap-2"><Calendar size={13} /> {appt.preferred_date}</span>
                    )}
                    {appt.created_date && (
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock size={12} /> Submitted: {format(new Date(appt.created_date), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                  {appt.message && <p className="mt-3 text-sm italic text-muted-foreground">"{appt.message}"</p>}
                </div>
                {appt.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(appt, 'confirmed')}
                      className="flex items-center gap-1 px-3 py-2 bg-green-500/10 text-green-400 border border-green-400/30 rounded-lg text-xs font-medium hover:bg-green-500/20 transition-colors">
                      <CheckCircle size={13} /> Confirm
                    </button>
                    <button onClick={() => updateStatus(appt, 'cancelled')}
                      className="flex items-center gap-1 px-3 py-2 bg-red-500/10 text-red-400 border border-red-400/30 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors">
                      <XCircle size={13} /> Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {(!appointments || appointments.length === 0) && (
          <div className="py-16 text-center text-muted-foreground">No appointments yet.</div>
        )}
      </div>
    </div>
  );
}
