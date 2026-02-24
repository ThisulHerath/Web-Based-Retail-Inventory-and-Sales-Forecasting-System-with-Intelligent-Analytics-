import React from 'react';

const LowStockBadge = ({ currentStock, minimumStockLevel }) => {
    const isLow = currentStock <= minimumStockLevel;
    const isOut = currentStock === 0;

    if (!isLow) return null;

    return (
        <span
            className={`px-2 py-1 text-xs font-semibold rounded-full border ${isOut
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : 'bg-orange-100 text-orange-800 border-orange-200'
                }`}
        >
            {isOut ? 'Out of Stock' : 'Low Stock'}
        </span>
    );
};

export default LowStockBadge;
