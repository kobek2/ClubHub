import React from 'react';
import TaskCard from './TaskCard';
import { Task, User, Event, Meeting, TaskStatus } from '../types';

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  currentUser: User;
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  events: Event[];
  meetings: Meeting[];
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
  title, 
  status, 
  tasks, 
  currentUser, 
  moveTaskStatus, 
  events, 
  meetings 
}) => (
  <div className="flex-1 bg-gray-50 rounded-xl p-4 min-w-[280px]">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-bold text-gray-700">{title}</h3>
      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">{tasks.length}</span>
    </div>
    <div className="space-y-2">
      {tasks.map(t => (
        <TaskCard 
          key={t.id} 
          task={t} 
          currentUser={currentUser} 
          moveTaskStatus={moveTaskStatus} 
          events={events} 
          meetings={meetings} 
        />
      ))} 
      
      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
          No tasks
        </div>
      )}
    </div>
  </div>
);

export default KanbanColumn;
