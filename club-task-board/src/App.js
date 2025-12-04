import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, X, Trash2, ArrowRight, List, MessageSquare, MapPin } from 'lucide-react';
import useLocalStorage from './hooks/useLocalStorage';
import CalendarGrid from './components/CalendarGrid.js';
import AgendaBoard from './components/AgendaBoard.js';
import EventDetailModal from './components/EventDetailModal.js';
import KanbanColumn from './components/KanbanColumn.js';
import TaskCard from './components/TaskCard.js';
import StatusBadge from './components/StatusBadge.js';
import { MOCK_USERS } from './utils/mockData';

//--- MAIN APPLICATION ---

export default function App() {
  const [currentUser, setCurrentUser] = useState(MOCK_USERS[0]);
  const [tasks, setTasks] = useLocalStorage('clubCommandTasks', []); 
  const [events, setEvents] = useLocalStorage('clubCommandEvents', []); 
  const [meetings, setMeetings] = useLocalStorage('clubCommandMeetings', []); 
  const [view, setView] = useState('DASHBOARD');
  
  // Modal States
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null); // For Calendar Detail Modal
  const [newEvent, setNewEvent] = useState({ title: '', date: '', location: '', description: '' });
  const [newTasks, setNewTasks] = useState([]);

  // --- ACTIONS ---

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date) return console.error("Title and Date are required");

    const eventId = `e${Date.now()}`;
    const createdEvent = { ...newEvent, id: eventId };

    const createdTasks = newTasks.map((t, idx) => ({
      ...t,
      id: `t${Date.now()}-${idx}`,
      status: 'TODO',
      eventId: eventId
    }));

    setEvents(prevEvents => [...prevEvents, createdEvent]);
    setTasks(prevTasks => [...prevTasks, ...createdTasks]);
    
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
  
  // Updated moveTaskStatus function
  const moveTaskStatus = (taskId, newStatus, userId) => {
    setTasks(tasks.map(t => {
        // Only allow status change if the task is assigned to the current user
        if (t.id === taskId && t.assigneeId === userId) {
            return { ...t, status: newStatus };
        }
        return t;
    }));
  };
  
  const handleCalendarEventClick = (event) => {
      setSelectedEvent(event);
  };

  // --- FILTER LOGIC (Now ALL tasks are visible for all users) ---
  const visibleTasks = tasks; 

  // --- SUB-COMPONENTS (TaskCard & KanbanColumn) --- 

  

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      
      {/* --- TOP NAVIGATION --- */}
      <nav className="bg-indigo-900 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
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
              {view === 'AGENDA' ? 'E-Board Agenda & Minutes' : view === 'CALENDAR' ? 'Club Calendar' : 'Task Board'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {view === 'DASHBOARD'
                ? `Total club tasks: ${tasks.length}. You have ${tasks.filter(t => t.assigneeId === currentUser.id && t.status !== 'DONE').length} active tasks.`
                : view === 'AGENDA' ? 'Review past decisions and upcoming discussion topics.'
                : 'View all scheduled events and due dates.'}
            </p>
          </div>

          <div className="flex space-x-3">
             <button 
              onClick={() => setView('CALENDAR')} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'CALENDAR' ? 'bg-white text-indigo-600 shadow' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
            >
              Calendar
            </button>
            <button 
              onClick={() => setView('DASHBOARD')} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'DASHBOARD' ? 'bg-white text-indigo-600 shadow' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
            >
              Task Board
            </button>
             <button 
              onClick={() => setView('AGENDA')} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'AGENDA' ? 'bg-white text-indigo-600 shadow' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
            >
              Agenda
            </button>
            {/* Only President can create events/tasks in this MVP flow */}
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

        {view === 'DASHBOARD' && (
          /* KANBAN BOARD VIEW (Now visible to everyone, showing all tasks) */
          <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4">
            <KanbanColumn 
              title="To Do" 
              status="TODO" 
              tasks={visibleTasks.filter(t => t.status === 'TODO')} 
              currentUser={currentUser}
              moveTaskStatus={moveTaskStatus}
            />
            <KanbanColumn 
              title="In Progress" 
              status="DOING" 
              tasks={visibleTasks.filter(t => t.status === 'DOING')} 
              currentUser={currentUser}
              moveTaskStatus={moveTaskStatus}
            />
            <KanbanColumn 
              title="Completed" 
              status="DONE" 
              tasks={visibleTasks.filter(t => t.status === 'DONE')} 
              currentUser={currentUser}
              moveTaskStatus={moveTaskStatus}
            />
          </div>
        )}
        
        {view === 'CALENDAR' && (
          /* CALENDAR GRID VIEW (Updated with click handler) */
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex space-x-4 text-sm">
                <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
                    Event/Meeting
                </div>
                <div className="flex items-center">
                    <Clock size={16} className="text-red-500 mr-1" />
                    Task Due/Overdue
                </div>
              </div>
            </div>
            
            <CalendarGrid 
                events={events} 
                tasks={tasks} 
                onEventClick={handleCalendarEventClick} 
            />

          </div>
        )}

        {view === 'AGENDA' && (
             /* AGENDA BOARD VIEW (Visible to all, President controls creation/finalization) */
            <AgendaBoard 
                meetings={meetings}
                setMeetings={setMeetings}
                setTasks={setTasks}
                currentUser={currentUser}
                events={events}
                setEvents={setEvents}
            />
        )}

      </div>

      {/* --- EVENT DETAIL MODAL (Triggered by Calendar Click) --- */}
      {/* Note: setSelectedEvent(null) is used to close the modal */}
      <EventDetailModal
        event={selectedEvent}
        tasks={tasks}
        onClose={() => setSelectedEvent(null)}
      />

      {/* --- EVENT CREATION MODAL --- */}
      {showEventModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="bg-indigo-900 text-white p-6 rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold">Create New Event</h2>
                <p className="text-indigo-200 text-xs">Events automatically track associated tasks.</p>
              </div>
              <button onClick={() => setShowEventModal(false)} className="text-indigo-300 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Event Details Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2">1. Event Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                    <input 
                      type="text" 
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                      placeholder="e.g. Spring Fundraiser"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input 
                      type="date" 
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input 
                      type="text" 
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                      placeholder="e.g. Room 204"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                      rows="2"
                      placeholder="What is this event about?"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Task Delegation Section - THE MAGIC MOMENT */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">2. Assign Tasks</h3>
                  <button onClick={addTempTask} className="text-indigo-600 text-sm font-medium hover:underline flex items-center">
                    <Plus size={14} className="mr-1"/> Add Task
                  </button>
                </div>

                {newTasks.length === 0 && (
                  <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed text-gray-400 text-sm">
                    No tasks added yet. Delegate responsibility now to save time later!
                  </div>
                )}

                <div className="space-y-3">
                  {newTasks.map((task, idx) => (
                    <div key={idx} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg border">
                      <div className="flex-grow grid grid-cols-12 gap-2">
                        <div className="col-span-5">
                          <input 
                            type="text" 
                            placeholder="Task Name"
                            className="w-full text-sm p-1 bg-transparent border-b focus:border-indigo-500 outline-none"
                            value={task.title}
                            onChange={(e) => updateTempTask(idx, 'title', e.target.value)}
                          />
                        </div>
                        <div className="col-span-3">
                          <select 
                            className="w-full text-sm p-1 bg-transparent border-b outline-none"
                            value={task.assigneeId}
                            onChange={(e) => updateTempTask(idx, 'assigneeId', e.target.value)}
                          >
                            {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name.split(' ')[0]}</option>)}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <select 
                             className={`w-full text-xs p-1 rounded outline-none font-bold ${task.priority === 'HIGH' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}
                             value={task.priority}
                             onChange={(e) => updateTempTask(idx, 'priority', e.target.value)}
                          >
                            <option value="LOW">Low</option>
                            <option value="HIGH">High</option>
                          </select>
                        </div>
                         <div className="col-span-2">
                          <input 
                            type="date" 
                            className="w-full text-xs p-1 bg-transparent border-b outline-none"
                            value={task.dueDate}
                            onChange={(e) => updateTempTask(idx, 'dueDate', e.target.value)}
                          />
                        </div>
                      </div>
                      <button onClick={() => removeTempTask(idx)} className="text-gray-400 hover:text-red-500 pt-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
              <button 
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateEvent}
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center"
              >
                Create Event & Assign Tasks <ArrowRight size={16} className="ml-2"/>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}