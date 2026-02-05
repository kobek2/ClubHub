import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { X, Trash2, ArrowRight, Copy } from 'lucide-react';
import { Event, Task, User } from '../../src/types';
import useFirestore from '../../src/Hooks/useFirestore';
import { MOCK_USERS } from '../../src/Utils/mockData';

interface NewEventProps {
  currentUser: User;
}

export default function NewEvent({ currentUser }: NewEventProps) {
  const router = useRouter();
  const copyFromId = typeof router.query.copyFrom === 'string' ? router.query.copyFrom : undefined;
  const [events] = useFirestore<Event>('events');
  const [tasks] = useFirestore<Task>('tasks');
  const [, addEvent] = useFirestore<Event>('events');
  const [, addTask] = useFirestore<Task>('tasks');
  
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'> & { copiedFromEventId?: string }>({ 
    title: '', 
    date: '', 
    location: '', 
    description: '' 
  });
  const [newTasks, setNewTasks] = useState<Array<{ 
    title: string; 
    assigneeId: string; 
    priority: string; 
    dueDate: string 
  }>>([]);

  const templateEvent = copyFromId ? events.find(e => e.id === copyFromId) : undefined;
  const templateTasks = templateEvent ? tasks.filter(t => t.eventId === copyFromId) : [];
  const hasAppliedTemplate = useRef(false);

  useEffect(() => {
    if (!copyFromId || !templateEvent || hasAppliedTemplate.current) return;
    hasAppliedTemplate.current = true;
    setNewEvent({
      title: templateEvent.title,
      date: templateEvent.date,
      location: templateEvent.location ?? '',
      description: templateEvent.description ?? '',
      semester: templateEvent.semester,
      academicYear: templateEvent.academicYear,
      copiedFromEventId: templateEvent.id,
    });
    setNewTasks(
      templateTasks.map(t => ({
        title: t.title,
        assigneeId: t.assigneeId,
        priority: (t.priority ?? 'LOW') as string,
        dueDate: t.dueDate ?? '',
      }))
    );
  }, [copyFromId, templateEvent, templateTasks]);

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date) return;

    const eventId = `e${Date.now()}`;
    await addEvent({ 
      ...newEvent, 
      id: eventId,
      createdAt: new Date().toISOString(),
      copiedFromEventId: newEvent.copiedFromEventId,
    });

    for (const t of newTasks) {
      await addTask({
        ...t,
        status: 'TODO',
        eventId: eventId,
        assigneeId: t.assigneeId || MOCK_USERS[0].id,
        priority: (t.priority as 'LOW' | 'MEDIUM' | 'HIGH') || 'LOW',
        createdAt: new Date().toISOString()
      });
    }
    
    router.push('/roadmap');
  };

  const addTempTask = () => {
    setNewTasks([...newTasks, { title: '', assigneeId: MOCK_USERS[0].id, priority: 'LOW', dueDate: '' }]);
  };

  const updateTempTask = (index: number, field: string, value: string) => {
    const updated = [...newTasks];
    (updated[index] as any)[field] = value;
    setNewTasks(updated);
  };

  const removeTempTask = (index: number) => {
    const updated = [...newTasks];
    updated.splice(index, 1);
    setNewTasks(updated);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto">
      <div className="bg-indigo-900 text-white p-6 rounded-t-2xl flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {templateEvent ? (
            <span className="flex items-center gap-2">
              <Copy size={20} /> New from template
            </span>
          ) : (
            'Create New Event'
          )}
        </h2>
        <button 
          onClick={() => router.back()} 
          className="text-indigo-300 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>
      {templateEvent && (
        <div className="px-6 py-2 bg-indigo-50 text-indigo-800 text-sm">
          Based on “{templateEvent.title}”. Edit and create to run it again.
        </div>
      )}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
            <input 
              type="text" 
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={newEvent.title} 
              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              type="date" 
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={newEvent.date} 
              onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input 
              type="text" 
              placeholder="Location" 
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={newEvent.location || ''} 
              onChange={(e) => setNewEvent({...newEvent, location: e.target.value})} 
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
              rows={2} 
              value={newEvent.description || ''} 
              onChange={(e) => setNewEvent({...newEvent, description: e.target.value})} 
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700 uppercase text-xs tracking-widest">Delegated Tasks</h3>
            <button 
              onClick={addTempTask} 
              className="text-indigo-600 text-sm font-bold hover:underline"
            >
              + Add Task
            </button>
          </div>
          {newTasks.map((task, idx) => (
            <div key={idx} className="flex gap-2 mb-2 bg-gray-50 p-2 rounded border border-gray-200 items-center">
              <input 
                className="flex-grow p-1 text-sm bg-transparent border-b border-transparent focus:border-indigo-500 outline-none" 
                placeholder="Task Name" 
                value={task.title} 
                onChange={(e) => updateTempTask(idx, 'title', e.target.value)} 
              />
              <select 
                className="text-xs bg-white border rounded px-1 py-1" 
                value={task.assigneeId} 
                onChange={(e) => updateTempTask(idx, 'assigneeId', e.target.value)}
              >
                {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name.split(' ')[0]}</option>)}
              </select>
              <button 
                onClick={() => removeTempTask(idx)} 
                className="text-gray-400 hover:text-red-500 p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
        <button 
          onClick={() => router.back()} 
          className="text-gray-500 font-medium hover:text-gray-700"
        >
          Cancel
        </button>
        <button 
          onClick={handleCreateEvent} 
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
        >
          Create Event & Tasks <ArrowRight size={16} className="ml-2" />
        </button>
      </div>
    </div>
  );
}
