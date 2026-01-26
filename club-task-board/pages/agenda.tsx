import AgendaBoard from '../src/Components/AgendaBoard';
import { User } from '../src/types';
import useFirestore from '../src/Hooks/useFirestore';
import { Meeting, Task, Event } from '../src/types';

interface AgendaProps {
  currentUser: User;
}

export default function Agenda({ currentUser }: AgendaProps) {
  const [meetings, addMeeting] = useFirestore<Meeting>('meetings');
  const [, addTask] = useFirestore<Task>('tasks');
  const [, addEvent] = useFirestore<Event>('events');

  return (
    <AgendaBoard 
      meetings={meetings} 
      setMeetings={addMeeting}
      currentUser={currentUser}
      setTasks={addTask}
      setEvents={addEvent}
    />
  );
}
