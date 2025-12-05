import React, { useState, useEffect } from 'react'; 
import { Calendar, Plus, X, Trash2, List, MessageSquare, Package, DollarSign } from 'lucide-react';

// MOCK_USERS must be defined in your actual project setup 
const MOCK_USERS = [
    { id: 'u1', name: 'President Alice', role: 'PRESIDENT' },
    { id: 'u2', name: 'Secretary Bob', role: 'SECRETARY' },
    { id: 'u3', name: 'Treasurer Charlie', role: 'TREASURER' },
];


// =================================================================================
// 🚨 DEFINITIVE FIX COMPONENT: PlanningBlockRenderer is now a stable, memoized component
//    It is defined OUTSIDE the AgendaBoard function to prevent unnecessary re-creation.
// =================================================================================
const PlanningBlockRenderer = React.memo(({ block, onUpdate, onRemove, isEditable }) => {
    if (block.type !== 'EVENT_PLAN') return null;

    return (
        <div className="bg-white border-2 border-green-200 rounded-lg p-4 shadow-md mb-4">
            <div className="flex justify-between items-center border-b pb-2 mb-3">
                <h4 className="font-bold text-green-700 flex items-center">
                    <Package size={18} className="mr-2" />
                    Event Planning Details
                </h4>
                {isEditable && (
                    <button onClick={() => onRemove(block.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <label className="block">
                    <span className="text-gray-600">Event Name:</span>
                    <input 
                        type="text" 
                        value={block.data.name} 
                        onChange={(e) => onUpdate(block.id, 'name', e.target.value)} 
                        className="w-full border-b focus:border-green-500 outline-none p-1"
                        disabled={!isEditable}
                    />
                </label>
                <label className="block">
                    <span className="text-gray-600">Location:</span>
                    <input 
                        type="text" 
                        value={block.data.location} 
                        onChange={(e) => onUpdate(block.id, 'location', e.target.value)} 
                        className="w-full border-b focus:border-green-500 outline-none p-1"
                        disabled={!isEditable}
                    />
                </label>
                <label className="block">
                    <span className="text-gray-600">Date/Time:</span>
                    <input 
                        type="text" 
                        value={block.data.date} 
                        onChange={(e) => onUpdate(block.id, 'date', e.target.value)} 
                        className="w-full border-b focus:border-green-500 outline-none p-1"
                        disabled={!isEditable}
                    />
                </label>
                <label className="block">
                    <span className="text-gray-600">Marketing Status:</span>
                    <select 
                        value={block.data.marketingStatus} 
                        onChange={(e) => onUpdate(block.id, 'marketingStatus', e.target.value)} 
                        className="w-full border-b focus:border-green-500 outline-none p-1 bg-white"
                        disabled={!isEditable}
                    >
                        <option>Draft</option>
                        <option>Review</option>
                        <option>Approved</option>
                        <option>Launched</option>
                    </select>
                </label>
            </div>
        </div>
    );
});
// =================================================================================


const AgendaBoard = ({ meetings, setMeetings, setTasks, currentUser, events, setEvents }) => {
  // --- Define local state variables here ---
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingDate, setNewMeetingDate] = useState('');
  const [newAgenda, setNewAgenda] = useState([]); 
  const [planningBlocks, setPlanningBlocks] = useState([]);


  // Effect to load notes AND planning blocks when a meeting is selected
  useEffect(() => {
    if (selectedMeeting) {
      setNoteContent(selectedMeeting.notes || '');
      setPlanningBlocks(selectedMeeting.planningBlocks || []);
    } else {
      setNoteContent('');
      setPlanningBlocks([]);
    }
  }, [selectedMeeting]);


  // Helper to find assignee by first name 
  const findAssigneeId = (text) => {
    const userMap = MOCK_USERS.reduce((acc, user) => {
      const firstName = user.name.split(' ')[0].toLowerCase();
      acc[firstName] = user.id;
      return acc;
    }, {});
    
    for (const name in userMap) {
      if (text.toLowerCase().includes(name)) {
        return userMap[name];
      }
    }
    return MOCK_USERS[0].id; // Default to President if not found
  };
    
  // --- AGENDA MANAGEMENT FUNCTIONS (Confirmed working) ---

  const handleAddMainItem = () => {
    setNewAgenda(prev => [
      ...prev,
      { id: Date.now(), title: '', subItems: [] }
    ]);
  };
  
  const handleRemoveItem = (id) => {
    setNewAgenda(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id, title) => {
    setNewAgenda(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, title };
      }
      return item;
    }));
  };
  
  const handleAddSubItem = (mainId) => {
    setNewAgenda(prev => prev.map(item => {
      if (item.id === mainId) {
        return {
          ...item,
          subItems: [...item.subItems, { id: Date.now() + Math.random(), title: '' }]
        };
      }
      return item;
    }));
  };

  const handleUpdateSubItem = (mainId, subId, newTitle) => {
    setNewAgenda(prev => prev.map(mainItem => {
        if (mainItem.id === mainId) {
            return {
                ...mainItem,
                subItems: mainItem.subItems.map(subItem => 
                    subItem.id === subId ? { ...subItem, title: newTitle } : subItem
                )
            };
        }
        return mainItem;
    }));
  };
  
  const handleRemoveSubItem = (mainId, subId) => {
    setNewAgenda(prev => prev.map(mainItem => {
        if (mainItem.id === mainId) {
            return {
                ...mainItem,
                subItems: mainItem.subItems.filter(subItem => subItem.id !== subId)
            };
        }
        return mainItem;
    }));
  };

  // --- PLANNING BLOCK MANAGEMENT FUNCTIONS (FIXED) ---

  const handleCreatePlanningBlock = (type) => {
    const newBlock = {
      id: `pb${Date.now()}`,
      type: type, 
      title: `New ${type.replace('_', ' ')}`,
      data: type === 'EVENT_PLAN' 
        ? { name: '', location: '', date: '', marketingStatus: 'Draft' } 
        : { estimated: '', actual: '', category: '' },
      status: 'ACTIVE',
    };
    setPlanningBlocks(prev => [...prev, newBlock]);
  };

  // 🚨 HARDENED FIX: Ensures immutability for nested objects
  const handleUpdatePlanningBlock = (blockId, field, value) => {
    setPlanningBlocks(prev => prev.map(block => {
      if (block.id === blockId) {
        const newBlockData = {
            ...block.data,
            [field]: value, // Apply the update
        };
        
        return {
          ...block,
          data: newBlockData, // Return the block with the NEW data object
        };
      }
      return block;
    }));
  };

  const handleRemovePlanningBlock = (blockId) => {
    setPlanningBlocks(prev => prev.filter(block => block.id !== blockId));
  };

  // --- CORE AI PARSING LOGIC & FINALIZATION ---
  const handleGenerateTasksFromNotes = () => {
    if (!selectedMeeting || selectedMeeting.status === 'COMPLETED' || currentUser.role !== 'PRESIDENT') return;

    const actionRegex = /ACTION:\s*(.*?)(?:\s+Assignee:\s*(\w+))?(?:\s+Due:\s*(\S+))?(?:\s+Priority:\s*(HIGH|LOW))?/gi;
    let match;
    
    const generatedTasks = [];
    const createdTaskIds = [];

    // 1. Process notes line by line for 'ACTION:'
    while ((match = actionRegex.exec(noteContent)) !== null) {
      const [fullMatch, title, assigneeName, dueDate, priority] = match;
      const assigneeId = findAssigneeId(fullMatch); 
      
      const newTask = {
        id: `t${Date.now()}-${generatedTasks.length}`,
        title: title.trim() || 'Untitled Task from Meeting',
        assigneeId: assigneeId,
        priority: (priority && priority.toUpperCase() === 'HIGH') ? 'HIGH' : 'LOW',
        dueDate: dueDate || '',
        status: 'TODO',
        meetingId: selectedMeeting.id,
      };
      generatedTasks.push(newTask);
      createdTaskIds.push(newTask.id);
    }
    
    if (generatedTasks.length === 0) {
        console.warn("No 'ACTION:' items found to generate tasks. Proceeding with finalization.");
    }

    // 2. Update global tasks and meeting status
    setTasks(prevTasks => [...prevTasks, ...generatedTasks]);
    
    // Save the current state of planningBlocks back to the meeting object
    setMeetings(prevMeetings => prevMeetings.map(m => 
        m.id === selectedMeeting.id 
            ? { 
                ...m, 
                notes: noteContent, 
                planningBlocks: planningBlocks, 
                status: 'COMPLETED', 
                generatedTasks: createdTaskIds 
              }
            : m
    ));

    setSelectedMeeting(prev => ({ 
        ...prev, 
        notes: noteContent, 
        planningBlocks: planningBlocks, 
        status: 'COMPLETED', 
        generatedTasks: createdTaskIds 
    }));
    
    console.log(`Successfully finalized meeting. Tasks created: ${generatedTasks.length}`);
  };

  const handleSaveMeeting = () => {
    if (selectedMeeting && currentUser.role === 'PRESIDENT') {
      setMeetings(prevMeetings => prevMeetings.map(m => 
        m.id === selectedMeeting.id 
            ? { ...m, notes: noteContent, planningBlocks: planningBlocks }
            : m
      ));
      setSelectedMeeting(prev => ({ ...prev, notes: noteContent, planningBlocks: planningBlocks }));
      alert('Notes and Planning Blocks saved!');
    }
  };

  const handleCreateNewMeeting = () => {
    if (!newMeetingTitle || !newMeetingDate) {
        return alert("Meeting Title and Date are required.");
    }
    if (currentUser.role !== 'PRESIDENT') return;

    const meetingId = `m${Date.now()}`;
    const newMeeting = {
      id: meetingId,
      date: newMeetingDate,
      title: newMeetingTitle,
      agendaItems: newAgenda, 
      notes: '',
      status: 'PLANNED',
      generatedTasks: [],
      planningBlocks: [], 
    };

    setMeetings(prevMeetings => [...prevMeetings, newMeeting]);
    
    setEvents(prevEvents => [...prevEvents, {
        id: `e${Date.now()}`,
        title: newMeetingTitle,
        date: newMeetingDate,
        location: 'E-Board Meeting Room',
        description: 'Scheduled Executive Board Meeting',
        type: 'MEETING'
    }]);

    setNewMeetingTitle('');
    setNewMeetingDate('');
    setNewAgenda([]); 
  };

  const upcomingMeetings = meetings.filter(m => m.status === 'PLANNED').sort((a, b) => new Date(a.date) - new Date(b.date));
  const pastMeetings = meetings.filter(m => m.status === 'COMPLETED').sort((a, b) => new Date(b.date) - new Date(a.date));


  return (
    <div className="flex gap-6 h-full">
      {/* Sidebar: Meeting List */}
      <div className="w-1/3 min-w-[300px] bg-white rounded-xl shadow p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-indigo-700 border-b pb-2">Meeting History</h3>
        
        {/* Create New Meeting Section */}
        {(
             <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <h4 className="font-semibold text-sm mb-2 text-indigo-800">Schedule New Meeting</h4>
                <input 
                    type="text" 
                    placeholder="Meeting Title" 
                    className="w-full text-sm p-1 mb-1 border rounded"
                    value={newMeetingTitle}
                    onChange={(e) => setNewMeetingTitle(e.target.value)}
                />
                <input 
                    type="date" 
                    className="w-full text-sm p-1 mb-2 border rounded"
                    value={newMeetingDate}
                    onChange={(e) => setNewMeetingDate(e.target.value)}
                />
                
                <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Agenda Items</label>
                <div className="space-y-2 mb-2">
                    {newAgenda.map(mainItem => (
                        <div key={mainItem.id} className="bg-white p-2 rounded border border-indigo-300">
                            {/* Main Item Input */}
                            <div className="flex items-center space-x-2">
                                <input 
                                    type="text" 
                                    placeholder="Main Agenda Topic" 
                                    className="flex-grow text-sm p-1 border-b border-gray-200 focus:border-indigo-500 outline-none font-medium"
                                    value={mainItem.title}
                                    onChange={(e) => handleUpdateItem(mainItem.id, e.target.value)}
                                />
                                <button onClick={() => handleAddSubItem(mainItem.id)} title="Add Sub-item" className="text-indigo-500 hover:text-indigo-700 p-1 rounded-full hover:bg-indigo-100 transition-colors">
                                    <Plus size={14} />
                                </button>
                                <button onClick={() => handleRemoveItem(mainItem.id)} title="Remove Item" className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-100 transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            
                            {/* Sub-Items */}
                            <div className="ml-6 mt-1 space-y-1">
                                {mainItem.subItems.map(subItem => (
                                    <div key={subItem.id} className="flex items-center group">
                                        <span className="text-gray-500 mr-2 text-xs font-bold">»</span>
                                        <input 
                                            type="text" 
                                            placeholder="Sub-item / Discussion Point" 
                                            className="w-full text-xs p-1 border-b border-gray-100 focus:border-indigo-500 outline-none"
                                            value={subItem.title}
                                            onChange={(e) => handleUpdateSubItem(mainItem.id, subItem.id, e.target.value)}
                                        />
                                        <button 
                                            onClick={() => handleRemoveSubItem(mainItem.id, subItem.id)} 
                                            title="Remove Sub-item" 
                                            className="text-gray-300 hover:text-red-500 p-1 transition-colors ml-1"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    
                    <button 
                        onClick={handleAddMainItem}
                        className="w-full text-indigo-600 text-xs font-medium py-1.5 rounded border border-dashed border-indigo-300 hover:bg-indigo-100 transition-colors mt-2"
                    >
                        + Add Main Agenda Item
                    </button>
                </div>
                
                <button 
                    onClick={handleCreateNewMeeting}
                    className="w-full bg-indigo-600 text-white text-xs font-medium py-1.5 rounded hover:bg-indigo-700 transition-colors"
                >
                    Create Meeting
                </button>
            </div>
        )}

        <h4 className="font-semibold mt-4 text-gray-700">Upcoming ({upcomingMeetings.length})</h4>
        {upcomingMeetings.map(m => (
          <div 
            key={m.id} 
            onClick={() => setSelectedMeeting(m)}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedMeeting?.id === m.id ? 'bg-indigo-200 border-indigo-500 border-l-4' : 'bg-gray-50 hover:bg-gray-100'}`}
          >
            <p className="text-sm font-semibold">{m.title}</p>
            <p className="text-xs text-gray-600 flex items-center mt-0.5">
                <Calendar size={12} className="mr-1" />
                {new Date(m.date).toLocaleDateString()}
            </p>
          </div>
        ))}

        <h4 className="font-semibold mt-4 text-gray-700">Past ({pastMeetings.length})</h4>
        {pastMeetings.map(m => (
          <div 
            key={m.id} 
            onClick={() => setSelectedMeeting(m)}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedMeeting?.id === m.id ? 'bg-indigo-200 border-indigo-500 border-l-4' : 'bg-gray-50 hover:bg-gray-100'}`}
          >
            <p className="text-sm font-semibold text-gray-500">{m.title}</p>
             <p className="text-xs text-green-600 flex items-center mt-0.5">
                <List size={12} className="mr-1" />
                {m.generatedTasks.length} Tasks Created
            </p>
          </div>
        ))}
      </div>

      {/* Main Content: Agenda, Planning Blocks & Note Taking */}
      <div className="flex-1 bg-white rounded-xl shadow p-6 max-h-[70vh] overflow-y-auto">
        {!selectedMeeting ? (
          <div className="text-center py-20 text-gray-400">
            <MessageSquare size={48} className="mx-auto mb-4" />
            <p className="text-lg">Select a meeting from the left sidebar to view the agenda and notes.</p>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-start border-b pb-3 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedMeeting.title}</h2>
                <p className="text-gray-500 flex items-center mt-1">
                    <Calendar size={16} className="mr-2" />
                    {new Date(selectedMeeting.date).toLocaleDateString()}
                    <span className={`ml-4 px-2 py-0.5 rounded-full text-xs font-bold ${selectedMeeting.status === 'PLANNED' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {selectedMeeting.status}
                    </span>
                </p>
              </div>
              <div className='space-x-2'>
                {/* FINALIZE BUTTON */}
                {selectedMeeting.status === 'PLANNED' && currentUser.role === 'PRESIDENT' ? (
                  <button 
                    onClick={handleGenerateTasksFromNotes}
                    className="px-4 py-2 text-sm bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                  >
                    <List size={16} className="mr-2"/> Generate Tasks & Finalize
                  </button>
                ) : (
                  <span className="text-sm text-green-600 font-medium">{selectedMeeting.status === 'COMPLETED' ? `Tasks Generated (${selectedMeeting.generatedTasks.length})` : ''}</span>
                )}
                 {selectedMeeting.status === 'PLANNED' && currentUser.role !== 'PRESIDENT' && (
                    <span className="text-sm text-gray-500 italic">Reviewing Agenda...</span>
                )}
              </div>
            </div>

            {/* PLANNED AGENDA DISPLAY */}
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Planned Agenda</h3>
            <ul className="list-disc list-inside bg-gray-50 p-4 rounded-lg mb-6">
                {selectedMeeting.agendaItems.length > 0 ? (
                    selectedMeeting.agendaItems.map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 font-semibold mt-1">
                            {item.title}
                            {/* Check for and render sub-items */}
                            {item.subItems && item.subItems.length > 0 && (
                                <ul className="list-circle list-inside ml-4 text-sm font-normal">
                                    {item.subItems.map((subItem, subIndex) => (
                                        <li key={subIndex} className="text-gray-600">{subItem.title}</li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))
                ) : (
                    <li className="text-sm text-gray-400 italic">No specific agenda items set.</li>
                )}
            </ul>
            
            {/* LIVE PLANNING BLOCKS SECTION */}
            <h3 className="text-xl font-bold text-indigo-700 mt-6 border-b pb-2 mb-4 flex justify-between items-center">
                Live Planning Data
                {selectedMeeting.status === 'PLANNED' && currentUser.role === 'PRESIDENT' && (
                    <div className="space-x-2">
                        <button 
                            onClick={() => handleCreatePlanningBlock('EVENT_PLAN')}
                            className="px-3 py-1 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
                        >
                            <Package size={14} className="mr-1" /> Add Event Block
                        </button>
                    </div>
                )}
            </h3>
            
            <div className="space-y-4">
                {planningBlocks.length === 0 ? (
                    <p className="text-gray-500 italic text-sm">No structured planning items added for this meeting yet.</p>
                ) : (
                    planningBlocks.map(block => (
                        <PlanningBlockRenderer 
                            key={block.id} 
                            block={block} 
                            onUpdate={handleUpdatePlanningBlock}
                            onRemove={handleRemovePlanningBlock}
                            isEditable={selectedMeeting.status === 'PLANNED' && currentUser.role === 'PRESIDENT'}
                        />
                    ))
                )}
            </div>

            {/* Note Taking Area */}
            <h3 className="text-lg font-semibold text-gray-700 mb-2 mt-6 flex justify-between items-center">
                Meeting Notes / Minutes
                {/* REPOSITIONED SAVE NOTES BUTTON HERE */}
                {selectedMeeting.status === 'PLANNED' && currentUser.role === 'PRESIDENT' && (
                    <button 
                        onClick={handleSaveMeeting}
                        className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Save Notes & Planning
                    </button>
                )}
            </h3>
            <textarea 
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[250px] font-mono text-sm"
              placeholder={currentUser.role === 'PRESIDENT' ? 
                           `Enter official minutes here. Use "ACTION: Task Assignee: Name Due: Date" to generate tasks. (Structured planning details are above).` :
                           `Viewing official notes.`}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              disabled={selectedMeeting.status === 'COMPLETED' || currentUser.role !== 'PRESIDENT'}
            ></textarea>
            {selectedMeeting.status === 'COMPLETED' && (
                <p className={`text-sm mt-1 ${currentUser.role === 'PRESIDENT' ? 'text-red-500' : 'text-gray-500 italic'}`}>
                    {currentUser.role === 'PRESIDENT' ? 'This meeting is finalized; official notes cannot be edited.' : 'Official minutes are finalized.'}
                </p>
            )}
             {currentUser.role !== 'PRESIDENT' && (
                <p className="text-xs text-indigo-600 mt-2">
                    💡 **Personal Notes:** Since you cannot edit the official notes, you can use the text area above to quickly jot down your personal action items.
                </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendaBoard;