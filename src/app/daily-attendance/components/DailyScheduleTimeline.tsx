'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

export interface ClassPeriod {
  id: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subjectName: string;
  subjectCode: string;
  classroom: string;
  status: 'attended' | 'missed' | 'cancelled' | 'pending';
}

interface DailyScheduleTimelineProps {
  selectedDate: Date;
  periods: ClassPeriod[];
  onStatusChange: (
    periodId: string,
    status: 'attended' | 'missed' | 'cancelled' | 'pending'
  ) => void;
  loading?: boolean;
  error?: string | null;
}

const DailyScheduleTimeline = ({
  selectedDate,
  periods,
  onStatusChange,
  loading = false,
  error = null,
}: DailyScheduleTimelineProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2 opacity-50"></div>
          <p className="text-sm text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card rounded-xl p-6 border border-border/50 shadow-sm animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted/50 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-muted/50 rounded w-1/3"></div>
                <div className="h-4 bg-muted/30 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const handleStatusClick = (
    periodId: string,
    status: 'attended' | 'missed' | 'cancelled' | 'pending'
  ) => {
    onStatusChange(periodId, status);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'attended':
        return {
          cardBorder: 'border-l-success',
          badgeColor: 'text-success bg-success/10 border-success/20',
        };
      case 'missed':
        return {
          cardBorder: 'border-l-[#8a5d5d]',
          badgeColor:
            'text-[#8a5d5d] bg-[#f5e6e6] border-[#8a5d5d]/20 dark:bg-[#3f2e2e] dark:text-[#dcbdbd]',
        };
      case 'cancelled':
        return {
          cardBorder: 'border-l-warning',
          badgeColor: 'text-warning bg-warning/10 border-warning/20',
        };
      case 'pending':
      default:
        return {
          cardBorder: 'border-l-transparent',
          badgeColor: 'text-muted-foreground bg-muted border-border',
        };
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl p-4 flex items-center gap-3">
          <Icon
            name="ExclamationTriangleIcon"
            size={20}
            className="text-red-600 dark:text-red-400"
          />
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
        </div>
      )}

      {!error && periods.length === 0 && (
        <div className="bg-card rounded-xl p-12 border border-border/50 border-dashed text-center">
          <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="CalendarDaysIcon" size={32} className="text-primary/60" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No Classes Scheduled</h3>
          <p className="text-muted-foreground">Enjoy your free time!</p>
        </div>
      )}

      {periods.map((period) => {
        const config = getStatusConfig(period.status);
        const isPending = period.status === 'pending';

        return (
          <div
            key={period.id}
            className={`
              bg-card rounded-xl p-5 border border-border/50 shadow-sm
              border-l-[6px] transition-all hover:shadow-md relative
              ${config.cardBorder}
            `}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Period Number */}
              <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors flex-shrink-0">
                <span className="text-[10px] uppercase text-primary/60 font-bold tracking-wider">
                  Period
                </span>
                <span className="text-2xl font-bold text-primary">{period.periodNumber}</span>
              </div>

              {/* Subject Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-foreground truncate uppercase tracking-tight">
                    {period.subjectName}
                  </h3>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {period.subjectCode}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Icon name="ClockIcon" size={14} className="text-primary/70" />
                    <span>
                      {period.startTime} - {period.endTime}
                    </span>
                  </div>
                  {period.classroom && (
                    <div className="flex items-center gap-1.5">
                      <Icon name="MapPinIcon" size={14} className="text-primary/70" />
                      <span>{period.classroom}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-end">
                {/* Present Button */}
                <button
                  onClick={() => handleStatusClick(period.id, 'attended')}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
                    ${
                      period.status === 'attended'
                        ? 'bg-success text-success-foreground shadow-sm ring-2 ring-success ring-offset-2 ring-offset-card'
                        : 'text-success hover:bg-success/10'
                    }
                  `}
                  title="Mark Present"
                >
                  <Icon name="CheckIcon" size={16} strokeWidth={2.5} />
                  <span>Present</span>
                </button>

                {/* Absent Button (Nude Red) */}
                <button
                  onClick={() => handleStatusClick(period.id, 'missed')}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
                    ${
                      period.status === 'missed'
                        ? 'bg-[#8a5d5d] text-white shadow-sm ring-2 ring-[#8a5d5d] ring-offset-2 ring-offset-card'
                        : 'text-[#8a5d5d] hover:bg-[#f5e6e6] dark:hover:bg-[#3f2e2e]'
                    }
                  `}
                  title="Mark Absent"
                >
                  <Icon name="XMarkIcon" size={16} strokeWidth={2.5} />
                  <span>Absent</span>
                </button>

                {/* Cancel Button */}
                <button
                  onClick={() => handleStatusClick(period.id, 'cancelled')}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5
                    ${
                      period.status === 'cancelled'
                        ? 'bg-warning text-warning-foreground shadow-sm ring-2 ring-warning ring-offset-2 ring-offset-card'
                        : 'text-warning hover:bg-warning/10'
                    }
                  `}
                  title="Class Cancelled"
                >
                  <Icon name="MinusIcon" size={16} strokeWidth={2.5} />
                  <span className="hidden sm:inline">Cancel</span>
                </button>

                {/* Reset Button (Only visible if not pending) */}
                {!isPending && (
                  <button
                    onClick={() => handleStatusClick(period.id, 'pending')}
                    className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                    title="Reset Status"
                  >
                    <Icon name="ArrowPathIcon" size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Status Indicator Text (Top Right Absolute or within flow?) 
                The screenshot puts it in the flow or top right. Let's keep simpler clean look above.
                Actually, the screenshot had "Missed" text. Let's add a small badge if status is set.
            */}
            {!isPending && (
              <div className="absolute top-3 right-4 sm:hidden">
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${config.badgeColor}`}
                >
                  {period.status}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DailyScheduleTimeline;
