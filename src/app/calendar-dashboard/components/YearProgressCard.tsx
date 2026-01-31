'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface YearProgressCardProps {
  semesterStart: string;
  semesterEnd: string;
  className?: string;
}

const YearProgressCard = ({
  semesterStart,
  semesterEnd,
  className = '',
}: YearProgressCardProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div
        className={`bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-muted/20 rounded w-24 mb-2" />
          <div className="h-10 bg-muted/20 rounded w-16 mb-3" />
          <div className="h-4 bg-muted/20 rounded w-32" />
        </div>
      </div>
    );
  }

  const startDate = new Date(semesterStart);
  const endDate = new Date(semesterEnd);
  const today = new Date();

  // Calculate total days and elapsed days
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);

  // Extract year
  const currentYear = startDate.getFullYear();

  return (
    <div
      className={`bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all ${className}`}
    >
      {/* Year Display */}
      <div className="flex items-center gap-2 mb-1">
        <Icon name="AcademicCapIcon" size={20} className="text-primary" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Academic Year
        </span>
      </div>

      <div className="mb-4">
        <h3 className="text-4xl font-bold text-foreground tracking-tight">{currentYear}</h3>
      </div>

      {/* Progress Info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Semester Progress</span>
          <span className="font-semibold text-foreground">{progress.toFixed(0)}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Days Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Day {elapsedDays} of {totalDays}
          </span>
          <span>{totalDays - elapsedDays} days left</span>
        </div>
      </div>
    </div>
  );
};

export default YearProgressCard;
