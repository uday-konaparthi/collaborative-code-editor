import React from 'react';
import { ChevronUp } from 'lucide-react';

const CollapsibleControl = ({ isTopOpen, onToggleTop, isBottomOpen, onToggleBottom }) => {
  return (
    <div className="relative flex items-center justify-center my-1">
      {/* Divider Line */}
      <div className="w-full h-px bg-gray-600"></div>

      {/* Control Buttons */}
      <div className="absolute flex justify-center w-20 px-2 bg-gray-900">
        <button
          onClick={onToggleTop}
          // Disable button if it's the last one open
          disabled={isTopOpen && !isBottomOpen}
          className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={isTopOpen ? 'Collapse video panel' : 'Expand video panel'}
        >
          <ChevronUp
            size={18}
            className={`transform transition-transform duration-300 ${isTopOpen ? '' : 'rotate-180'}`}
          />
        </button>
      </div>
    </div>
  );
};

export default CollapsibleControl;