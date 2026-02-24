import React from 'react';

const StatusBadge = ({ isActive }) => {
    return (
        <span
            className={`px-2 py-1 text-xs font-semibold rounded-full border ${isActive
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}
        >
            {isActive ? 'Active' : 'Inactive'}
        </span>
    );
};

export default StatusBadge;
