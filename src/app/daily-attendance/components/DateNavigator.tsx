'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { formatLocalDate, parseLocalDate } from '@/lib/dateUtils';

interface DateNavigatorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DateNavigator = ({ selectedDate, onDateChange }: DateNavigatorProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-lg p-4 border border-border/50">
        <div className="h-12 bg-muted/50 rounded" />
      </div>
    );
  }

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
    router.push(`/daily-attendance?date=${formatLocalDate(newDate)}`);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
    router.push(`/daily-attendance?date=${formatLocalDate(newDate)}`);
  };

  const handleToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight
    onDateChange(today);
    router.push(`/daily-attendance?date=${formatLocalDate(today)}`);
  };

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = parseLocalDate(e.target.value);
    onDateChange(newDate);
    router.push(`/daily-attendance?date=${e.target.value}`);
    setShowDatePicker(false);
  };

  const isToday = () => {
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handlePreviousDay}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Previous day"
          >
            <Icon name="ChevronLeftIcon" size={18} />
          </button>

          <div className="flex-1 sm:flex-initial text-center min-w-[200px]">
            <h2 className="font-heading font-semibold text-lg text-foreground">
              {formatDisplayDate(selectedDate)}
            </h2>
            {isToday() && (
              <span className="text-xs font-medium text-primary block mt-0.5">Today</span>
            )}
          </div>

          <button
            onClick={handleNextDay}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Next day"
          >
            <Icon name="ChevronRightIcon" size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <button
            onClick={handleToday}
            disabled={isToday()}
            className={`
              text-sm font-medium px-3 py-1.5 rounded-lg transition-colors
              ${
                isToday()
                  ? 'text-muted-foreground/50 cursor-not-allowed'
                  : 'text-primary hover:bg-primary/5'
              }
            `}
          >
            Go to Today
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              title="Select date"
            >
              <Icon name="CalendarDaysIcon" size={16} />
              <span className="text-sm font-medium hidden sm:inline">Pick Date</span>
            </button>

            {showDatePicker && (
              <div className="absolute right-0 top-full mt-2 bg-popover border border-border rounded-lg shadow-sm p-4 z-50">
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={handleDateSelect}
                  className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateNavigator;
