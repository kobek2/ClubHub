
import React from 'react';

// You might not need Lucide if it's just colors, but keep if you use any icons here
// import { ... } from 'lucide-react'; 

const StatusBadge = ({ status }) => {
  const styles = {
    TODO: 'bg-gray-100 text-gray-600',
    DOING: 'bg-blue-100 text-blue-600',
    DONE: 'bg-green-100 text-green-600',
  };
  return <span className={`px-2 py-1 rounded text-xs font-bold ${styles[status]}`}>{status}</span>;
};

// Must use default export to match your import in TaskCard.js
export default StatusBadge;