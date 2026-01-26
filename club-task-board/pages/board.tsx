import { useState } from 'react';
import KanbanColumn from '../src/Components/KanbanColumn';
import { Task, Event, Meeting, User } from '../src/types';
import useFirestore from '../src/Hooks/useFirestore';

interface BoardProps {
  currentUser: User;
}

export default function Board({ currentUser }: BoardProps) {
  const [tasks, , updateTask] = useFirestore<Task>('tasks');
  const [events] = useFirestore<Event>('events');
  const [meetings] = useFirestore<Meeting>('meetings');

  const moveTaskStatus = async (taskId: string, newStatus: string) => {
    await updateTask(taskId, { status: newStatus as 'TODO' | 'DOING' | 'DONE' });
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4">
      <KanbanColumn 
        title="To Do" status="TODO" 
        tasks={tasks.filter(t => t.status === 'TODO')} 
        currentUser={currentUser} moveTaskStatus={moveTaskStatus}
        events={events} meetings={meetings}
      />
      <KanbanColumn 
        title="In Progress" status="DOING" 
        tasks={tasks.filter(t => t.status === 'DOING')} 
        currentUser={currentUser} moveTaskStatus={moveTaskStatus}
        events={events} meetings={meetings}
      />
      <KanbanColumn 
        title="Completed" status="DONE" 
        tasks={tasks.filter(t => t.status === 'DONE')} 
        currentUser={currentUser} moveTaskStatus={moveTaskStatus}
        events={events} meetings={meetings}
      />
    </div>
  );
}
