'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Subject {
  id: string;
  courseCode: string;
  name: string;
  weeklyClasses: number;
}

interface SchedulePeriod {
  periodNumber: number;
  startTime: string;
  endTime: string;
  subjectId: string;
  dayOfWeek?: string;
}

interface WeeklySchedule {
  [key: string]: SchedulePeriod[]; // Monday, Tuesday, etc.
}

interface ConfigurationPreviewProps {
  startDate: string;
  endDate: string;
  academicYear: string;
  semesterType: string;
  subjects: Subject[];
  schedule: WeeklySchedule | SchedulePeriod[];
}

const ConfigurationPreview = ({
  startDate,
  endDate,
  academicYear,
  semesterType,
  subjects,
  schedule,
}: ConfigurationPreviewProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [semesterDays, setSemesterDays] = useState(0);
  const [activeDay, setActiveDay] = useState<string>('Monday');

  const DAYS_OF_WEEK = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  useEffect(() => {
    setIsHydrated(true);
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setSemesterDays(diffDays);
    }
  }, [startDate, endDate]);

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? `${subject.courseCode} - ${subject.name}` : 'No Class';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-elevation-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="EyeIcon" size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Configuration Preview</h2>
            <p className="caption text-muted-foreground">Loading preview...</p>
          </div>
        </div>
      </div>
    );
  }

  const isComplete = startDate && endDate && academicYear && subjects.length > 0;

  // Normalize schedule logic moved inside render for preview

  // Robust normalization to getting all periods first, then filtering
  const getAllPeriods = () => {
    let periods: any[] = [];
    if (Array.isArray(schedule)) {
      periods = schedule;
    } else if (schedule && typeof schedule === 'object') {
      Object.entries(schedule).forEach(([day, dayPeriods]) => {
        if (Array.isArray(dayPeriods)) {
          periods.push(...dayPeriods.map((p: any) => ({ ...p, dayOfWeek: day })));
        }
      });
    }
    return periods;
  };

  const allPeriods = getAllPeriods();
  const activeDayPeriods = allPeriods
    .filter((p) => (p.dayOfWeek || 'Monday') === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="bg-card rounded-lg p-6 shadow-elevation-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon name="EyeIcon" size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Configuration Preview</h2>
          <p className="caption text-muted-foreground">Review your semester setup before saving</p>
        </div>
      </div>

      {!isComplete ? (
        <div className="text-center py-8 bg-muted rounded-lg">
          <Icon
            name="InformationCircleIcon"
            size={48}
            className="text-muted-foreground mx-auto mb-3"
          />
          <p className="text-muted-foreground">Complete all sections to see preview</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-background rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="CalendarDaysIcon" size={16} className="text-primary" />
                <span className="caption text-muted-foreground">Semester Duration</span>
              </div>
              <p className="font-medium text-foreground">
                {formatDate(startDate)} - {formatDate(endDate)}
              </p>
              <p className="caption text-muted-foreground mt-1">{semesterDays} days</p>
            </div>

            <div className="p-4 bg-background rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="AcademicCapIcon" size={16} className="text-secondary" />
                <span className="caption text-muted-foreground">Academic Details</span>
              </div>
              <p className="font-medium text-foreground">{academicYear}</p>
              <p className="caption text-muted-foreground mt-1">
                {semesterType.charAt(0).toUpperCase() + semesterType.slice(1)} Semester
              </p>
            </div>
          </div>

          <div className="p-4 bg-background rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="BookOpenIcon" size={16} className="text-accent" />
              <span className="caption text-muted-foreground">
                Enrolled Subjects ({subjects.length})
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center justify-between p-2 bg-card rounded"
                >
                  <span className="text-sm text-foreground">
                    {subject.courseCode} - {subject.name}
                  </span>
                  <span className="caption text-muted-foreground">
                    {subject.weeklyClasses} classes/week
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-0 bg-transparent">
            <div className="flex items-center gap-2 mb-4 px-1">
              <Icon name="ClockIcon" size={18} className="text-primary" />
              <span className="font-semibold text-foreground">Weekly Schedule Preview</span>
            </div>

            {/* Day Tabs - Matches DailyScheduleConfig UI */}
            <div className="flex overflow-x-auto pb-2 mb-4 gap-2 scrollbar-thin">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  type="button"
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`
                      px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all
                      ${
                        activeDay === day
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }
                    `}
                >
                  {day}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {activeDayPeriods.length === 0 ? (
                <div className="text-center py-8 bg-card border border-dashed border-border rounded-xl">
                  <p className="text-muted-foreground">No classes scheduled for {activeDay}.</p>
                </div>
              ) : (
                <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-muted/30 px-4 py-3 border-b border-border/60 flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                    <h4 className="font-semibold text-foreground text-sm tracking-wide">
                      {activeDay}
                    </h4>
                  </div>

                  <div className="divide-y divide-border/40">
                    {activeDayPeriods.map((period, idx) => {
                      const subjectName = getSubjectName(period.subjectId);
                      const isNoClass = subjectName === 'No Class';

                      return (
                        <div
                          key={`${period.periodNumber}-${idx}`}
                          className="group flex items-stretch p-3 hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex flex-col justify-center min-w-[85px] mr-4 text-right pr-4 border-r border-border/40 relative">
                            {/* Timeline dot */}
                            <div className="absolute -right-[5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-background border-2 border-primary z-10"></div>

                            <span className="text-xs font-semibold text-foreground">
                              {period.startTime}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {period.endTime}
                            </span>
                          </div>

                          <div className="flex-1 flex items-center justify-between">
                            <div
                              className={`flex items-center gap-3 ${isNoClass ? 'opacity-50' : ''}`}
                            >
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isNoClass ? 'bg-muted' : 'bg-primary/10 text-primary'}`}
                              >
                                <Icon
                                  name={isNoClass ? 'MinusCircleIcon' : 'BookOpenIcon'}
                                  size={16}
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground line-clamp-1">
                                  {subjectName}
                                </p>
                                {!isNoClass && (
                                  <p className="text-[10px] text-muted-foreground bg-muted/60 inline-block px-1.5 rounded mt-0.5">
                                    {period.isLab ? 'Laboratory' : 'Theory Class'}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
            <Icon name="CheckCircleIcon" size={20} className="text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-success">Configuration Complete</p>
              <p className="caption text-success/80 mt-1">
                All required information has been provided. Click Save Configuration to apply
                changes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationPreview;
