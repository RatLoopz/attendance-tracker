'use client';

import { useState, useEffect } from 'react';
import YearNavigator from './YearNavigator';
import MonthCalendar from './MonthCalendar';
import SemesterInfoPanel from './SemesterInfoPanel';

const CalendarDashboardInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentYear, setCurrentYear] = useState(2026);
  const [semesterConfig] = useState({
    startDate: '2026-01-01',
    endDate: '2026-05-31',
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleYearChange = (year: number) => {
    setCurrentYear(year);
  };

  const months = Array.from({ length: 12 }, (_, i) => i);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background pt-[60px] pb-20 md:pb-6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 animate-pulse">
            <div className="h-10 bg-muted rounded w-48 mx-auto" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card rounded-lg shadow-elevation-2 p-6 h-[400px] animate-pulse" />
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg shadow-elevation-2 p-6 h-[600px] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-[60px] pb-20 md:pb-6">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <YearNavigator onYearChange={handleYearChange} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {months.map((month) => (
              <MonthCalendar
                key={month}
                year={currentYear}
                month={month}
                semesterStart={semesterConfig.startDate}
                semesterEnd={semesterConfig.endDate}
              />
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-[76px]">
              <SemesterInfoPanel
                semesterStart={semesterConfig.startDate}
                semesterEnd={semesterConfig.endDate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarDashboardInteractive;