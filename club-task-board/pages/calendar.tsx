import { useState } from 'react';
import CalendarGrid from '../src/Components/CalendarGrid';
import EventDetailModal from '../src/Components/EventDetailModal';
import { Task, Event, User } from '../src/types';
import useFirestore from '../src/Hooks/useFirestore';

interface CalendarProps {
  currentUser: User;
}

export default function Calendar({ currentUser }: CalendarProps) {
  const [events] = useFirestore<Event>('events');
  const [tasks] = useFirestore<Task>('tasks');
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);

  const handleCalendarEventClick = (eventsArray: Event[]) => {
    setSelectedDateEvents(eventsArray);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow p-6">
        <CalendarGrid events={events} tasks={tasks} onEventClick={handleCalendarEventClick} />
      </div>
      <EventDetailModal
        events={selectedDateEvents}
        tasks={tasks}
        onClose={() => setSelectedDateEvents([])}
      />
    </>
  );
}
