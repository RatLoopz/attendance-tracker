'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ClassPeriod {
  id: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subjectName: string;
  subjectCode: string;
  classroom: string;
  instructor: string;
  status: 'attended' | 'missed' | 'cancelled' | 'pending';
}

interface DailyScheduleTimelineProps {
  selectedDate: Date;
  onStatusChange: (periodId: string, status: 'attended' | 'missed' | 'cancelled') => void;
}

const DailyScheduleTimeline = ({ selectedDate, onStatusChange }: DailyScheduleTimelineProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [periods, setPeriods] = useState<ClassPeriod[]>([]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const mockPeriods: ClassPeriod[] = [
      {
        id: 'p1',
        periodNumber: 1,
        startTime: '09:00 AM',
        endTime: '10:00 AM',
        subjectName: 'Data Structures',
        subjectCode: 'CS201',
        classroom: 'Room 301',
        instructor: 'Dr. Sarah Johnson',
        status: 'attended',
      },
      {
        id: 'p2',
        periodNumber: 2,
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        subjectName: 'Database Management',
        subjectCode: 'CS202',
        classroom: 'Room 302',
        instructor: 'Prof. Michael Chen',
        status: 'attended',
      },
      {
        id: 'p3',
        periodNumber: 3,
        startTime: '11:00 AM',
        endTime: '12:00 PM',
        subjectName: 'Operating Systems',
        subjectCode: 'CS203',
        classroom: 'Room 303',
        instructor: 'Dr. Emily Davis',
        status: 'missed',
      },
      {
        id: 'p4',
        periodNumber: 4,
        startTime: '12:00 PM',
        endTime: '01:00 PM',
        subjectName: 'Computer Networks',
        subjectCode: 'CS204',
        classroom: 'Room 304',
        instructor: 'Prof. James Wilson',
        status: 'cancelled',
      },
      {
        id: 'p5',
        periodNumber: 5,
        startTime: '02:00 PM',
        endTime: '03:00 PM',
        subjectName: 'Software Engineering',
        subjectCode: 'CS205',
        classroom: 'Room 305',
        instructor: 'Dr. Lisa Anderson',
        status: 'attended',
      },
      {
        id: 'p6',
        periodNumber: 6,
        startTime: '03:00 PM',
        endTime: '04:00 PM',
        subjectName: 'Web Technologies',
        subjectCode: 'CS206',
        classroom: 'Room 306',
        instructor: 'Prof. Robert Taylor',
        status: 'pending',
      },
    ];

    setPeriods(mockPeriods);
  }, [isHydrated, selectedDate]);

  if (!isHydrated) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card rounded-lg p-4 shadow-elevation-2 animate-pulse">
            <div className="h-20 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  const handleStatusClick = (periodId: string, status: 'attended' | 'missed' | 'cancelled') => {
    setPeriods((prev) => prev.map((p) => (p.id === periodId ? { ...p, status } : p)));
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
    <div className="space-y-4">
      {periods.map((period, index) => {
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
                    <div className="flex items-center gap-1">
                      <Icon name="UserIcon" size={14} />
                      <span className="truncate">{period.instructor}</span>
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
  );
};

export default DailyScheduleTimeline;
