'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

interface ClassPeriod {
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
  onStatusChange: (periodId: string, status: 'attended' | 'missed' | 'cancelled') => void;
}

const DailyScheduleTimeline = ({ selectedDate, onStatusChange }: DailyScheduleTimelineProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [periods, setPeriods] = useState<ClassPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const dateStr = selectedDate.toISOString().split('T')[0];

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || !user) return;

    const fetchScheduleAndAttendance = async () => {
      try {
        setLoading(true);
        setError(null);

        // Import needed services
        const { getSemesterConfiguration } = await import('@/lib/semesterConfig');
        const { generateDailySchedule, enrichScheduleWithSubjectDetails, getDayOfWeek, isWeekend } =
          await import('@/lib/scheduleGenerator');

        // Check if it's a weekend
        if (isWeekend(selectedDate)) {
          console.log('Selected date is a weekend, no classes scheduled');
          setPeriods([]);
          setLoading(false);
          return;
        }

        // Fetch semester configuration for the user
        const { data: semesterConfig, error: configError } = await getSemesterConfiguration(
          user.id
        );

        if (configError) {
          console.error('Configuration fetch error:', configError);
          throw new Error(`Failed to fetch semester configuration: ${configError.message}`);
        }

        if (!semesterConfig) {
          console.log('No semester configuration found for user');
          setError('Please configure your semester first by going to Semester Configuration');
          setPeriods([]);
          setLoading(false);
          return;
        }

        // Generate daily schedule for the selected date
        const dayOfWeek = getDayOfWeek(selectedDate);
        console.log(`Generating schedule for ${dayOfWeek}...`);

        const dailySchedule = generateDailySchedule(
          selectedDate,
          semesterConfig.schedule,
          semesterConfig.subjects
        );

        console.log(`Generated ${dailySchedule.length} periods for ${dayOfWeek}`);

        // Fetch attendance records for the user on that date
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance_records')
          .select('subject_id, status')
          .eq('user_id', user.id)
          .eq('date', dateStr);

        if (attendanceError) {
          console.error('Attendance fetch error:', attendanceError);
          // Don't fail completely, just log the error
        }

        // Create a map of subject_id to status for quick lookup
        const attendanceMap = new Map();
        attendanceData?.forEach((record) => {
          // Map database status to UI status
          const uiStatus =
            record.status === 'present'
              ? 'attended'
              : record.status === 'absent'
                ? 'missed'
                : record.status === 'late'
                  ? 'cancelled'
                  : 'pending';
          attendanceMap.set(record.subject_id, uiStatus);
        });

        // Enrich schedule with subject details
        const enrichedSchedule = enrichScheduleWithSubjectDetails(
          dailySchedule,
          semesterConfig.subjects
        );

        // Combine schedule data with attendance status
        const combinedData: ClassPeriod[] = enrichedSchedule.map((period) => ({
          id: period.subjectId,
          periodNumber: period.periodNumber,
          startTime: period.startTime,
          endTime: period.endTime,
          subjectName: period.subjectName,
          subjectCode: period.subjectCode,
          classroom: period.classroom,
          status: (attendanceMap.get(period.subjectId) || 'pending') as ClassPeriod['status'],
        }));

        setPeriods(combinedData);
      } catch (error) {
        console.error('Error fetching schedule and attendance:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(errorMessage);
        setPeriods([]);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleAndAttendance();
  }, [isHydrated, selectedDate, user, dateStr]);

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

  const handleStatusClick = async (
    periodId: string,
    status: 'attended' | 'missed' | 'cancelled'
  ) => {
    try {
      if (!user) {
        alert('You must be logged in to record attendance');
        return;
      }

      // Map status to database format
      const dbStatus = status === 'attended' ? 'present' : status === 'missed' ? 'absent' : 'late';

      // Optimistically update local state first
      setPeriods((prev) => prev.map((p) => (p.id === periodId ? { ...p, status } : p)));

      // Record attendance to database
      const { recordAttendance } = await import('@/lib/attendanceRecordingService');
      const { error } = await recordAttendance({
        userId: user.id,
        subjectId: periodId,
        date: dateStr,
        status: dbStatus,
      });

      if (error) {
        console.error('Failed to record attendance:', error);
        // Revert the optimistic update
        setPeriods((prev) =>
          prev.map((p) => (p.id === periodId ? { ...p, status: 'pending' } : p))
        );
        alert(`Failed to save attendance: ${error.message}`);
        return;
      }

      console.log('Attendance recorded successfully');

      // Notify parent component
      if (typeof onStatusChange === 'function') {
        onStatusChange(periodId, status);
      }
    } catch (error) {
      console.error('Error in handleStatusClick:', error);
      alert('An unexpected error occurred while saving attendance');
      setPeriods((prev) => prev.map((p) => (p.id === periodId ? { ...p, status: 'pending' } : p)));
    }
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
