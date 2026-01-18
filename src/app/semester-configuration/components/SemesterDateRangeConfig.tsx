'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface SemesterDateRangeConfigProps {
  onDateChange: (startDate: string, endDate: string) => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

const SemesterDateRangeConfig = ({
  onDateChange,
  initialStartDate = '',
  initialEndDate = '',
}: SemesterDateRangeConfigProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [error, setError] = useState('');

  // Track if the component has been initialized to prevent calling onDateChange on mount
  const isInitializedRef = useRef(false);
  const previousStartDateRef = useRef(startDate);
  const previousEndDateRef = useRef(endDate);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Skip validation on first render or when values haven't actually changed
    if (!isHydrated) return;

    const hasStartDateChanged = startDate !== previousStartDateRef.current;
    const hasEndDateChanged = endDate !== previousEndDateRef.current;

    // Only validate and call parent callback if values have changed and it's not initial mount
    if (
      isInitializedRef.current &&
      (hasStartDateChanged || hasEndDateChanged) &&
      startDate &&
      endDate
    ) {
      validateDates(startDate, endDate);
    } else if (!isInitializedRef.current && startDate && endDate) {
      // On initial mount, just validate without calling parent callback
      validateDatesWithoutCallback(startDate, endDate);
      isInitializedRef.current = true;
    }

    // Update refs
    previousStartDateRef.current = startDate;
    previousEndDateRef.current = endDate;
  }, [startDate, endDate, isHydrated]);

  const validateDatesWithoutCallback = (start: string, end: string) => {
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);

    if (startDateObj >= endDateObj) {
      setError('End date must be after start date');
      return false;
    }

    const diffTime = Math.abs(endDateObj.getTime() - startDateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 90) {
      setError('Semester duration must be at least 90 days');
      return false;
    }

    if (diffDays > 180) {
      setError('Semester duration cannot exceed 180 days');
      return false;
    }

    setError('');
    return true;
  };

  const validateDates = (start: string, end: string) => {
    const isValid = validateDatesWithoutCallback(start, end);
    if (isValid) {
      onDateChange(start, end);
    }
    return isValid;
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
  };

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-elevation-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="CalendarDaysIcon" size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Semester Date Range</h2>
            <p className="caption text-muted-foreground">Loading configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-elevation-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon name="CalendarDaysIcon" size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Semester Date Range</h2>
          <p className="caption text-muted-foreground">Define your semester start and end dates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-foreground mb-2">
            Start Date
          </label>
          <div className="relative">
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
              required
            />
            <Icon
              name="CalendarIcon"
              size={20}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-foreground mb-2">
            End Date
          </label>
          <div className="relative">
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
              required
            />
            <Icon
              name="CalendarIcon"
              size={20}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-error/10 border border-error/20 rounded-lg">
          <Icon
            name="ExclamationCircleIcon"
            size={20}
            className="text-error flex-shrink-0 mt-0.5"
          />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {!error && startDate && endDate && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
          <Icon name="CheckCircleIcon" size={20} className="text-success flex-shrink-0 mt-0.5" />
          <p className="text-sm text-success">
            Valid semester duration:{' '}
            {Math.ceil(
              (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
            )}{' '}
            days
          </p>
        </div>
      )}
    </div>
  );
};

export default SemesterDateRangeConfig;
