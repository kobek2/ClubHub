import React from 'react';
import Link from 'next/link';
import { Calendar, CheckCircle2, Circle, Clock, Trash2, Layout } from 'lucide-react';
import { MOCK_USERS } from '../Utils/mockData';
import { Event, Task } from '../types';

interface EventsPageProps {
  events: Event[];
  tasks: Task[];
  setTasks: (task: Omit<Task, 'id'> & { id?: string }) => Promise<void>;
}

const EventsPage: React.FC<EventsPageProps> = ({ events, tasks, setTasks }) => {
  // Group tasks by eventId for a "Project" view
  const getTasksForEvent = (eventId: string) => tasks.filter(t => t.eventId === eventId);

  const calculateProgress = (eventId: string): number => {
    const eventTasks = getTasksForEvent(eventId);
    if (eventTasks.length === 0) return 0;
    const completed = eventTasks.filter(t => t.status === 'DONE').length;
    return Math.round((completed / eventTasks.length) * 100);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* --- SECTION 1: UPCOMING MILESTONES --- */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <Calendar className="mr-2 text-indigo-600" size={20} />
            Semester Roadmap
          </h2>
          <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
            {events.length} Scheduled Events
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(event => {
            const progress = calculateProgress(event.id);
            const eventTasks = getTasksForEvent(event.id);

            return (
              <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs font-medium text-gray-400 italic">
                      {event.location || 'No Location'}
                    </div>
                  </div>
                  
                  <Link href={`/events/${event.id}`}>
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                      {event.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4 h-8">
                    {event.description || 'Planning in progress...'}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      <span>Preparation</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full transition-all duration-1000" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Task Preview */}
                <div className="bg-gray-50 p-4 border-t border-gray-100">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-3">Action Items</h4>
                  <div className="space-y-2">
                    {eventTasks.slice(0, 3).map(task => (
                      <div key={task.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-700 truncate mr-2">
                          {task.status === 'DONE' ? 
                            <CheckCircle2 size={14} className="text-green-500 mr-2 flex-shrink-0" /> : 
                            <Circle size={14} className="text-gray-300 mr-2 flex-shrink-0" />
                          }
                          <span className={task.status === 'DONE' ? 'line-through text-gray-400' : ''}>
                            {task.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium uppercase">
                          {MOCK_USERS.find(u => u.id === task.assigneeId)?.name.split(' ')[0]}
                        </span>
                      </div>
                    ))}
                    {eventTasks.length > 3 && (
                      <button className="text-[10px] font-bold text-indigo-600 hover:underline">
                        + {eventTasks.length - 3} more tasks
                      </button>
                    )}
                    {eventTasks.length === 0 && (
                      <p className="text-xs italic text-gray-400">No tasks assigned yet.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- SECTION 2: AD-HOC / GENERAL TASKS --- */}
      <section className="bg-indigo-900 rounded-3xl p-8 text-white shadow-xl overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center mb-6">
            <Layout className="mr-3 text-indigo-300" size={24} />
            <div>
              <h2 className="text-xl font-bold">General Operations</h2>
              <p className="text-indigo-200 text-sm">Tasks not tied to a specific event</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.filter(t => !t.eventId || t.eventId === 'MANUAL').map(task => (
              <div key={task.id} className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex justify-between items-center group hover:bg-white/20 transition-all">
                <div>
                  <p className="text-sm font-semibold">{task.title}</p>
                  <div className="flex items-center mt-1 space-x-3 text-[10px] text-indigo-200 font-bold uppercase tracking-widest">
                    <span className="flex items-center"><Clock size={10} className="mr-1"/> {task.dueDate || 'No Date'}</span>
                    <span>•</span>
                    <span>{MOCK_USERS.find(u => u.id === task.assigneeId)?.name}</span>
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    // Note: This would need a delete function from useFirestore
                    // For now, this is a placeholder - you'd need to add delete functionality
                    console.log('Delete task:', task.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Decorative background circle */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
      </section>
    </div>
  );
};

export default EventsPage;
