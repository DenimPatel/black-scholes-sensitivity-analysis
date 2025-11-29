
import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface EquationProps {
  children: string;
  className?: string;
}

const Equation: React.FC<EquationProps> = ({ children, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      katex.render(children, containerRef.current, {
        throwOnError: false,
        displayMode: true,
      });
    }
  }, [children]);

  return <div ref={containerRef} className={className} />;
};

export default Equation;
