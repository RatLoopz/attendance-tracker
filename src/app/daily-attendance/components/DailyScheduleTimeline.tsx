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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useAuth();
  const dateStr = selectedDate.toISOString().split('T')[0];

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || !user) return;

    const fetchScheduleAndAttendance = async (isRetry = false) => {
      try {
        setLoading(true);
        setError(null);

        // Reset error state if this is a retry
        if (isRetry) {
          console.log(`Retrying fetch (attempt ${retryCount + 1})...`);
        }

        // First fetch the schedule for the day
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('class_schedule')
          .select('*')
          .eq('date', dateStr)
          .order('period_number');

        if (scheduleError) {
          console.error('Schedule fetch error:', scheduleError);
          throw new Error(`Failed to fetch schedule: ${scheduleError.message}`);
        }

        // Then fetch attendance records for the user on that date
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance_records')
          .select('subject_id, status')
          .eq('user_id', user.id)
          .eq('date', dateStr);

        if (attendanceError) {
          console.error('Attendance fetch error:', attendanceError);
          throw new Error(`Failed to fetch attendance: ${attendanceError.message}`);
        }

        // Create a map of subject_id to status for quick lookup
        const attendanceMap = new Map();
        attendanceData?.forEach((record) => {
          attendanceMap.set(record.subject_id, record.status);
        });

        // Combine schedule data with attendance status
        const combinedData: ClassPeriod[] =
          scheduleData?.map((period) => ({
            id: period.id,
            periodNumber: period.period_number,
            startTime: period.start_time,
            endTime: period.end_time,
            subjectName: period.subject_name,
            subjectCode: period.subject_code,
            classroom: period.classroom,
            instructor: period.instructor,
            status: attendanceMap.get(period.id) || 'pending',
          })) || [];

        setPeriods(combinedData);
        setRetryCount(0); // Reset retry count on successful fetch
      } catch (error) {
        console.error('Error fetching schedule and attendance:', error);

        // Extract error message for better debugging
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        // Log more detailed error information
        console.error('Detailed error info:', {
          date: dateStr,
          userId: user?.id,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        });

        // Set error state for display
        setError(errorMessage);

        // Implement retry logic (max 3 retries)
        if (retryCount < 3 && !isRetry) {
          console.log(`Retrying in 2 seconds... (${retryCount + 1}/3)`);
          setRetryCount((prev) => prev + 1);

          setTimeout(() => {
            fetchScheduleAndAttendance(true);
          }, 2000);

          return; // Don't fall back to mock data yet
        }

        // Fallback to mock data if all retries failed
        if (retryCount >= 3) {
          console.log('All retries failed, using fallback data');
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
        }
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
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
      // Validate inputs
      if (!periodId) {
        console.error('Invalid period ID provided');
        return;
      }

      if (!['attended', 'missed', 'cancelled'].includes(status)) {
        console.error('Invalid status provided:', status);
        return;
      }

      if (!user) {
        console.error('User not authenticated');
        alert('You must be logged in to record attendance');
        return;
      }

      // Map status to database format
      const dbStatus = status === 'attended' ? 'present' : status === 'missed' ? 'absent' : 'late';

      // Optimistically update local state first for better UX
      setPeriods((prev) => {
        const updatedPeriods = prev.map((p) => (p.id === periodId ? { ...p, status } : p));

        // Log the status change for debugging
        const period = prev.find((p) => p.id === periodId);
        if (period) {
          console.log(
            `Status updated for period ${period.periodNumber} (${period.subjectName}): ${status}`
          );
        }

        return updatedPeriods;
      });

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
      // Revert optimistic update
      setPeriods((prev) => prev.map((p) => (p.id === periodId ? { ...p, status: 'pending' } : p)));
    }
  };

  const getStatusConfig = (status: string) => {
    try {
      // Log the status for debugging
      console.log(`Getting config for status: ${status}`);

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
          return {
            color: 'text-muted-foreground',
            bgColor: 'bg-muted',
            borderColor: 'border-border',
            icon: 'ClockIcon',
            label: 'Pending',
          };
        default:
          // Log unexpected status values for debugging
          console.warn(`Unexpected status value: "${status}", defaulting to "pending"`);
          return {
            color: 'text-muted-foreground',
            bgColor: 'bg-muted',
            borderColor: 'border-border',
            icon: 'ClockIcon',
            label: 'Pending',
          };
      }
    } catch (error) {
      console.error('Error in getStatusConfig:', error);
      // Return a safe default configuration
      return {
        color: 'text-muted-foreground',
        bgColor: 'bg-muted',
        borderColor: 'border-border',
        icon: 'ClockIcon',
        label: 'Unknown',
      };
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        {error && (
          <div className="bg-card rounded-lg p-4 shadow-elevation-2 border border-error">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="ExclamationTriangleIcon" size={20} className="text-error" />
                <div>
                  <h3 className="font-medium text-error">Connection Error</h3>
                  <p className="text-sm text-muted-foreground">
                    Failed to load schedule data. Using cached or mock data.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setRetryCount(0);
                  setError(null);
                  // Define the function in the component's scope
                  (async () => {
                    try {
                      setLoading(true);

                      // First fetch the schedule for the day
                      const { data: scheduleData, error: scheduleError } = await supabase
                        .from('class_schedule')
                        .select('*')
                        .eq('date', dateStr)
                        .order('period_number');

                      if (scheduleError) {
                        console.error('Schedule fetch error:', scheduleError);
                        throw new Error(`Failed to fetch schedule: ${scheduleError.message}`);
                      }

                      // Then fetch attendance records for the user on that date
                      const { data: attendanceData, error: attendanceError } = await supabase
                        .from('attendance_records')
                        .select('subject_id, status')
                        .eq('user_id', user?.id || '')
                        .eq('date', dateStr);

                      if (attendanceError) {
                        console.error('Attendance fetch error:', attendanceError);
                        throw new Error(`Failed to fetch attendance: ${attendanceError.message}`);
                      }

                      // Create a map of subject_id to status for quick lookup
                      const attendanceMap = new Map();
                      attendanceData?.forEach((record) => {
                        attendanceMap.set(record.subject_id, record.status);
                      });

                      // Combine schedule data with attendance status
                      const combinedData: ClassPeriod[] =
                        scheduleData?.map((period) => ({
                          id: period.id,
                          periodNumber: period.period_number,
                          startTime: period.start_time,
                          endTime: period.end_time,
                          subjectName: period.subject_name,
                          subjectCode: period.subject_code,
                          classroom: period.classroom,
                          instructor: period.instructor,
                          status: attendanceMap.get(period.id) || 'pending',
                        })) || [];

                      setPeriods(combinedData);
                      setError(null);
                    } catch (error) {
                      console.error('Error fetching schedule and attendance:', error);
                      const errorMessage =
                        error instanceof Error ? error.message : 'Unknown error occurred';
                      setError(errorMessage);
                    } finally {
                      setLoading(false);
                    }
                  })();
                }}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

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
    </ErrorBoundary>
  );
};

export default DailyScheduleTimeline;
