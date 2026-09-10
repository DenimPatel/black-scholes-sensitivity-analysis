
import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface EquationProps {
  children: string;
  className?: string;
}

// Display-mode equation block (centered, larger).
const Equation: React.FC<EquationProps> = ({ children, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      katex.render(children, containerRef.current, {
        throwOnError: false,
        displayMode: true,
        strict: false,
      });
    }
  }, [children]);

  return <div ref={containerRef} className={className} />;
};

// Inline equation that flows with the surrounding text.
export const InlineMath: React.FC<EquationProps> = ({ children, className }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      katex.render(children, containerRef.current, {
        throwOnError: false,
        displayMode: false,
        strict: false,
      });
    }
  }, [children]);

  return <span ref={containerRef} className={className} />;
};

export default Equation;
