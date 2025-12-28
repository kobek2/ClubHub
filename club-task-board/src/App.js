import React, { useState } from 'react';
import { Plus, Clock, X, Trash2, ArrowRight } from 'lucide-react';
import useLocalStorage from './hooks/useLocalStorage';
import CalendarGrid from './components/CalendarGrid.js';
import AgendaBoard from './components/AgendaBoard.js';
import EventDetailModal from './components/EventDetailModal.js';
import KanbanColumn from './components/KanbanColumn.js';
import { MOCK_USERS } from './utils/mockData';
import EventsPage from './components/EventsPage.js';

export default function App() {
  // --- STATE ---
  const [currentUser, setCurrentUser] = useState(MOCK_USERS[0]);
  const [tasks, setTasks] = useLocalStorage('clubCommandTasks', []); 
  const [events, setEvents] = useLocalStorage('clubCommandEvents', []); 
  const [meetings, setMeetings] = useLocalStorage('clubCommandMeetings', []); 
  
  // View states: 'TASK_BOARD', 'CALENDAR', 'AGENDA', 'EVENTS_AND_TASKS'
  const [view, setView] = useState('TASK_BOARD'); 
  
  // Modal States
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]); 
  const [newEvent, setNewEvent] = useState({ title: '', date: '', location: '', description: '' });
  const [newTasks, setNewTasks] = useState([]);

  // --- ACTIONS ---

  const handleCalendarEventClick = (eventsArray) => {
    setSelectedDateEvents(eventsArray); 
  };

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date) return;

    const eventId = `e${Date.now()}`;
    const createdEvent = { ...newEvent, id: eventId };

    const createdTasks = newTasks.map((t, idx) => ({
      ...t,
      id: `t${Date.now()}-${idx}`,
      status: 'TODO',
      eventId: eventId
    }));

    setEvents(prev => [...prev, createdEvent]);
    setTasks(prev => [...prev, ...createdTasks]);
    
    setShowEventModal(false);
    setNewEvent({ title: '', date: '', location: '', description: '' });
    setNewTasks([]);
  };

  const addTempTask = () => {
    setNewTasks([...newTasks, { title: '', assigneeId: MOCK_USERS[0].id, priority: 'LOW', dueDate: '' }]);
  };

  const updateTempTask = (index, field, value) => {
    const updated = [...newTasks];
    updated[index][field] = value;
    setNewTasks(updated);
  };

  const removeTempTask = (index) => {
    const updated = [...newTasks];
    updated.splice(index, 1);
    setNewTasks(updated);
  };
  
  const moveTaskStatus = (taskId, newStatus) => {
    setTasks(prevTasks => prevTasks.map(t => {
        if (t.id === taskId) {
            return { ...t, status: newStatus };
        }
        return t;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      
      {/* --- TOP NAVIGATION --- */}
      <nav className="bg-indigo-900 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div 
          onClick={() => setView('TASK_BOARD')} 
          className="flex items-center space-x-2 cursor-pointer"
        >
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold">C</div>
            <span className="font-bold text-lg tracking-wide">ClubHub</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center bg-indigo-800 rounded-lg px-3 py-1">
              <span className="text-xs text-indigo-300 mr-2">Viewing as:</span>
              <select 
                className="bg-transparent text-sm font-semibold focus:outline-none cursor-pointer"
                value={currentUser.id}
                onChange={(e) => setCurrentUser(MOCK_USERS.find(u => u.id === e.target.value))}
              >
                {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentUser.avatar}`}>
              {currentUser.name.charAt(0)}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        
        {/* --- PAGE HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {view === 'AGENDA' ? 'E-Board Agenda' : view === 'CALENDAR' ? 'Club Calendar' : view === 'EVENTS_AND_TASKS' ? 'Semester Roadmap' : 'Task Board'}
            </h1>
          </div>
              
          <div className="flex space-x-3">
            <button 
                onClick={() => setView('EVENTS_AND_TASKS')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'EVENTS_AND_TASKS' ? 'bg-white text-indigo-600 shadow' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
            >
                Roadmap
            </button>
            <button 
                onClick={() => setView('CALENDAR')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'CALENDAR' ? 'bg-white text-indigo-600 shadow' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
            >
                Calendar
            </button>
            <button 
                onClick={() => setView('TASK_BOARD')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'TASK_BOARD' ? 'bg-white text-indigo-600 shadow' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
            >
                Board
            </button>
            <button 
                onClick={() => setView('AGENDA')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'AGENDA' ? 'bg-white text-indigo-600 shadow' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
            >
                Agenda
            </button>
            
            {currentUser.role === 'PRESIDENT' && (
              <button 
                onClick={() => setShowEventModal(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-md transition-all"
              >
                <Plus size={16} className="mr-2" />
                New Event
              </button>
            )}
          </div>
        </header>

        {/* --- MAIN CONTENT AREA --- */}

        {view === 'EVENTS_AND_TASKS' && (
            <EventsPage events={events} tasks={tasks} setTasks={setTasks} />
        )}

        {view === 'TASK_BOARD' && (
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
        )}

        {view === 'CALENDAR' && (
          <div className="bg-white rounded-xl shadow p-6">
            <CalendarGrid events={events} tasks={tasks} onEventClick={handleCalendarEventClick} />
          </div>
        )}

        {view === 'AGENDA' && (
            <AgendaBoard 
                meetings={meetings} setMeetings={setMeetings}
                setTasks={setTasks} currentUser={currentUser}
                events={events} setEvents={setEvents}
            />
        )}
      </div>

      {/* --- MODALS --- */}
      <EventDetailModal
        events={selectedDateEvents}
        tasks={tasks}
        onClose={() => setSelectedDateEvents([])}
      />

      {showEventModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-indigo-900 text-white p-6 rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-xl font-bold">Create New Event</h2>
              <button onClick={() => setShowEventModal(false)} className="text-indigo-300 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Event Title</label>
                    <input type="text" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} />
                  </div>
                  <input type="date" className="border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} />
                  <input type="text" placeholder="Location" className="border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" value={newEvent.location} onChange={(e) => setNewEvent({...newEvent, location: e.target.value})} />
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" rows="2" value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})} />
                  </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-700 uppercase text-xs tracking-widest">Delegated Tasks</h3>
                  <button onClick={addTempTask} className="text-indigo-600 text-sm font-bold hover:underline">+ Add Task</button>
                </div>
                {newTasks.map((task, idx) => (
                    <div key={idx} className="flex gap-2 mb-2 bg-gray-50 p-2 rounded border border-gray-200">
                        <input className="flex-grow p-1 text-sm bg-transparent border-b focus:border-indigo-500 outline-none" placeholder="Task Name" value={task.title} onChange={(e) => updateTempTask(idx, 'title', e.target.value)} />
                        <select className="text-sm bg-transparent" value={task.assigneeId} onChange={(e) => updateTempTask(idx, 'assigneeId', e.target.value)}>
                            {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name.split(' ')[0]}</option>)}
                        </select>
                        <button onClick={() => removeTempTask(idx)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowEventModal(false)} className="text-gray-500 font-medium">Cancel</button>
              <button onClick={handleCreateEvent} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center shadow-lg hover:bg-indigo-700 transition-all">
                Create Event & Tasks <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}