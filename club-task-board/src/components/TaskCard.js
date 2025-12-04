import React from 'react';
import { Calendar, Clock, MessageSquare } from 'lucide-react'; 
import StatusBadge from './StatusBadge'; 
import { MOCK_USERS } from '../utils/mockData'; 

  const TaskCard = ({ task, currentUser, moveTaskStatus, events, meetings }) => {
    // src/components/TaskCard.js

// ✅ Add (MOCK_USERS || []) to safeguard against an undefined import
    const assignee = (MOCK_USERS || []).find(u => u.id === task.assigneeId);
    const relatedEvent = (events || []).find(e => e.id === task.eventId);
    const relatedMeeting = (meetings || []).find(m => m.id === task.meetingId); 
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'DONE';
    const isAssignedToCurrentUser = task.assigneeId === currentUser.id;

    const StatusPicker = ({ currentStatus }) => {
        const statuses = ['TODO', 'DOING', 'DONE'];

        const handleChange = (e) => {
            moveTaskStatus(task.id, e.target.value, currentUser.id);
        };
        
        // Disable picker if the task is not assigned to the current user
        if (!isAssignedToCurrentUser) {
            return <StatusBadge status={currentStatus} />;
        }

        return (
            <select
                value={currentStatus}
                onChange={handleChange}
                className={`text-xs font-bold py-1 px-2 rounded cursor-pointer border focus:ring-1 ${
                    currentStatus === 'TODO' ? 'bg-gray-100 text-gray-600 border-gray-300' :
                    currentStatus === 'DOING' ? 'bg-blue-100 text-blue-600 border-blue-300' :
                    'bg-green-100 text-green-600 border-green-300'
                }`}
            >
                {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>
        );
    };

    return (
      <div className={`bg-white p-4 rounded-lg shadow-sm border-l-4 mb-3 transition-all hover:shadow-md ${task.priority === 'HIGH' ? 'border-red-400' : 'border-green-400'} ${isAssignedToCurrentUser ? 'ring-1 ring-indigo-200' : ''}`}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-semibold text-gray-800 text-sm">{task.title}</h4>
            {relatedEvent && (
              <div className="flex items-center text-xs text-blue-600 mt-1">
                <Calendar size={12} className="mr-1" />
                {relatedEvent.title}
              </div>
            )}
             {relatedMeeting && ( 
              <div className="flex items-center text-xs text-purple-600 mt-1">
                <MessageSquare size={12} className="mr-1" />
                From: {relatedMeeting.title}
              </div>
            )}
          </div>
          <div className="text-right">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${assignee?.avatar}`} title={`Assigned to ${assignee?.name}`}>
                {assignee?.name.charAt(0)}
              </div>
              <p className={`text-xs mt-1 ${isAssignedToCurrentUser ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>
                {isAssignedToCurrentUser ? 'You' : assignee?.name.split(' ')[0]}
              </p>
          </div>
        </div>

        <div className="flex justify-between items-end mt-3">
          <div className="text-xs">
            <p className={`flex items-center ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
              <Clock size={12} className="mr-1" />
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date'}
            </p>
          </div>
          
          {/* Enhanced Status Picker */}
          <StatusPicker currentStatus={task.status} />
        </div>
      </div>
    );
  };

    export default TaskCard;