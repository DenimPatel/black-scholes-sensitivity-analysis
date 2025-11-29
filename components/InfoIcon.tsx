import React, { useState } from 'react';

interface InfoIconProps {
  description: string;
}

const InfoIcon: React.FC<InfoIconProps> = ({ description }) => {
  const [show, setShow] = useState(false);

  return (
    <div 
      className="relative inline-block ml-2"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5 text-gray-400 hover:text-cyan-400 cursor-pointer" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl z-20 border border-gray-700">
          {description}
          <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
              <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
          </svg>
        </div>
      )}
    </div>
  );
};

export default InfoIcon;
