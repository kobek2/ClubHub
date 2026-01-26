import EventsPage from '../src/Components/EventsPage';
import { Task, Event, User } from '../src/types';
import useFirestore from '../src/Hooks/useFirestore';

interface RoadmapProps {
  currentUser: User;
}

export default function Roadmap({ currentUser }: RoadmapProps) {
  const [events] = useFirestore<Event>('events');
  const [tasks, addTask] = useFirestore<Task>('tasks');

  return (
    <EventsPage 
      events={events} 
      tasks={tasks} 
      setTasks={async (task) => await addTask(task)} 
    />
  );
}
