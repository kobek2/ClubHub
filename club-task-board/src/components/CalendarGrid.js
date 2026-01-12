// src/components/CalendarGrid.js

import React from 'react'; 
// 🚨 FIX: Import Clock icon
import { Clock } from 'lucide-react';

// ... (rest of the component code)
const CalendarGrid = ({ events, tasks, onEventClick }) => {
    const today = new Date();
    const year = today.getFullYear();
    const monthIndex = today.getMonth(); 

    const firstDay = new Date(year, monthIndex, 1);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const startDayIndex = firstDay.getDay(); 
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const dataByDay = {};

    events.forEach(event => {
        const dateKey = event.date;
        if (!dataByDay[dateKey]) dataByDay[dateKey] = { events: [], tasks: [] };
        dataByDay[dateKey].events.push(event);
    });

    tasks.forEach(task => {
        const dateKey = task.dueDate;
        if (dateKey) {
            if (!dataByDay[dateKey]) dataByDay[dateKey] = { events: [], tasks: [] };
            dataByDay[dateKey].tasks.push(task);
        }
    });

    const calendarCells = [];

    // 1. Pre-fill empty leading cells
    for (let i = 0; i < startDayIndex; i++) {
        calendarCells.push(<div key={`empty-${i}`} className="p-2 border border-gray-200 bg-gray-50/50 h-28"></div>);
    }

    // 2. Fill day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayData = dataByDay[dateKey] || { events: [], tasks: [] };
        
        const isToday = dateKey === todayKey;
        const hasEvents = dayData.events.length > 0;
        const tasksDue = dayData.tasks.length;
        const overdueTasks = dayData.tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'DONE').length;

        calendarCells.push(
            
            <div 
                key={day} 
                className={`p-2 border border-gray-200 h-28 overflow-hidden relative group transition-all ${hasEvents ? 'cursor-pointer hover:bg-indigo-50' : 'hover:bg-gray-50'} ${isToday ? 'bg-indigo-50 ring-2 ring-indigo-500 z-10' : ''}`}
             // ✅ FIX: Pass all events for that day instead of just index 0
                onClick={() => hasEvents && onEventClick(dayData.events)}
            >
                <div className={`text-sm font-bold ${isToday ? 'text-indigo-900' : hasEvents ? 'text-indigo-700' : 'text-gray-900'}`}>{day}</div>
                
                {hasEvents && (
                    <div className="mt-1 space-y-0.5">
                        {/* Show first event */}
                        {dayData.events.slice(0, 1).map(event => (
                            <div key={event.id} className="text-xs font-medium text-indigo-800 truncate bg-indigo-200 px-1 py-0.5 rounded-sm">
                                {event.title}
                            </div>
                        ))}
                        {/* Indicate remaining events */}
                        {dayData.events.length > 1 && (
                            <div className="text-xs text-indigo-600 bg-indigo-100 px-1 py-0.5 rounded-sm">
                                +{dayData.events.length - 1} more
                            </div>
                        )}
                    </div>
                )}

                {tasksDue > 0 && (
                    <div className="absolute bottom-2 left-2 text-xs flex items-center bg-white p-1 rounded-md shadow-sm">
                        <Clock size={12} className={`mr-1 ${overdueTasks > 0 ? 'text-red-500' : 'text-gray-500'}`} />
                        <span className={`${overdueTasks > 0 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                            {tasksDue} Task{tasksDue > 1 ? 's' : ''}
                        </span>
                    </div>
                )}
            </div>
        );
    }
    
    return (
        <div className="mt-4">
            <div className="grid grid-cols-7 text-center text-xs font-medium uppercase text-gray-500 py-2 bg-gray-100 rounded-t-lg">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
            </div>
            <div className="grid grid-cols-7 border-t border-gray-200">
                {calendarCells}
            </div>
        </div>
    );
};

export default CalendarGrid;