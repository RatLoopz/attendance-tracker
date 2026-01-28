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
  classroom: string;
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

          <div className="p-4 bg-background rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="ClockIcon" size={16} className="text-secondary" />
              <span className="caption text-muted-foreground">Daily Schedule</span>
            </div>
            <div className="space-y-2">
              {(() => {
                // Normalize schedule to array format
                let periods: SchedulePeriod[] = [];

                if (Array.isArray(schedule)) {
                  // Already an array
                  periods = schedule;
                } else if (schedule && typeof schedule === 'object') {
                  // WeeklySchedule object - extract all periods from all days
                  const allDays = Object.keys(schedule);
                  if (allDays.length > 0) {
                    // Get Monday's schedule as default, or first available day
                    const firstDay = allDays.includes('Monday') ? 'Monday' : allDays[0];
                    periods = schedule[firstDay] || [];
                  }
                }

                const validPeriods = periods.filter((p: SchedulePeriod) => p.subjectId);

                if (validPeriods.length === 0) {
                  return (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No classes scheduled
                    </p>
                  );
                }

                return validPeriods.map((period: SchedulePeriod) => (
                  <div
                    key={period.periodNumber}
                    className="flex items-center justify-between p-2 bg-card rounded"
                  >
                    <div className="flex items-center gap-3">
                      <span className="data-text text-sm text-muted-foreground w-20">
                        {period.startTime} - {period.endTime}
                      </span>
                      <span className="text-sm text-foreground">
                        {getSubjectName(period.subjectId)}
                      </span>
                    </div>
                    {period.classroom && (
                      <span className="caption text-muted-foreground">{period.classroom}</span>
                    )}
                  </div>
                ));
              })()}
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
