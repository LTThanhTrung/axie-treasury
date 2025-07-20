import React from 'react';

// Spinner component inspired by Tremor.so's minimalist design
const Spinner = ({ size = 'md', color = 'currentColor', className = '' }) => {
    console.log(color)
  let spinnerSizeClasses = '';
  let borderWidthClasses = '';

  // Define size classes based on the 'size' prop
  switch (size) {
    case 'sm':
      spinnerSizeClasses = 'w-6 h-6'; // Small spinner
      borderWidthClasses = 'border-2';
      break;
    case 'md':
      spinnerSizeClasses = 'w-8 h-8'; // Medium spinner (default)
      borderWidthClasses = 'border-3'; // Custom border width for a slightly thicker look
      break;
    case 'lg':
      spinnerSizeClasses = 'w-12 h-12'; // Large spinner
      borderWidthClasses = 'border-4';
      break;
    case 'xl':
      spinnerSizeClasses = 'w-16 h-16'; // Extra large spinner
      borderWidthClasses = 'border-4';
      break;
    default:
      spinnerSizeClasses = 'w-8 h-8';
      borderWidthClasses = 'border-3';
  }

  return (
    <div
      className={`
        inline-block
        rounded-full
        animate-spin
        ${spinnerSizeClasses}
        ${borderWidthClasses}
        border-solid
        border-t-${color}
        border-r-${color}
        border-b-${color}
        text-${color}
        border-l-transparent
        ${className}
      `}
      role="status"
    >
      <span className="sr-only">Loading...</span> {/* Screen reader text for accessibility */}
    </div>
  );
};


export default Spinner;
