// --- EVENT DETAIL MODAL ---

// src/components/EventDetailModal.js

import React from 'react'; // Basic React import
// 🚨 FIX: Import icons
import { Calendar, X, MapPin } from 'lucide-react';
// 🚨 FIX: Import StatusBadge component (assuming you moved it)
import StatusBadge from './StatusBadge'; // Adjust path if needed
// 🚨 FIX: Import MOCK_USERS
import { MOCK_USERS } from '../utils/mockData';
// ... (rest of the component code)


const EventDetailModal = ({ event, tasks, onClose }) => {
    
    // ✅ FIX APPLIED: Check for null event immediately
    if (!event) return null;

    // Now it's safe to access event.id
    const relatedTasks = tasks.filter(t => t.eventId === event.id);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="bg-indigo-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                    <h2 className="text-xl font-bold">{event.title}</h2>
                    <button onClick={onClose} className="text-indigo-200 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="flex items-center text-sm text-gray-700">
                        <Calendar size={16} className="mr-2 text-indigo-500" />
                        <span className="font-semibold mr-2">Date:</span> 
                        {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                        <MapPin size={16} className="mr-2 text-indigo-500" />
                        <span className="font-semibold mr-2">Location:</span> 
                        {event.location || 'TBD'}
                    </div>
                    <p className="text-gray-800 mt-4 text-sm">
                        <span className="font-semibold block mb-1">Description:</span>
                        {event.description || 'No description provided.'}
                    </p>

                    <h3 className="text-md font-bold pt-3 border-t mt-4 text-gray-800">Assigned Tasks ({relatedTasks.length})</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {relatedTasks.length > 0 ? (
                            relatedTasks.map(task => {
                                const assignee = MOCK_USERS.find(u => u.id === task.assigneeId);
                                return (
                                    <div key={task.id} className="p-3 bg-gray-50 rounded-lg border flex justify-between items-center">
                                        <div className="text-sm font-medium">{task.title}</div>
                                        <div className="flex items-center space-x-2">
                                            <StatusBadge status={task.status} />
                                            <span className="text-xs text-gray-600">{assignee?.name.split(' ')[0]}</span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-gray-400">No tasks are currently linked to this event.</p>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventDetailModal;
