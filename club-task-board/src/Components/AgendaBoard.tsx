import React, { useState, useEffect } from 'react';
import { Plus, Calendar, FileText, ClipboardList, Target, X, Trash2, Save } from 'lucide-react';
import { Meeting, User, Task, Event, AgendaItem, AgendaSubItem } from '../types';

interface AgendaBoardProps {
  meetings: Meeting[];
  setMeetings: (meeting: Omit<Meeting, 'id'> & { id?: string }) => Promise<void>;
  currentUser: User;
  setTasks?: (task: Omit<Task, 'id'> & { id?: string }) => Promise<void>;
  setEvents?: (event: Omit<Event, 'id'> & { id?: string }) => Promise<void>;
}

const AgendaBoard: React.FC<AgendaBoardProps> = ({ meetings = [], setMeetings, currentUser }) => {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(true);
  const [noteContent, setNoteContent] = useState('');

  // Creation State
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingGoal, setNewMeetingGoal] = useState('');
  const [newMeetingDate, setNewMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  
  // The Agenda Feature
  const [newAgenda, setNewAgenda] = useState<AgendaItem[]>([
    { id: 1, title: 'I. Standard Check-ins', subItems: [] }
  ]);

  // Handle Auto-Expand for all textareas
  const handleAutoExpand = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'inherit';
    target.style.height = `${target.scrollHeight}px`;
  };

  // Sync content when a meeting is selected
  useEffect(() => {
    if (selectedMeeting) {
      setNoteContent(selectedMeeting.notes || '');
      setIsCreatingNew(false);
    }
  }, [selectedMeeting]);

  // Sidebar Categorization
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingMeetings = meetings.filter(m => new Date(m.date) >= today);
  const pastMeetings = meetings.filter(m => new Date(m.date) < today);

  // --- AGENDA & SUB-ITEM LOGIC ---
  const handleSmartPaste = (mainId: number | string) => {
    const pasteArea = prompt("Paste your list (One item per line):");
    if (!pasteArea) return;
    const items: AgendaSubItem[] = pasteArea.split('\n').map(l => l.trim()).filter(l => l.length > 0)
      .map(line => ({ id: Math.random(), title: line }));
    setNewAgenda(prev => prev.map(item => item.id === mainId ? { ...item, subItems: [...item.subItems, ...items] } : item));
  };

  const handleAddMainItem = () => setNewAgenda(prev => [...prev, { id: Date.now(), title: '', subItems: [] }]);
  const handleUpdateItem = (id: number | string, title: string) => setNewAgenda(prev => prev.map(item => item.id === id ? { ...item, title } : item));
  const handleRemoveMainItem = (id: number | string) => setNewAgenda(prev => prev.filter(item => item.id !== id));
  
  const handleAddSubItem = (mainId: number | string) => setNewAgenda(prev => prev.map(item => 
    item.id === mainId ? { ...item, subItems: [...item.subItems, { id: Date.now(), title: '' }] } : item
  ));
  
  const handleUpdateSubItem = (mainId: number | string, subId: number | string, title: string) => setNewAgenda(prev => prev.map(main => 
    main.id === mainId ? { ...main, subItems: main.subItems.map(sub => sub.id === subId ? { ...sub, title } : sub) } : main
  ));

  const handleRemoveSubItem = (mainId: number | string, subId: number | string) => setNewAgenda(prev => prev.map(main => 
    main.id === mainId ? { ...main, subItems: main.subItems.filter(sub => sub.id !== subId) } : main
  ));

  // --- PERSISTENCE ---
  const handleCreateNewMeeting = async () => {
    if (!newMeetingTitle) return alert("Please enter a title.");
    
    const newMeetingData: Omit<Meeting, 'id'> & { id?: string } = {
      title: newMeetingTitle,
      date: newMeetingDate,
      goal: newMeetingGoal,
      agendaItems: JSON.parse(JSON.stringify(newAgenda)), // Deep clone for stability
      status: 'PLANNED',
      notes: '',
      createdAt: new Date().toISOString()
    };

    try {
      await setMeetings(newMeetingData); 
      setIsCreatingNew(false);
      // Reset form fields
      setNewMeetingTitle('');
      setNewMeetingGoal('');
      setNewAgenda([{ id: 1, title: 'I. Standard Check-ins', subItems: [] }]);
    } catch (err) {
      console.error("Save Error:", err);
    }
  };

  return (
    <div className="flex gap-6 h-[85vh] antialiased bg-gray-50/50 p-4">
      {/* SIDEBAR */}
      <div className="w-1/4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col overflow-hidden">
        <h2 className="text-xl font-black text-indigo-900 mb-6 font-sans">Meeting History</h2>
        
        <button 
          onClick={() => { setIsCreatingNew(true); setSelectedMeeting(null); }}
          className="w-full py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl mb-8 hover:bg-indigo-100 transition-all flex items-center justify-center border border-indigo-100"
        >
          <Plus size={18} className="mr-2"/> Create New Meeting
        </button>
        
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-tight">Upcoming ({upcomingMeetings.length})</h3>
            <div className="space-y-3">
              {upcomingMeetings.map(m => (
                <div 
                  key={m.id} 
                  onClick={() => setSelectedMeeting(m)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedMeeting?.id === m.id ? 'bg-indigo-100 border-indigo-300 shadow-sm' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}
                >
                  <p className="font-bold text-gray-900 truncate">{m.title}</p>
                  <p className="text-[10px] text-gray-500 flex items-center mt-1 font-medium italic"><Calendar size={10} className="mr-1"/> {m.date}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-tight">Past ({pastMeetings.length})</h3>
            {pastMeetings.map(m => (
              <div key={m.id} onClick={() => setSelectedMeeting(m)} className="p-4 bg-white border border-gray-100 rounded-xl mb-2 opacity-60 hover:opacity-100 cursor-pointer shadow-sm">
                <p className="font-bold text-gray-700 text-sm truncate">{m.title}</p>
                <p className="text-[10px] text-gray-400">{m.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto flex flex-col">
        {isCreatingNew ? (
          /* CREATE NEW MEETING VIEW */
          <div className="p-8 max-w-4xl mx-auto w-full space-y-8 pb-20">
            <h2 className="text-3xl font-black text-gray-900">Meeting Setup</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                <input className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg" placeholder="Weekly E-Board Sync..." value={newMeetingTitle} onChange={e => setNewMeetingTitle(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date</label>
                <input type="date" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none" value={newMeetingDate} onChange={e => setNewMeetingDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center"><Target size={12} className="mr-1 text-red-500"/> Core Objective</label>
              <textarea 
                className="w-full p-4 bg-red-50/30 rounded-xl border-l-4 border-red-400 outline-none resize-none min-h-[80px] font-medium" 
                placeholder="What is the primary decision or outcome needed?" 
                value={newMeetingGoal} 
                onChange={e => setNewMeetingGoal(e.target.value)} 
              />
            </div>

            {/* Agenda Designer */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">Agenda Designer</h3>
              {newAgenda.map(main => (
                <div key={main.id} className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-4 shadow-sm">
                  <div className="flex gap-2">
                    <textarea 
                      className="flex-1 font-bold bg-transparent border-b border-gray-300 outline-none focus:border-indigo-500 resize-none overflow-hidden py-1 h-auto" 
                      rows={1} 
                      onInput={handleAutoExpand}
                      placeholder="Topic Name (e.g., Financial Update)"
                      value={main.title} 
                      onChange={e => handleUpdateItem(main.id, e.target.value)} 
                    />
                    <div className="flex gap-1">
                      <button onClick={() => handleSmartPaste(main.id)} className="p-2 text-indigo-500 hover:bg-white rounded-lg transition-all" title="Smart Paste"><ClipboardList size={18}/></button>
                      <button onClick={() => handleAddSubItem(main.id)} className="p-2 text-green-500 hover:bg-white rounded-lg transition-all" title="Add Sub-item"><Plus size={18}/></button>
                      <button onClick={() => handleRemoveMainItem(main.id)} className="p-2 text-gray-300 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                    </div>
                  </div>
                  
                  <div className="ml-6 space-y-3">
                    {main.subItems.map(sub => (
                      <div key={sub.id} className="flex gap-2 items-start group">
                        <div className="mt-4 w-1.5 h-1.5 bg-indigo-300 rounded-full flex-shrink-0" />
                        <textarea 
                          className="flex-1 text-sm bg-white p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 resize-none overflow-hidden h-auto shadow-sm" 
                          rows={1} 
                          onInput={handleAutoExpand}
                          placeholder="Sub-topic or detail..."
                          value={sub.title} 
                          onChange={e => handleUpdateSubItem(main.id, sub.id, e.target.value)} 
                        />
                        <button onClick={() => handleRemoveSubItem(main.id, sub.id)} className="mt-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={16}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={handleAddMainItem} className="w-full py-4 border-2 border-dashed border-gray-200 text-gray-400 font-bold rounded-2xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center justify-center">
                <Plus size={18} className="mr-2"/> Add Main Topic
              </button>
            </div>

            <button onClick={handleCreateNewMeeting} className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl shadow-lg hover:bg-indigo-700 active:scale-[0.99] transition-all">
              Finalize & Plan Agenda
            </button>
          </div>
        ) : selectedMeeting ? (
          /* DETAILED VIEW MODE (Old Agendas) */
          <div className="p-8 space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">{selectedMeeting.title}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-gray-500 flex items-center font-medium"><Calendar size={18} className="mr-2"/> {selectedMeeting.date}</span>
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">{selectedMeeting.status}</span>
                </div>
              </div>
            </div>

            {/* Primary Goal Section */}
            {selectedMeeting.goal && (
              <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-r-2xl">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Primary Objective</p>
                <p className="text-gray-900 font-bold text-xl leading-tight">{selectedMeeting.goal}</p>
              </div>
            )}

            {/* Planned Agenda View */}
            <section className="space-y-4">
              <h3 className="text-xl font-black text-gray-800">Planned Agenda</h3>
              <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 space-y-6">
                {selectedMeeting.agendaItems?.map((item, i) => (
                  <div key={i} className="relative pl-6 border-l-2 border-indigo-100">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-indigo-500" />
                    <div className="font-black text-gray-800 text-lg leading-tight">{item.title}</div>
                    {item.subItems?.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {item.subItems.map((sub, si) => (
                          <li key={si} className="text-sm text-gray-600 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">{sub.title}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Meeting Notes */}
            <section className="space-y-4 pb-12">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-gray-800">Meeting Notes / Minutes</h3>
                <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition-all flex items-center">
                  <Save size={14} className="mr-2"/> Save Notes
                </button>
              </div>
              <textarea 
                className="w-full min-h-[400px] p-8 bg-white border border-gray-100 rounded-3xl shadow-inner focus:ring-4 focus:ring-indigo-50 outline-none font-mono text-sm leading-relaxed h-auto"
                placeholder="Enter official minutes here. Use 'ACTION: Task Assignee'..."
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                onInput={handleAutoExpand}
              />
            </section>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-4">
            <FileText size={64} className="opacity-10" />
            <p className="font-medium italic text-lg">Select a meeting from the sidebar to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendaBoard;
