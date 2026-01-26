import React from 'react';
import { TaskStatus } from '../types';

interface StatusBadgeProps {
  status: TaskStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<TaskStatus, string> = {
    TODO: 'bg-gray-100 text-gray-600',
    DOING: 'bg-blue-100 text-blue-600',
    DONE: 'bg-green-100 text-green-600',
  };
  return <span className={`px-2 py-1 rounded text-xs font-bold ${styles[status]}`}>{status}</span>;
};

export default StatusBadge;
