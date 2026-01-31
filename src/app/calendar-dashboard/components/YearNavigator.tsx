'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface YearNavigatorProps {
  onYearChange: (year: number) => void;
  className?: string;
}

const YearNavigator = ({ onYearChange, className = '' }: YearNavigatorProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className={`flex items-center justify-center gap-6 ${className}`}>
        <button
          className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center opacity-50"
          disabled
        >
          <Icon name="ChevronLeftIcon" size={20} />
        </button>
        <h2 className="text-2xl font-semibold text-foreground min-w-[100px] text-center">2026</h2>
        <button
          className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center opacity-50"
          disabled
        >
          <Icon name="ChevronRightIcon" size={20} />
        </button>
      </div>
    );
  }

  const handlePreviousYear = () => {
    const newYear = currentYear - 1;
    setCurrentYear(newYear);
    onYearChange(newYear);
  };

  const handleNextYear = () => {
    const newYear = currentYear + 1;
    setCurrentYear(newYear);
    onYearChange(newYear);
  };

  return (
    <div className={`flex items-center justify-center gap-6 ${className}`}>
      <button
        onClick={handlePreviousYear}
        className="w-12 h-12 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-muted transition-colors shadow-sm flex items-center justify-center group"
        aria-label="Previous year"
      >
        <Icon name="ChevronLeftIcon" size={24} />
      </button>
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 px-8 py-2 rounded-xl shadow-sm">
        <h2 className="text-3xl font-bold text-foreground tracking-tight">{currentYear}</h2>
      </div>
      <button
        onClick={handleNextYear}
        className="w-12 h-12 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-muted transition-colors shadow-sm flex items-center justify-center group"
        aria-label="Next year"
      >
        <Icon name="ChevronRightIcon" size={24} />
      </button>
    </div>
  );
};

export default YearNavigator;
