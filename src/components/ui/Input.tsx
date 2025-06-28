import React from 'react';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`px-3 py-2 border border-[#C5D9D5] rounded-md shadow-sm focus:outline-none focus:ring-[#C5D9D5] focus:border-[#C5D9D5] sm:text-sm bg-white ${className}`}
      {...props}
    />
  )
);

Input.displayName = 'Input';

export default Input; 