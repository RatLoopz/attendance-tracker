'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAttendanceForMonth, getAttendanceStatusByDate } from '@/lib/attendanceService';
import { DatabaseSetupNotification } from '@/components/ui/DatabaseSetupNotification';
import { formatLocalDate } from '@/lib/dateUtils';

interface AttendanceStatus {
  attended: number;
  missed: number;
  cancelled: number;
}

interface DayData {
  date: number;
  fullDate: string;
  isCurrentMonth: boolean;
  isSemesterDay: boolean;
  isToday: boolean;
  isWeekend: boolean;
  attendanceStatus?: AttendanceStatus;
}

interface MonthCalendarProps {
  year: number;
  month: number;
  semesterStart: string;
  semesterEnd: string;
  className?: string;
}

const MonthCalendar = ({
  year,
  month,
  semesterStart,
  semesterEnd,
  className = '',
}: MonthCalendarProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [calendarDays, setCalendarDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Ensure component is hydrated and user is authenticated
    if (!isHydrated || !user || !user.id) {
      console.warn('Cannot fetch attendance: Component not hydrated or user not authenticated');
      setLoading(false);
      return;
    }

    const fetchAttendanceData = async () => {
      try {
        setLoading(true);

        // Get all dates in the month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        const startingDayOfWeek = firstDay.getDay();

        const monthDates: string[] = [];
        for (let date = 1; date <= daysInMonth; date++) {
          const currentDate = new Date(year, month, date);
          const fullDate = formatLocalDate(currentDate);
          monthDates.push(fullDate);
        }

        // Fetch attendance data for the month
        let attendanceData: Record<string, any> = {};

        try {
          attendanceData = await getAttendanceStatusByDate(user.id, monthDates);
        } catch (attendanceError) {
          console.error('Error fetching attendance data:', attendanceError);
          // Continue with empty attendance data
          attendanceData = {};
        }

        const semesterStartDate = new Date(semesterStart);
        const semesterEndDate = new Date(semesterEnd);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const days: DayData[] = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
          const prevMonthLastDay = new Date(year, month, 0).getDate();
          let date = prevMonthLastDay - startingDayOfWeek + i + 1;
          const prevDateObj = new Date(year, month - 1, date);
          const fullDate = formatLocalDate(prevDateObj);
          days.push({
            date,
            fullDate,
            isCurrentMonth: false,
            isSemesterDay: false,
            isToday: false,
            isWeekend: false,
          });
        }

        for (let date = 1; date <= daysInMonth; date++) {
          const currentDate = new Date(year, month, date);
          const fullDate = formatLocalDate(currentDate);
          const isSemesterDay = currentDate >= semesterStartDate && currentDate <= semesterEndDate;
          const isToday = currentDate.getTime() === today.getTime();
          const dayOfWeek = currentDate.getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          days.push({
            date,
            fullDate,
            isCurrentMonth: true,
            isSemesterDay,
            isToday,
            isWeekend,
            attendanceStatus: attendanceData[fullDate],
          });
        }

        const remainingDays = 42 - days.length;
        for (let date = 1; date <= remainingDays; date++) {
          const nextDateObj = new Date(year, month + 1, date);
          const fullDate = formatLocalDate(nextDateObj);
          days.push({
            date,
            fullDate,
            isCurrentMonth: false,
            isSemesterDay: false,
            isToday: false,
            isWeekend: false,
          });
        }

        setCalendarDays(days);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [year, month, semesterStart, semesterEnd, isHydrated, user]);

  const handleDateClick = (day: DayData) => {
    if (!isHydrated || !day.isCurrentMonth) return;
    router.push(`/daily-attendance?date=${day.fullDate}`);
  };

  const getAttendanceIndicator = (status?: AttendanceStatus) => {
    if (!status) return null;

    const total = status.attended + status.missed + status.cancelled;
    if (total === 0) return null;

    const attendancePercentage = (status.attended / (status.attended + status.missed)) * 100;

    if (attendancePercentage >= 75) {
      return <div className="w-2 h-2 rounded-full bg-success" title="Safe attendance" />;
    } else if (attendancePercentage >= 70) {
      return <div className="w-2 h-2 rounded-full bg-warning" title="Caution zone" />;
    } else {
      return <div className="w-2 h-2 rounded-full bg-error" title="Danger zone" />;
    }
  };

  if (!isHydrated || loading) {
    return (
      <div className={`bg-card rounded-lg shadow-elevation-2 p-6 ${className}`}>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground">Loading...</h3>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center caption font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: 35 }).map((_, index) => (
            <div key={index} className="aspect-square bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 ${className}`}
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground tracking-tight">{monthNames[month]}</h3>
        {/* Optional: Add month-specific stats or indicators here */}
      </div>

      <div className="grid grid-cols-7 gap-3 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className={`text-center text-[0.65rem] uppercase tracking-wider font-bold py-2 ${day === 'Sun' || day === 'Sat' ? 'text-error/70' : 'text-muted-foreground'}`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3">
        {calendarDays.map((day, index) => {
          // Base styling
          let dayClasses =
            'relative aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 group';

          // State-based styling
          if (!day.isCurrentMonth) {
            dayClasses += ' opacity-20 cursor-not-allowed bg-muted/10';
          } else {
            dayClasses += ' cursor-pointer';

            if (day.isWeekend) {
              dayClasses += ' bg-[#f5e6e6] dark:bg-[#3f2e2e] border border-transparent';
            } else if (day.isSemesterDay) {
              dayClasses += ' bg-primary/5 hover:bg-primary/10 border border-primary/10';
            } else {
              dayClasses += ' bg-muted/20 hover:bg-muted/40 border border-transparent';
            }

            if (day.isToday) {
              dayClasses += ' ring-1 ring-primary ring-offset-1 ring-offset-background z-10';
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              disabled={!day.isCurrentMonth}
              className={dayClasses}
              aria-label={`${monthNames[month]} ${day.date}, ${year} ${day.isWeekend ? '(Holiday)' : ''}`}
            >
              <span
                className={`text-sm font-semibold ${
                  day.isToday
                    ? 'text-primary'
                    : day.isWeekend && day.isCurrentMonth
                      ? 'text-[#8a5d5d] dark:text-[#dcbdbd]'
                      : 'text-foreground/80'
                }`}
              >
                {day.date}
              </span>

              {/* Attendance Indicator */}
              {day.isCurrentMonth && !day.isWeekend && day.isSemesterDay && (
                <div className="h-1.5 flex items-end">
                  {getAttendanceIndicator(day.attendanceStatus) || (
                    <div className="w-1.5 h-1.5 rounded-full bg-muted/30" />
                  )}
                </div>
              )}

              {/* Holiday Indicator - Removed for minimalism */}
              {day.isCurrentMonth && day.isWeekend && null}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthCalendar;
