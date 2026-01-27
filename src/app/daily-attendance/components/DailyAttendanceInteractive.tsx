'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/common/Header';
import DateContextIndicator from '@/components/common/DateContextIndicator';
import QuickStatusIndicator from '@/components/common/QuickStatusIndicator';
import DateNavigator from './DateNavigator';
import DailyScheduleTimeline from './DailyScheduleTimeline';
import DailyStatisticsSummary from './DailyStatisticsSummary';
import DateNotesEditor from './DateNotesEditor';

const DailyAttendanceContent = () => {
  const searchParams = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      setSelectedDate(new Date(dateParam));
    }
  }, [searchParams]);

  const handleStatusChange = async (periodId: string, status: 'attended' | 'missed' | 'cancelled') => {
    try {
      // This would be replaced with actual implementation using Supabase
      // The upsert would use a composite key of (user_id, date, subject_id)
      console.log(`Period ${periodId} marked as ${status}`);

      // Example implementation:
      // const { error } = await supabase
      //   .from('attendance_records')
      //   .upsert({
      //     user_id: user.id,
      //     date: selectedDate.toISOString().split('T')[0],
      //     subject_id: periodId,
      //     status: status,
      //     updated_at: new Date().toISOString()
      //   }, {
      //     onConflict: 'user_id,date,subject_id'
      //   });
      // 
      // if (error) throw error;
    } catch (error) {
      console.error('Error updating attendance:', error);
      // Add toast notification here
    }
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
              <div className="bg-card rounded-lg p-4 md:p-6 shadow-elevation-2">
                <h2 className="font-heading font-semibold text-xl text-foreground mb-4">
                  Class Schedule
                </h2>
                <DailyScheduleTimeline
                  selectedDate={selectedDate}
                  onStatusChange={handleStatusChange}
                />
              </div>

              <DateNotesEditor selectedDate={selectedDate} />
            </div>

            <div className="lg:col-span-1">
              <DailyStatisticsSummary selectedDate={selectedDate} />
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
      <div className="bg-card rounded-lg p-4 shadow-elevation-2 animate-pulse">
        <div className="h-12 bg-muted rounded" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-lg p-4 shadow-elevation-2 animate-pulse">
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg p-4 shadow-elevation-2 animate-pulse">
            <div className="h-64 bg-muted rounded" />
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
