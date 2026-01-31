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
      <div className="bg-card rounded-lg p-4 shadow-elevation-2 animate-pulse">
        <div className="h-12 bg-muted rounded" />
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
    <div className="bg-card rounded-lg p-4 shadow-elevation-2">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handlePreviousDay}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-smooth"
            title="Previous day"
          >
            <Icon name="ChevronLeftIcon" size={20} />
          </button>

          <div className="flex-1 sm:flex-initial text-center">
            <h2 className="font-heading font-semibold text-xl text-foreground">
              {formatDisplayDate(selectedDate)}
            </h2>
            {isToday() && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full caption font-medium mt-1">
                <Icon name="ClockIcon" size={12} />
                Today
              </span>
            )}
          </div>

          <button
            onClick={handleNextDay}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-smooth"
            title="Next day"
          >
            <Icon name="ChevronRightIcon" size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleToday}
            disabled={isToday()}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-smooth
              ${
                isToday()
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:opacity-90'
              }
            `}
          >
            <Icon name="CalendarIcon" size={18} />
            <span className="text-sm font-medium">Today</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-smooth"
              title="Select date"
            >
              <Icon name="CalendarDaysIcon" size={18} />
              <span className="text-sm font-medium hidden sm:inline">Pick Date</span>
            </button>

            {showDatePicker && (
              <div className="absolute right-0 top-full mt-2 bg-popover rounded-lg shadow-elevation-4 p-4 z-50 animate-slide-down">
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={handleDateSelect}
                  className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
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
