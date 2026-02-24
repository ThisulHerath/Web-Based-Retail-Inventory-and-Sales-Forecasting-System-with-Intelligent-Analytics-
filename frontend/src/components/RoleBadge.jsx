import React from 'react';

const RoleBadge = ({ role }) => {
    const getBadgeStyle = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'manager':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'cashier':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <span
            className={`px-2 py-1 text-xs font-semibold rounded-full border ${getBadgeStyle(
                role
            )} capitalize`}
        >
            {role}
        </span>
    );
};

export default RoleBadge;
