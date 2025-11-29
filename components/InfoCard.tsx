
import React from 'react';

interface InfoCardProps {
  title: string;
  value: string | number;
  description: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, description }) => {
  return (
    <div className="bg-gray-700/50 p-4 rounded-lg group relative border border-gray-600 hover:border-cyan-500 transition-colors">
      <h4 className="text-sm text-gray-400 font-medium truncate">{title}</h4>
      <p className="text-xl font-semibold text-white mt-1">{value}</p>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-lg">
        {description}
        <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
            <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
        </svg>
      </div>
    </div>
  );
};

export default InfoCard;
