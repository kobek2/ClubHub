import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, Copy, Archive, ChevronRight } from 'lucide-react';
import { Event, User } from '../../src/types';
import useFirestore from '../../src/Hooks/useFirestore';

interface EventHistoryProps {
  currentUser: User;
}

export default function EventHistory({ currentUser }: EventHistoryProps) {
  const [events] = useFirestore<Event>('events');
  const [semesterFilter, setSemesterFilter] = useState<string>('');

  const pastEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(e => new Date(e.date) < now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events]);

  const semesters = useMemo(() => {
    const set = new Set<string>();
    pastEvents.forEach(e => {
      if (e.semester) set.add(e.semester);
      if (e.academicYear) set.add(e.academicYear);
      if (!e.semester && !e.academicYear) {
        const d = new Date(e.date);
        const sem = d.getMonth() >= 7 ? 'Fall' : 'Spring';
        set.add(`${sem} ${d.getFullYear()}`);
      }
    });
    return Array.from(set).sort().reverse();
  }, [pastEvents]);

  const filtered = useMemo(() => {
    if (!semesterFilter) return pastEvents;
    return pastEvents.filter(e => 
      e.semester === semesterFilter || 
      e.academicYear === semesterFilter ||
      (() => {
        const d = new Date(e.date);
        const sem = d.getMonth() >= 7 ? 'Fall' : 'Spring';
        return `${sem} ${d.getFullYear()}` === semesterFilter;
      })()
    );
  }, [pastEvents, semesterFilter]);

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Archive size={28} className="text-indigo-600" />
          Event history
        </h1>
        <p className="text-gray-600 mt-1">
          Past events for officer transition. Use them as templates for next semester or year.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-sm font-semibold text-gray-700">Filter by semester / year:</span>
        <select
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium bg-white"
        >
          <option value="">All</option>
          {semesters.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="font-semibold text-gray-600">No past events yet</p>
          <p className="text-sm text-gray-500 mt-1">Completed events will appear here for future officers to reference.</p>
          <Link href="/roadmap" className="inline-block mt-4 text-indigo-600 font-semibold">View roadmap →</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map(event => (
            <li key={event.id}>
              <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:border-indigo-200 transition-colors">
                <div className="flex-1 min-w-0">
                  <Link href={`/events/${event.id}`} className="block group">
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 truncate">{event.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                      <span>{new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                      {event.semester && <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{event.semester}</span>}
                      {event.academicYear && <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{event.academicYear}</span>}
                      {event.location && <span className="truncate">{event.location}</span>}
                    </div>
                  </Link>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/events/${event.id}`}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                    title="View full event"
                  >
                    <ChevronRight size={20} />
                  </Link>
                  <Link
                    href={`/events/new?copyFrom=${event.id}`}
                    className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                  >
                    <Copy size={16} /> Use as template
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
