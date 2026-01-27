'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAttendanceForMonth, getAttendanceStatusByDate } from '@/lib/attendanceService';
import { DatabaseSetupNotification } from '@/components/ui/DatabaseSetupNotification';


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
  attendanceStatus?: AttendanceStatus;
}

interface MonthCalendarProps {
  year: number;
  month: number;
  semesterStart: string;
  semesterEnd: string;
  className?: string;
}

const MonthCalendar = ({ year, month, semesterStart, semesterEnd, className = '' }: MonthCalendarProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [calendarDays, setCalendarDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
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
        
        const monthDates: string[] = [];
        for (let date = 1; date <= daysInMonth; date++) {
          const currentDate = new Date(year, month, date);
          currentDate.setHours(0, 0, 0, 0);
          const fullDate = currentDate.toISOString().split('T')[0];
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

        const startingDayOfWeek = firstDay.getDay();
        // daysInMonth is already declared above

        const semesterStartDate = new Date(semesterStart);
        const semesterEndDate = new Date(semesterEnd);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const days: DayData[] = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
          const prevMonthLastDay = new Date(year, month, 0).getDate();
          let date = prevMonthLastDay - startingDayOfWeek + i + 1;
          const fullDate = new Date(year, month - 1, date).toISOString().split('T')[0];
          days.push({
            date,
            fullDate,
            isCurrentMonth: false,
            isSemesterDay: false,
            isToday: false,
          });
        }

        for (let date = 1; date <= daysInMonth; date++) {
          const currentDate = new Date(year, month, date);
          currentDate.setHours(0, 0, 0, 0);
          const fullDate = currentDate.toISOString().split('T')[0];
          const isSemesterDay = currentDate >= semesterStartDate && currentDate <= semesterEndDate;
          const isToday = currentDate.getTime() === today.getTime();

          days.push({
            date,
            fullDate,
            isCurrentMonth: true,
            isSemesterDay,
            isToday,
            attendanceStatus: attendanceData[fullDate],
          });
        }

        const remainingDays = 42 - days.length;
        for (let date = 1; date <= remainingDays; date++) {
          const fullDate = new Date(year, month + 1, date).toISOString().split('T')[0];
          days.push({
            date,
            fullDate,
            isCurrentMonth: false,
            isSemesterDay: false,
            isToday: false,
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
    <div className={`bg-card rounded-lg shadow-elevation-2 p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground">{monthNames[month]}</h3>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center caption font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}

        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(day)}
            disabled={!day.isCurrentMonth}
            className={`
              aspect-square rounded-lg transition-smooth flex flex-col items-center justify-center gap-1 p-2
              ${!day.isCurrentMonth ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
              ${day.isSemesterDay && day.isCurrentMonth ? 'bg-primary/10 hover:bg-primary/20' : 'bg-muted hover:bg-muted/80'}
              ${day.isToday ? 'ring-2 ring-primary' : ''}
            `}
            aria-label={`${monthNames[month]} ${day.date}, ${year}`}
          >
            <span className={`text-sm font-medium ${day.isToday ? 'text-primary' : 'text-foreground'}`}>
              {day.date}
            </span>
            {day.isCurrentMonth && getAttendanceIndicator(day.attendanceStatus)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MonthCalendar;