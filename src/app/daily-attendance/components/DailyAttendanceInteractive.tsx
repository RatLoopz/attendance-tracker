'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/common/Header';
import DateContextIndicator from '@/components/common/DateContextIndicator';
import QuickStatusIndicator from '@/components/common/QuickStatusIndicator';
import DateNavigator from './DateNavigator';
import DailyScheduleTimeline, { ClassPeriod } from './DailyScheduleTimeline';
import DailyStatisticsSummary, { DailyTotals } from './DailyStatisticsSummary';
import DateNotesEditor from './DateNotesEditor';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { getSubjectAttendanceStats, SubjectStats } from '@/lib/attendanceStatsService';
import { getSemesterConfiguration } from '@/lib/semesterConfig';
import {
  generateDailySchedule,
  enrichScheduleWithSubjectDetails,
  getDayOfWeek,
  isWeekend,
} from '@/lib/scheduleGenerator';
import { recordAttendance, deleteAttendanceForSubject } from '@/lib/attendanceRecordingService';
import { formatLocalDate, parseLocalDate } from '@/lib/dateUtils';

const DailyAttendanceContent = () => {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // State for data
  const [periods, setPeriods] = useState<ClassPeriod[]>([]);
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update date from search params
  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      setSelectedDate(parseLocalDate(dateParam));
    }
  }, [searchParams]);

  // Fetch all data
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Use local date format for DB query
        const dateStr = formatLocalDate(selectedDate);

        // ... (rest of logic)

        // 1. Fetch Semester Config & Schedule
        const { data: semesterConfig, error: configError } = await getSemesterConfiguration(
          user.id
        );

        if (configError) throw configError;

        if (!semesterConfig) {
          setPeriods([]); // No config
        } else {
          // Validate date matches semester duration
          const startDate = new Date(semesterConfig.startDate);
          const endDate = new Date(semesterConfig.endDate);
          endDate.setHours(23, 59, 59, 999); // Include the entire end date

          // Reset times for strict date comparison
          const checkDate = new Date(selectedDate);
          checkDate.setHours(0, 0, 0, 0);
          const checkStart = new Date(startDate);
          checkStart.setHours(0, 0, 0, 0);
          const checkEnd = new Date(endDate);
          checkEnd.setHours(23, 59, 59, 999);

          if (checkDate < checkStart || checkDate > checkEnd) {
            setPeriods([]);
            setError(
              `Selected date is outside the semester (${semesterConfig.startDate} to ${semesterConfig.endDate})`
            );
          } else {
            setError(null);
            if (isWeekend(selectedDate)) {
              setPeriods([]);
            } else {
              const dayOfWeek = getDayOfWeek(selectedDate);
              const dailySchedule = generateDailySchedule(
                selectedDate,
                semesterConfig.schedule,
                semesterConfig.subjects
              );

              // Fetch daily attendance records
              const { data: attendanceData } = await supabase
                .from('attendance_records')
                .select('subject_id, status')
                .eq('user_id', user.id)
                .eq('date', dateStr);

              const attendanceMap = new Map();
              attendanceData?.forEach((record) => {
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

              // Associate subject details
              const enriched = enrichScheduleWithSubjectDetails(
                dailySchedule,
                semesterConfig.subjects
              );

              // Combine
              const combinedPeriods: ClassPeriod[] = enriched.map((p) => ({
                id: p.subjectId,
                periodNumber: p.periodNumber,
                startTime: p.startTime,
                endTime: p.endTime,
                subjectName: p.subjectName,
                subjectCode: p.subjectCode,
                classroom: p.classroom,
                status: (attendanceMap.get(p.subjectId) || 'pending') as ClassPeriod['status'],
              }));

              setPeriods(combinedPeriods);
            }
          }
        }

        // 2. Fetch Subject Statistics (for summary)
        const { data: stats, error: statsError } = await getSubjectAttendanceStats(user.id);
        if (statsError) console.error('Error fetching stats:', statsError);
        setSubjectStats(stats || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, selectedDate]);

  // Handle status update
  const handleStatusChange = async (
    periodId: string,
    status: 'attended' | 'missed' | 'cancelled' | 'pending'
  ) => {
    if (!user) return;

    // Optimistic update
    setPeriods((prev) => prev.map((p) => (p.id === periodId ? { ...p, status } : p)));

    const dateStr = formatLocalDate(selectedDate);

    let error = null;

    if (status === 'pending') {
      // Delete record if resetting to pending
      const { error: deleteError } = await deleteAttendanceForSubject(user.id, periodId, dateStr);
      error = deleteError;
    } else {
      // Insert/Update record
      const dbStatus = status === 'attended' ? 'present' : status === 'missed' ? 'absent' : 'late';

      const { error: recordError } = await recordAttendance({
        userId: user.id,
        subjectId: periodId,
        date: dateStr,
        status: dbStatus,
      });
      error = recordError;
    }

    if (error) {
      console.error('Failed to update attendance:', error);
      // Revert on error - fetch fresh data to be safe, or revert to previous known state
      // For now, simpler to just fetch fresh
      const { data: freshAttendance } = await supabase
        .from('attendance_records')
        .select('status')
        .eq('user_id', user.id)
        .eq('subject_id', periodId)
        .eq('date', dateStr)
        .single();

      let revertedStatus: ClassPeriod['status'] = 'pending';
      if (freshAttendance) {
        revertedStatus =
          freshAttendance.status === 'present'
            ? 'attended'
            : freshAttendance.status === 'absent'
              ? 'missed'
              : freshAttendance.status === 'late'
                ? 'cancelled'
                : 'pending';
      }

      setPeriods((prev) =>
        prev.map((p) => (p.id === periodId ? { ...p, status: revertedStatus } : p))
      );
      return;
    }

    // Refresh statistics silently after update
    const { data: stats } = await getSubjectAttendanceStats(user.id);
    if (stats) setSubjectStats(stats);
  };

  // Calculate daily totals
  const dailyTotals: DailyTotals = {
    attended: periods.filter((p) => p.status === 'attended').length,
    missed: periods.filter((p) => p.status === 'missed').length,
    cancelled: periods.filter((p) => p.status === 'cancelled').length,
    total: periods.length,
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-background pt-[76px] pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <DateContextIndicator />
              <QuickStatusIndicator />
            </div>
          </div>

          <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-foreground">Class Schedule</h2>
                </div>
                <DailyScheduleTimeline
                  selectedDate={selectedDate}
                  periods={periods}
                  onStatusChange={handleStatusChange}
                  loading={loading}
                  error={error}
                />
              </div>

              <DateNotesEditor selectedDate={selectedDate} />
            </div>

            <div className="lg:col-span-1">
              <DailyStatisticsSummary
                dailyTotals={dailyTotals}
                subjectStats={subjectStats}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-background pt-[76px] pb-20 md:pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-card border border-border/50 rounded-xl p-4">
        <div className="h-12 bg-muted/50 rounded" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border/50 rounded-xl p-4">
            <div className="h-96 bg-muted/50 rounded" />
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-card border border-border/50 rounded-xl p-4">
            <div className="h-64 bg-muted/50 rounded" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DailyAttendanceInteractive = () => {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DailyAttendanceContent />
    </Suspense>
  );
};

export default DailyAttendanceInteractive;
