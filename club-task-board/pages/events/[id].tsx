import { useRouter } from 'next/router';
import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Lightbulb,
  DollarSign,
  Users,
  ClipboardList,
  MessageSquare,
  Calendar,
  MapPin,
  Copy,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Event, Task, User, EventBudget, EventContact, EventReflection } from '../../src/types';
import useFirestore from '../../src/Hooks/useFirestore';
import { MOCK_USERS } from '../../src/Utils/mockData';

interface EventDetailProps {
  currentUser: User;
}

export default function EventDetail({ currentUser }: EventDetailProps) {
  const router = useRouter();
  const { id } = router.query;
  const [events, , updateEvent] = useFirestore<Event>('events');
  const [tasks] = useFirestore<Task>('tasks');
  const [editing, setEditing] = useState<string | null>(null);

  const event = events.find(e => e.id === id);
  const eventTasks = tasks.filter(t => t.eventId === id);

  if (!id || !event) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-gray-500">Event not found.</p>
        <Link href="/roadmap" className="text-indigo-600 font-semibold mt-4 inline-block">← Back to Roadmap</Link>
      </div>
    );
  }

  const isPast = new Date(event.date) < new Date();
  const statusLabel = event.status || (isPast ? 'completed' : 'planning');

  const handleUpdate = async (updates: Partial<Event>) => {
    await updateEvent(event.id, updates);
    setEditing(null);
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/roadmap" className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
            {event.location && <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>}
            {event.semester && <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold">{event.semester}</span>}
            {event.academicYear && <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{event.academicYear}</span>}
            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-semibold capitalize">{statusLabel}</span>
          </div>
        </div>
        <Link
          href={`/events/new?copyFrom=${event.id}`}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
        >
          <Copy size={16} /> Use as template
        </Link>
      </div>

      {event.description && (
        <p className="text-gray-600 mb-8 pb-8 border-b">{event.description}</p>
      )}

      {/* Timeline sections */}
      <div className="space-y-4">
        {/* 1. Ideation */}
        <Section
          icon={Lightbulb as React.ComponentType<{ size?: number }>}
          title="Ideation"
          subtitle="Goals and initial ideas"
          isOpen={editing === 'ideation'}
          onToggle={() => setEditing(editing === 'ideation' ? null : 'ideation')}
        >
          {event.ideation ? (
            <div className="space-y-2 text-sm">
              {event.ideation.goals && <p><span className="font-semibold text-gray-700">Goals:</span> {event.ideation.goals}</p>}
              {event.ideation.notes && <p><span className="font-semibold text-gray-700">Notes:</span> {event.ideation.notes}</p>}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No ideation notes yet.</p>
          )}
          {editing === 'ideation' && (
            <IdeationForm
              ideation={event.ideation}
              onSave={(ideation) => handleUpdate({ ideation })}
              onCancel={() => setEditing(null)}
            />
          )}
        </Section>

        {/* 2. Budget & Contacts */}
        <Section
          icon={DollarSign as React.ComponentType<{ size?: number }>}
          title="Budget & contacts"
          subtitle="Projected vs actual, key contacts"
          isOpen={editing === 'budget'}
          onToggle={() => setEditing(editing === 'budget' ? null : 'budget')}
        >
          {event.budget && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              {event.budget.projectedTotal != null && <div><span className="text-gray-500 text-sm">Projected</span> <p className="font-bold">${event.budget.projectedTotal}</p></div>}
              {event.budget.actualTotal != null && <div><span className="text-gray-500 text-sm">Actual</span> <p className="font-bold">${event.budget.actualTotal}</p></div>}
              {event.budget.notes && <p className="col-span-2 text-sm text-gray-600">{event.budget.notes}</p>}
              {event.budget.breakdown && event.budget.breakdown.length > 0 && (
                <div className="col-span-2 mt-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Breakdown</p>
                  <ul className="space-y-1 text-sm">
                    {event.budget.breakdown.map((line, i) => (
                      <li key={i} className="flex justify-between"><span>{line.item}</span><span>${line.amount}</span></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {event.contacts && event.contacts.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Contacts</p>
              <ul className="space-y-2 text-sm">
                {event.contacts.map((c, i) => (
                  <li key={i} className="flex justify-between items-start"><span>{c.name} ({c.role})</span>{c.email && <a href={`mailto:${c.email}`} className="text-indigo-600">{c.email}</a>}</li>
                ))}
              </ul>
            </div>
          )}
          {!event.budget && (!event.contacts || event.contacts.length === 0) && <p className="text-gray-400 text-sm">No budget or contacts yet.</p>}
          {editing === 'budget' && (
            <BudgetContactsForm
              budget={event.budget}
              contacts={event.contacts}
              onSave={(budget, contacts) => handleUpdate({ budget, contacts })}
              onCancel={() => setEditing(null)}
            />
          )}
        </Section>

        {/* 3. Attendance */}
        <Section
          icon={Users as React.ComponentType<{ size?: number }>}
          title="Attendance"
          subtitle="Projected vs actual"
          isOpen={editing === 'attendance'}
          onToggle={() => setEditing(editing === 'attendance' ? null : 'attendance')}
        >
          {event.attendance ? (
            <div className="flex gap-6 text-sm">
              {event.attendance.projected != null && <div><span className="text-gray-500">Projected</span> <p className="font-bold">{event.attendance.projected}</p></div>}
              {event.attendance.actual != null && <div><span className="text-gray-500">Actual</span> <p className="font-bold">{event.attendance.actual}</p></div>}
              {event.attendance.notes && <p className="text-gray-600">{event.attendance.notes}</p>}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No attendance data yet.</p>
          )}
          {editing === 'attendance' && (
            <AttendanceForm
              attendance={event.attendance}
              onSave={(attendance) => handleUpdate({ attendance })}
              onCancel={() => setEditing(null)}
            />
          )}
        </Section>

        {/* 4. Tasks */}
        <Section icon={ClipboardList as React.ComponentType<{ size?: number }>} title="Action items" subtitle={`${eventTasks.filter(t => t.status === 'DONE').length} of ${eventTasks.length} done`} isOpen={true} onToggle={() => {}}>
          <ul className="space-y-2 text-sm">
            {eventTasks.map(t => {
              const u = MOCK_USERS.find(u => u.id === t.assigneeId);
              return (
                <li key={t.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className={t.status === 'DONE' ? 'line-through text-gray-500' : ''}>{t.title}</span>
                  <span className="text-gray-500">{u?.name?.split(' ')[0]} · {t.status}</span>
                </li>
              );
            })}
            {eventTasks.length === 0 && <p className="text-gray-400">No tasks for this event.</p>}
          </ul>
        </Section>

        {/* 5. Reflection */}
        <Section
          icon={MessageSquare as React.ComponentType<{ size?: number }>}
          title="Reflection"
          subtitle="What worked, what didn’t, improvements"
          isOpen={editing === 'reflection'}
          onToggle={() => setEditing(editing === 'reflection' ? null : 'reflection')}
        >
          {event.reflection ? (
            <div className="space-y-3 text-sm">
              {event.reflection.whatWorked && <p><span className="font-semibold text-gray-700">What worked:</span> {event.reflection.whatWorked}</p>}
              {event.reflection.whatDidnt && <p><span className="font-semibold text-gray-700">What didn’t:</span> {event.reflection.whatDidnt}</p>}
              {event.reflection.improvements && <p><span className="font-semibold text-gray-700">Improvements:</span> {event.reflection.improvements}</p>}
              {event.reflection.metrics && <p><span className="font-semibold text-gray-700">Metrics:</span> {event.reflection.metrics}</p>}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No reflection yet. Add notes for future officers.</p>
          )}
          {editing === 'reflection' && (
            <ReflectionForm
              reflection={event.reflection}
              onSave={(reflection) => handleUpdate({ reflection })}
              onCancel={() => setEditing(null)}
            />
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  subtitle,
  isOpen,
  onToggle,
  children,
}: {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  subtitle: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50"
      >
        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        {isOpen ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
      </button>
      {(isOpen || title === 'Action items') && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function IdeationForm({
  ideation,
  onSave,
  onCancel,
}: {
  ideation?: Event['ideation'];
  onSave: (v: Event['ideation']) => void;
  onCancel: () => void;
}) {
  const [goals, setGoals] = useState(ideation?.goals ?? '');
  const [notes, setNotes] = useState(ideation?.notes ?? '');
  return (
    <div className="mt-4 space-y-3 p-4 bg-gray-50 rounded-lg">
      <label className="block text-sm font-semibold">Goals</label>
      <textarea value={goals} onChange={e => setGoals(e.target.value)} className="w-full border rounded-lg p-2 text-sm" rows={2} />
      <label className="block text-sm font-semibold">Notes</label>
      <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full border rounded-lg p-2 text-sm" rows={2} />
      <div className="flex gap-2">
        <button type="button" onClick={() => onSave({ goals, notes, updatedAt: new Date().toISOString() })} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold">Save</button>
        <button type="button" onClick={onCancel} className="px-3 py-1.5 bg-gray-200 rounded-lg text-sm">Cancel</button>
      </div>
    </div>
  );
}

function BudgetContactsForm({
  budget,
  contacts,
  onSave,
  onCancel,
}: {
  budget?: EventBudget;
  contacts?: EventContact[];
  onSave: (budget: EventBudget, contacts: EventContact[]) => void;
  onCancel: () => void;
}) {
  const [projectedTotal, setProjectedTotal] = useState(budget?.projectedTotal ?? '');
  const [actualTotal, setActualTotal] = useState(budget?.actualTotal ?? '');
  const [budgetNotes, setBudgetNotes] = useState(budget?.notes ?? '');
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactList, setContactList] = useState<EventContact[]>(contacts ?? []);

  const addContact = () => {
    if (contactName.trim()) {
      setContactList([...contactList, { name: contactName.trim(), role: contactRole.trim(), email: contactEmail.trim() || undefined }]);
      setContactName(''); setContactRole(''); setContactEmail('');
    }
  };

  return (
    <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold">Projected total ($)</label>
          <input type="number" value={projectedTotal} onChange={e => setProjectedTotal(e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold">Actual total ($)</label>
          <input type="number" value={actualTotal} onChange={e => setActualTotal(e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold">Budget notes</label>
        <textarea value={budgetNotes} onChange={e => setBudgetNotes(e.target.value)} className="w-full border rounded-lg p-2 text-sm" rows={2} />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Contacts</label>
        <div className="flex gap-2 mb-2">
          <input placeholder="Name" value={contactName} onChange={e => setContactName(e.target.value)} className="flex-1 border rounded p-2 text-sm" />
          <input placeholder="Role" value={contactRole} onChange={e => setContactRole(e.target.value)} className="flex-1 border rounded p-2 text-sm" />
          <input placeholder="Email" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="flex-1 border rounded p-2 text-sm" />
          <button type="button" onClick={addContact} className="px-3 py-2 bg-indigo-600 text-white rounded text-sm font-semibold">Add</button>
        </div>
        <ul className="text-sm text-gray-700">
          {contactList.map((c, i) => (
            <li key={i}>{c.name} – {c.role} {c.email && `(${c.email})`}</li>
          ))}
        </ul>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => onSave(
          { projectedTotal: projectedTotal ? Number(projectedTotal) : undefined, actualTotal: actualTotal ? Number(actualTotal) : undefined, notes: budgetNotes || undefined, updatedAt: new Date().toISOString() },
          contactList
        )} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold">Save</button>
        <button type="button" onClick={onCancel} className="px-3 py-1.5 bg-gray-200 rounded-lg text-sm">Cancel</button>
      </div>
    </div>
  );
}

function AttendanceForm({
  attendance,
  onSave,
  onCancel,
}: {
  attendance?: Event['attendance'];
  onSave: (v: Event['attendance']) => void;
  onCancel: () => void;
}) {
  const [projected, setProjected] = useState(attendance?.projected ?? '');
  const [actual, setActual] = useState(attendance?.actual ?? '');
  const [notes, setNotes] = useState(attendance?.notes ?? '');
  return (
    <div className="mt-4 space-y-3 p-4 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold">Projected</label>
          <input type="number" value={projected} onChange={e => setProjected(e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold">Actual</label>
          <input type="number" value={actual} onChange={e => setActual(e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold">Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full border rounded-lg p-2 text-sm" rows={2} />
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => onSave({ projected: projected ? Number(projected) : undefined, actual: actual ? Number(actual) : undefined, notes: notes || undefined, updatedAt: new Date().toISOString() })} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold">Save</button>
        <button type="button" onClick={onCancel} className="px-3 py-1.5 bg-gray-200 rounded-lg text-sm">Cancel</button>
      </div>
    </div>
  );
}

function ReflectionForm({
  reflection,
  onSave,
  onCancel,
}: {
  reflection?: EventReflection;
  onSave: (v: EventReflection) => void;
  onCancel: () => void;
}) {
  const [whatWorked, setWhatWorked] = useState(reflection?.whatWorked ?? '');
  const [whatDidnt, setWhatDidnt] = useState(reflection?.whatDidnt ?? '');
  const [improvements, setImprovements] = useState(reflection?.improvements ?? '');
  const [metrics, setMetrics] = useState(reflection?.metrics ?? '');
  return (
    <div className="mt-4 space-y-3 p-4 bg-gray-50 rounded-lg">
      <div>
        <label className="block text-sm font-semibold">What worked</label>
        <textarea value={whatWorked} onChange={e => setWhatWorked(e.target.value)} className="w-full border rounded-lg p-2 text-sm" rows={2} />
      </div>
      <div>
        <label className="block text-sm font-semibold">What didn’t</label>
        <textarea value={whatDidnt} onChange={e => setWhatDidnt(e.target.value)} className="w-full border rounded-lg p-2 text-sm" rows={2} />
      </div>
      <div>
        <label className="block text-sm font-semibold">Improvements for next time</label>
        <textarea value={improvements} onChange={e => setImprovements(e.target.value)} className="w-full border rounded-lg p-2 text-sm" rows={2} />
      </div>
      <div>
        <label className="block text-sm font-semibold">Metrics / outcomes</label>
        <textarea value={metrics} onChange={e => setMetrics(e.target.value)} className="w-full border rounded-lg p-2 text-sm" rows={2} />
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => onSave({ whatWorked, whatDidnt, improvements, metrics, completedAt: new Date().toISOString() })} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold">Save</button>
        <button type="button" onClick={onCancel} className="px-3 py-1.5 bg-gray-200 rounded-lg text-sm">Cancel</button>
      </div>
    </div>
  );
}
