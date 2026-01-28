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
  onStatusChange: (periodId: string, status: 'attended' | 'missed' | 'cancelled') => void;
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
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Loading Schedule</h2>
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-lg p-4 shadow-elevation-2 animate-pulse">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 bg-muted rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 bg-muted rounded flex-1"></div>
                <div className="h-8 bg-muted rounded flex-1"></div>
                <div className="h-8 bg-muted rounded flex-1"></div>
              </div>
            </div>
          ))}
        </div>
      </ErrorBoundary>
    );
  }

  const handleStatusClick = (periodId: string, status: 'attended' | 'missed' | 'cancelled') => {
    onStatusChange(periodId, status);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'attended':
        return {
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success',
          icon: 'CheckCircleIcon',
          label: 'Attended',
        };
      case 'missed':
        return {
          color: 'text-error',
          bgColor: 'bg-error/10',
          borderColor: 'border-error',
          icon: 'XCircleIcon',
          label: 'Missed',
        };
      case 'cancelled':
        return {
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning',
          icon: 'ExclamationTriangleIcon',
          label: 'Cancelled',
        };
      case 'pending':
      default:
        return {
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          borderColor: 'border-border',
          icon: 'ClockIcon',
          label: 'Pending',
        };
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        {error && (
          <div className="bg-card rounded-lg p-4 shadow-elevation-2 border border-error">
            <div className="flex items-center gap-2">
              <Icon name="ExclamationTriangleIcon" size={20} className="text-error" />
              <div>
                <h3 className="font-medium text-error">Error</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!error && periods.length === 0 && (
          <div className="bg-card rounded-lg p-8 shadow-elevation-2 text-center">
            <Icon
              name="CalendarDaysIcon"
              size={48}
              className="text-muted-foreground mx-auto mb-4"
            />
            <h3 className="text-lg font-medium text-foreground mb-2">No Classes Today</h3>
            <p className="text-muted-foreground">
              There are no classes scheduled for this day. Enjoy your day off!
            </p>
          </div>
        )}

        {periods.map((period) => {
          const statusConfig = getStatusConfig(period.status);

          return (
            <div
              key={period.id}
              className={`
                bg-card rounded-lg p-4 md:p-6 shadow-elevation-2 transition-smooth
                border-l-4 ${statusConfig.borderColor}
                hover:shadow-elevation-3
              `}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-primary/10 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">Period</span>
                    <span className="text-2xl font-bold text-primary">{period.periodNumber}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-semibold text-lg text-foreground truncate">
                        {period.subjectName}
                      </h3>
                      <span className="caption text-muted-foreground">({period.subjectCode})</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 caption text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Icon name="ClockIcon" size={14} />
                        <span>
                          {period.startTime} - {period.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="MapPinIcon" size={14} />
                        <span>{period.classroom}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div
                    className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg
                    ${statusConfig.bgColor} ${statusConfig.color}
                    justify-center md:justify-start
                  `}
                  >
                    <Icon name={statusConfig.icon as any} size={18} variant="solid" />
                    <span className="text-sm font-medium">{statusConfig.label}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusClick(period.id, 'attended')}
                      className={`
                        flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg
                        transition-smooth text-sm font-medium
                        ${
                          period.status === 'attended'
                            ? 'bg-success text-success-foreground'
                            : 'bg-success/10 text-success hover:bg-success/20'
                        }
                      `}
                      title="Mark as attended"
                    >
                      <Icon name="CheckIcon" size={16} />
                      <span className="hidden sm:inline">Present</span>
                    </button>

                    <button
                      onClick={() => handleStatusClick(period.id, 'missed')}
                      className={`
                        flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg
                        transition-smooth text-sm font-medium
                        ${
                          period.status === 'missed'
                            ? 'bg-error text-error-foreground'
                            : 'bg-error/10 text-error hover:bg-error/20'
                        }
                      `}
                      title="Mark as missed"
                    >
                      <Icon name="XMarkIcon" size={16} />
                      <span className="hidden sm:inline">Absent</span>
                    </button>

                    <button
                      onClick={() => handleStatusClick(period.id, 'cancelled')}
                      className={`
                        flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg
                        transition-smooth text-sm font-medium
                        ${
                          period.status === 'cancelled'
                            ? 'bg-warning text-warning-foreground'
                            : 'bg-warning/10 text-warning hover:bg-warning/20'
                        }
                      `}
                      title="Mark as cancelled"
                    >
                      <Icon name="MinusIcon" size={16} />
                      <span className="hidden sm:inline">Cancel</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ErrorBoundary>
  );
};

export default DailyScheduleTimeline;
