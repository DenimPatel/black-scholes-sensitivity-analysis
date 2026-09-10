import React from 'react';
import Equation from './Equation';

interface InfoCardProps {
  title: string;
  value: string | number;
  description: string;
  calculation?: string;
  isExpanded?: boolean;
  onClick?: () => void;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, description, calculation, isExpanded, onClick }) => {
  return (
    <div
      className={`glass-card glass-card-hover p-4 group relative cursor-pointer ${isExpanded ? 'lg:col-span-2' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">{title}</h4>
          <p className="text-2xl font-mono font-bold tabular-nums text-slate-900 mt-1">{value}</p>
        </div>
      </div>

      {isExpanded && calculation && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <h5 className="text-sm font-semibold text-[var(--color-accent-700)] mb-2">Calculation Details</h5>
          <Equation className="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">{calculation}</Equation>
        </div>
      )}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 bg-[var(--color-ink)] text-[var(--color-paper)] text-xs rounded-[var(--radius-md)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-[var(--shadow-md-paper)]">
        {description}
        <svg className="absolute text-[var(--color-ink)] h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
            <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
        </svg>
      </div>
    </div>
  );
};

export default InfoCard;
