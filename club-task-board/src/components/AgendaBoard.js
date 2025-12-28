import React, { useState, useEffect } from 'react'; 
import { Calendar, Plus, X, Trash2, List, MessageSquare, Package, DollarSign, Zap, FileText } from 'lucide-react';

// MOCK_USERS must be defined in your actual project setup 
const MOCK_USERS = [
    { id: 'u1', name: 'President Alice', role: 'PRESIDENT' },
    { id: 'u2', name: 'Secretary Bob', role: 'SECRETARY' },
    { id: 'u3', name: 'Treasurer Charlie', role: 'TREASURER' },
];

// --- UTILITY FUNCTION FOR DYNAMIC TEXTAREA SIZE ---
const calculateRows = (text) => {
    if (!text) return 1;
    // Count the number of newline characters and add 1 for the starting line.
    const lines = text.split('\n').length;
    // Set a minimum of 1 and a maximum of 5 to keep the creation box manageable.
    return Math.min(5, Math.max(1, lines));
};
// -------------------------------------------------


// =================================================================================
// PLANNING BLOCK RENDERER
// =================================================================================
const PlanningBlockRenderer = React.memo(({ block, onUpdate, onRemove, isEditable }) => {
    const commonProps = {
        className: "w-full border-b focus:border-green-500 outline-none p-1 bg-white",
        disabled: !isEditable
    };
    
    // --- EVENT_PLAN Block (Future Planning) ---
    if (block.type === 'EVENT_PLAN') {
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
                    <input type="text" value={block.data.name} onChange={(e) => onUpdate(block.id, 'name', e.target.value)} {...commonProps} />
                </label>
                <label className="block">
                    <span className="text-gray-600">Location:</span>
                    <input type="text" value={block.data.location} onChange={(e) => onUpdate(block.id, 'location', e.target.value)} {...commonProps} />
                </label>
                <label className="block">
                    <span className="text-gray-600">Date/Time:</span>
                    <input type="text" value={block.data.date} onChange={(e) => onUpdate(block.id, 'date', e.target.value)} {...commonProps} />
                </label>
                <label className="block">
                    <span className="text-gray-600">Marketing Status:</span>
                    <select value={block.data.marketingStatus} onChange={(e) => onUpdate(block.id, 'marketingStatus', e.target.value)} {...commonProps}>
                        <option>Draft</option>
                        <option>Review</option>
                        <option>Approved</option>
                        <option>Launched</option>
                    </select>
                </label>
            </div>
        </div>
      );
    }    
    return null;
});
// =================================================================================

// --- MEETING CREATION FORM COMPONENT ---
const NewMeetingForm = ({ 
    newMeetingTitle, setNewMeetingTitle, newMeetingDate, setNewMeetingDate, 
    newAgenda, handleUpdateItem, handleAddSubItem, handleRemoveItem, 
    handleUpdateSubItem, handleRemoveSubItem, handleAddMainItem, 
    handleCreateNewMeeting, handleStartNewMeetingSetup 
}) => {
    return (
        <div className="h-full space-y-6">
            <h2 className="text-3xl font-bold text-indigo-700 border-b pb-2 flex justify-between items-center">
                Schedule New Meeting
                <button 
                    onClick={handleStartNewMeetingSetup}
                    className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium"
                    title="Reset form and load template agenda"
                >
                    Load Template
                </button>
            </h2>

            <div className="grid grid-cols-2 gap-4">
                <label className="block">
                    <span className="text-gray-600 font-medium">Meeting Title:</span>
                    <input 
                        type="text" 
                        placeholder="E.g., Weekly E-Board Meeting, Project Alpha Kickoff" 
                        className="w-full p-2 border rounded-lg focus:border-indigo-500 outline-none"
                        value={newMeetingTitle}
                        onChange={(e) => setNewMeetingTitle(e.target.value)}
                    />
                </label>
                <label className="block">
                    <span className="text-gray-600 font-medium">Date:</span>
                    <input 
                        type="date" 
                        className="w-full p-2 border rounded-lg focus:border-indigo-500 outline-none"
                        value={newMeetingDate}
                        onChange={(e) => setNewMeetingDate(e.target.value)}
                    />
                </label>
            </div>

            <h3 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4">
                Build Agenda
            </h3>
            
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-3">
                {newAgenda.map(mainItem => (
                    <div key={mainItem.id} className="bg-white p-3 rounded-lg border border-indigo-300 shadow-sm">
                        {/* Main Item Input: DYNAMIC TEXTAREA */}
                        <div className="flex items-start space-x-2">
                            <FileText size={18} className="text-indigo-500 mt-1 flex-shrink-0"/>
                            <textarea 
                                placeholder="Main Agenda Topic" 
                                // 🚨 DYNAMIC ROW CALCULATION
                                rows={calculateRows(mainItem.title)} 
                                className="flex-grow text-base p-1 border-b border-gray-200 focus:border-indigo-500 outline-none font-semibold resize-none"
                                value={mainItem.title}
                                onChange={(e) => handleUpdateItem(mainItem.id, e.target.value)}
                            />
                            <button onClick={() => handleAddSubItem(mainItem.id)} title="Add Sub-item" className="mt-1 text-indigo-500 hover:text-indigo-700 p-1 rounded-full hover:bg-indigo-100 transition-colors flex-shrink-0">
                                <Plus size={16} />
                            </button>
                            <button onClick={() => handleRemoveItem(mainItem.id)} title="Remove Item" className="mt-1 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-100 transition-colors flex-shrink-0">
                                <Trash2 size={16} />
                            </button>
                        </div>
                        
                        {/* Sub-Items */}
                        <div className="ml-8 mt-2 space-y-1">
                            {mainItem.subItems.map(subItem => (
                                <div key={subItem.id} className="flex items-start group">
                                    <span className="text-gray-500 mr-2 text-sm font-bold mt-1">→</span>
                                    <textarea 
                                        placeholder="Sub-item / Discussion Point" 
                                        // 🚨 DYNAMIC ROW CALCULATION
                                        rows={calculateRows(subItem.title)}
                                        className="w-full text-sm p-1 border-b border-gray-100 focus:border-indigo-500 outline-none resize-none"
                                        value={subItem.title}
                                        onChange={(e) => handleUpdateSubItem(mainItem.id, subItem.id, e.target.value)}
                                    />
                                    <button 
                                        onClick={() => handleRemoveSubItem(mainItem.id, subItem.id)} 
                                        title="Remove Sub-item" 
                                        className="text-gray-300 hover:text-red-500 p-1 transition-colors ml-1 mt-1 flex-shrink-0"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            
            <button 
                onClick={handleAddMainItem}
                className="w-full text-indigo-600 font-medium py-2 rounded-lg border border-dashed border-indigo-400 hover:bg-indigo-50 transition-colors mt-4"
            >
                <Plus size={18} className="inline mr-2" /> Add Main Agenda Item
            </button>
            
            <button 
                onClick={handleCreateNewMeeting}
                className="w-full bg-indigo-600 text-white text-lg font-medium py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-colors mt-6"
            >
                Create Meeting
            </button>
        </div>
    );
};


const AgendaBoard = ({ meetings, setMeetings, setTasks, currentUser, events, setEvents }) => {
  // --- Define local state variables here ---
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [planningBlocks, setPlanningBlocks] = useState([]);
    
  // 🚨 NEW STATE: Controls whether the main panel shows meeting details or the creation form
  const [isCreatingNew, setIsCreatingNew] = useState(true);

  // States for the creation form
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingDate, setNewMeetingDate] = useState('');
  const [newAgenda, setNewAgenda] = useState([]); 

  // Agenda Template for recurring items
  const [agendaTemplate, setAgendaTemplate] = useState([
    { id: 1, title: 'I. Standard Check-ins & Icebreaker', subItems: [] },
    { id: 2, title: 'II. Review of Last Meeting Tasks', subItems: [] },
    { id: 3, title: 'III. Budget / Concessions Report (Charlie)', subItems: [] },
    { id: 4, title: 'IV. Semester/Event Reflection (Standing Item)', subItems: [
        { id: 4.1, title: 'What went well?' },
        { id: 4.2, title: 'What went wrong?' }
      ] 
    },
    { id: 5, title: 'V. New Business & Action Planning', subItems: [] },
  ]);

  // Effect to load notes AND planning blocks when a meeting is selected
  useEffect(() => {
    if (selectedMeeting) {
      setNoteContent(selectedMeeting.notes || '');
      setPlanningBlocks(selectedMeeting.planningBlocks || []);
      // When a meeting is selected, we stop showing the creation form.
      setIsCreatingNew(false); 
    } else {
      setNoteContent('');
      setPlanningBlocks([]);
      // When selectedMeeting is cleared (e.g., app loads or user clicks 'Create'), we stay on the creation view.
    }
  }, [selectedMeeting]);


  // Helper to find assignee by first name (unchanged)
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
    return MOCK_USERS[0].id; 
  };
    
  // --- AGENDA MANAGEMENT FUNCTIONS (Passed to NewMeetingForm) ---
  const handleAddMainItem = () => setNewAgenda(prev => [...prev, { id: Date.now(), title: '', subItems: [] }]);
  const handleRemoveItem = (id) => setNewAgenda(prev => prev.filter(item => item.id !== id));
  const handleUpdateItem = (id, title) => setNewAgenda(prev => prev.map(item => item.id === id ? { ...item, title } : item));
  const handleAddSubItem = (mainId) => setNewAgenda(prev => prev.map(item => item.id === mainId ? { ...item, subItems: [...item.subItems, { id: Date.now() + Math.random(), title: '' }] } : item));
  const handleUpdateSubItem = (mainId, subId, newTitle) => setNewAgenda(prev => prev.map(mainItem => mainItem.id === mainId ? { ...mainItem, subItems: mainItem.subItems.map(subItem => subItem.id === subId ? { ...subItem, title: newTitle } : subItem) } : mainItem));
  const handleRemoveSubItem = (mainId, subId) => setNewAgenda(prev => prev.map(mainItem => mainItem.id === mainId ? { ...mainItem, subItems: mainItem.subItems.filter(subItem => subItem.id !== subId) } : mainItem));


  // --- PLANNING BLOCK MANAGEMENT FUNCTIONS (Omitted for brevity, assumed unchanged) ---
  const handleCreatePlanningBlock = (type) => { 
    let newBlock;
    if (type === 'EVENT_PLAN') {
        newBlock = { id: `pb${Date.now()}`, type: 'EVENT_PLAN', title: `New Event Plan`, data: { name: '', location: '', date: '', marketingStatus: 'Draft' }, status: 'ACTIVE' };
    } else if (type === 'EVENT_REVIEW') {
        newBlock = { id: `pb${Date.now()}`, type: 'EVENT_REVIEW', title: 'Event After-Action Review', data: { eventName: '', whatWentWell: '', whatWentWrong: '', keyTakeaways: '' }, status: 'ACTIVE' };
    } else { return; }
    setPlanningBlocks(prev => [...prev, newBlock]);
  };

  const handleUpdatePlanningBlock = (blockId, field, value) => {
    setPlanningBlocks(prev => prev.map(block => {
      if (block.id === blockId) {
        return { ...block, data: { ...block.data, [field]: value } };
      }
      return block;
    }));
  };

  const handleRemovePlanningBlock = (blockId) => {
    setPlanningBlocks(prev => prev.filter(block => block.id !== blockId));
  };


  // 🚨 TEMPLATE SETUP
  const handleStartNewMeetingSetup = () => {
    // 1. Reset inputs
    setNewMeetingTitle('');
    setNewMeetingDate('');

    // 2. Automatically load the current template into the new agenda
    const templateCopy = JSON.parse(JSON.stringify(agendaTemplate));
    setNewAgenda(templateCopy);
    
    // 3. Navigate to the creation view
    setSelectedMeeting(null);
    setIsCreatingNew(true);
  }

  // 🚨 CREATE MEETING ACTION
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
    
    // Update Events (Calendar)
    setEvents(prevEvents => [...prevEvents, {
        id: `e${Date.now()}`,
        title: newMeetingTitle,
        date: newMeetingDate,
        location: 'E-Board Meeting Room',
        description: 'Scheduled Executive Board Meeting',
        type: 'MEETING'
    }]);

    // Navigate to the newly created meeting 
    setSelectedMeeting(newMeeting);
    setIsCreatingNew(false);

    // Reset agenda states for the form (ready for the next creation)
    setNewMeetingTitle('');
    setNewMeetingDate('');
    setNewAgenda([]); 
  };


  // --- CORE AI PARSING LOGIC & FINALIZATION (Omitted for brevity, assumed unchanged) ---
  const handleGenerateTasksFromNotes = () => {
    if (!selectedMeeting || selectedMeeting.status === 'COMPLETED' || currentUser.role !== 'PRESIDENT') return;

    const actionRegex = /ACTION:\s*(.*?)(?:\s+Assignee:\s*(\w+))?(?:\s+Due:\s*(\S+))?(?:\s+Priority:\s*(HIGH|LOW))?/gi;
    let match;
    
    const generatedTasks = [];
    const createdTaskIds = [];

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
    
    setTasks(prevTasks => [...prevTasks, ...generatedTasks]);
    
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


  // --- RENDER PREPARATION ---
  const upcomingMeetings = meetings.filter(m => m.status === 'PLANNED').sort((a, b) => new Date(a.date) - new Date(b.date));
  const pastMeetings = meetings.filter(m => m.status === 'COMPLETED').sort((a, b) => new Date(b.date) - new Date(a.date));


  return (
    <div className="flex gap-6 h-full">
      {/* Sidebar: Meeting List */}
      <div className="w-1/3 min-w-[300px] bg-white rounded-xl shadow p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-indigo-700 border-b pb-2">Meeting History</h3>
        
        {/* 🚨 Create Meeting Button in Sidebar */}
        <button 
            onClick={handleStartNewMeetingSetup}
            className={`w-full py-2 mb-4 font-semibold rounded-lg transition-colors flex items-center justify-center ${
                isCreatingNew 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}
        >
            <Plus size={18} className="mr-2"/> Create New Meeting
        </button>

        <h4 className="font-semibold mt-4 text-gray-700">Upcoming ({upcomingMeetings.length})</h4>
        {upcomingMeetings.map(m => (
          <div 
            key={m.id} 
            onClick={() => setSelectedMeeting(m)}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedMeeting?.id === m.id && !isCreatingNew ? 'bg-indigo-200 border-indigo-500 border-l-4' : 'bg-gray-50 hover:bg-gray-100'}`}
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
            className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedMeeting?.id === m.id && !isCreatingNew ? 'bg-indigo-200 border-indigo-500 border-l-4' : 'bg-gray-50 hover:bg-gray-100'}`}
          >
            <p className="text-sm font-semibold text-gray-500">{m.title}</p>
             <p className="text-xs text-green-600 flex items-center mt-0.5">
                <List size={12} className="mr-1" />
                {m.generatedTasks.length} Tasks Created
            </p>
          </div>
        ))}
      </div>

      {/* Main Content: Creation Form OR Meeting Details */}
      <div className="flex-1 bg-white rounded-xl shadow p-6 max-h-[70vh] overflow-y-auto">
        {/* 🚨 CONDITIONAL RENDERING */}
        {isCreatingNew ? (
            <NewMeetingForm 
                newMeetingTitle={newMeetingTitle}
                setNewMeetingTitle={setNewMeetingTitle}
                newMeetingDate={newMeetingDate}
                setNewMeetingDate={setNewMeetingDate}
                newAgenda={newAgenda}
                handleUpdateItem={handleUpdateItem}
                handleAddSubItem={handleAddSubItem}
                handleRemoveItem={handleRemoveItem}
                handleUpdateSubItem={handleUpdateSubItem}
                handleRemoveSubItem={handleRemoveSubItem}
                handleAddMainItem={handleAddMainItem}
                handleCreateNewMeeting={handleCreateNewMeeting}
                handleStartNewMeetingSetup={handleStartNewMeetingSetup}
            />
        ) : (
          <div>
            {/* Display Selected Meeting Details */}
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

            {/* Planned Agenda Display */}
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Planned Agenda</h3>
            <ul className="list-disc list-inside bg-gray-50 p-4 rounded-lg mb-6">
                {selectedMeeting.agendaItems.length > 0 ? (
                    selectedMeeting.agendaItems.map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 font-semibold mt-1">
                            {item.title}
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
                Live Planning Data / Reviews
                {selectedMeeting.status === 'PLANNED' && currentUser.role === 'PRESIDENT' && (
                    <div className="space-x-2">
                        <button 
                            onClick={() => handleCreatePlanningBlock('EVENT_PLAN')}
                            className="px-3 py-1 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
                        >
                            <Package size={14} className="mr-1" /> Add Plan Block
                        </button>
                    </div>
                )}
            </h3>
            
            <div className="space-y-4">
                {planningBlocks.length === 0 ? (
                    <p className="text-gray-500 italic text-sm">No structured planning or review items added for this meeting yet.</p>
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
                           `Enter official minutes here. Use "ACTION: Task Assignee: Name Due: Date" to generate tasks. (Structured planning and review details are above).` :
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