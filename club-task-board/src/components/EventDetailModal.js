// src/components/EventDetailModal.js

import React from 'react';
import {X, MapPin, CheckCircle2 } from 'lucide-react';
import StatusBadge from './StatusBadge'; 
import { MOCK_USERS } from '../utils/mockData';

const EventDetailModal = ({ events, tasks, onClose }) => {
    // Check if there are any events to show
    if (!events || events.length === 0) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="bg-indigo-900 text-white p-6 rounded-t-2xl flex justify-between items-center sticky top-0">
                    <div>
                        <h2 className="text-xl font-bold">Schedule for {new Date(events[0].date).toLocaleDateString()}</h2>
                        <p className="text-indigo-200 text-xs">{events.length} Event{events.length > 1 ? 's' : ''} scheduled</p>
                    </div>
                    <button onClick={onClose} className="text-indigo-300 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                {/* Scrollable Content */}
                <div className="p-6 space-y-8 overflow-y-auto">
                    {events.map((event, index) => {
                        const relatedTasks = tasks.filter(t => t.eventId === event.id);
                        
                        return (
                            <div key={event.id} className={`${index !== 0 ? 'border-t pt-8' : ''}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-indigo-700">{event.title}</h3>
                                    <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        <MapPin size={12} className="mr-1" />
                                        {event.location || 'TBD'}
                                    </div>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-4 italic">
                                    {event.description || 'No description provided.'}
                                </p>

                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                        <CheckCircle2 size={10} className="mr-1" /> Linked Tasks
                                    </h4>
                                    {relatedTasks.length > 0 ? (
                                        relatedTasks.map(task => {
                                            const assignee = MOCK_USERS.find(u => u.id === task.assigneeId);
                                            return (
                                                <div key={task.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center shadow-sm">
                                                    <span className="text-sm font-medium text-gray-700">{task.title}</span>
                                                    <div className="flex items-center space-x-3">
                                                        <StatusBadge status={task.status} />
                                                        <span className="text-xs font-semibold text-indigo-600">
                                                            {assignee?.name.split(' ')[0]}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-xs text-gray-400 italic py-2">No tasks for this event.</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventDetailModal;