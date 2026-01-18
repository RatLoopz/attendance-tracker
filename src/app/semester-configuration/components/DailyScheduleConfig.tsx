'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Subject {
  id: string;
  courseCode: string;
  name: string;
}

interface SchedulePeriod {
  periodNumber: number;
  startTime: string;
  endTime: string;
  subjectId: string;
  classroom: string;
}

interface DailyScheduleConfigProps {
  subjects: Subject[];
  onScheduleChange: (schedule: SchedulePeriod[]) => void;
  initialSchedule?: SchedulePeriod[];
}

const DailyScheduleConfig = ({
  subjects,
  onScheduleChange,
  initialSchedule = [],
}: DailyScheduleConfigProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [schedule, setSchedule] = useState<SchedulePeriod[]>(initialSchedule);
  const [error, setError] = useState('');

  const defaultPeriods = [
    { periodNumber: 1, startTime: '09:00', endTime: '10:00' },
    { periodNumber: 2, startTime: '10:00', endTime: '11:00' },
    { periodNumber: 3, startTime: '11:00', endTime: '12:00' },
    { periodNumber: 4, startTime: '12:00', endTime: '13:00' },
    { periodNumber: 5, startTime: '14:00', endTime: '15:00' },
    { periodNumber: 6, startTime: '15:00', endTime: '16:00' },
  ];

  useEffect(() => {
    setIsHydrated(true);
    if (initialSchedule.length === 0) {
      const defaultSchedule = defaultPeriods.map((period) => ({
        ...period,
        subjectId: '',
        classroom: '',
      }));
      setSchedule(defaultSchedule);
    }
  }, []);

  useEffect(() => {
    if (isHydrated) {
      validateSchedule();
      onScheduleChange(schedule);
    }
  }, [schedule, isHydrated, onScheduleChange]);

  const validateSchedule = () => {
    const assignedSubjects = schedule.filter((p) => p.subjectId).map((p) => p.subjectId);
    const duplicates = assignedSubjects.filter(
      (item, index) => assignedSubjects.indexOf(item) !== index
    );

    if (duplicates.length > 0) {
      setError('Warning: Some subjects are assigned to multiple periods');
    } else {
      setError('');
    }
  };

  const handlePeriodChange = (periodNumber: number, field: keyof SchedulePeriod, value: string) => {
    setSchedule(
      schedule.map((period) =>
        period.periodNumber === periodNumber ? { ...period, [field]: value } : period
      )
    );
  };

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-elevation-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
            <Icon name="ClockIcon" size={20} className="text-secondary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Daily Schedule</h2>
            <p className="caption text-muted-foreground">Loading schedule...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-elevation-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
          <Icon name="ClockIcon" size={20} className="text-secondary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Daily Schedule Configuration</h2>
          <p className="caption text-muted-foreground">
            Map subjects to time periods (9 AM - 4 PM)
          </p>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-8 bg-muted rounded-lg">
          <Icon name="ExclamationTriangleIcon" size={48} className="text-warning mx-auto mb-3" />
          <p className="text-muted-foreground">
            Please add subjects first before configuring schedule
          </p>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <Icon
                name="ExclamationTriangleIcon"
                size={20}
                className="text-warning flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-warning">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            {schedule.map((period) => (
              <div
                key={period.periodNumber}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-background rounded-lg border border-border"
              >
                <div>
                  <p className="caption text-muted-foreground mb-2">Period {period.periodNumber}</p>
                  <div className="flex items-center gap-2">
                    <Icon name="ClockIcon" size={16} className="text-muted-foreground" />
                    <span className="text-sm data-text text-foreground">
                      {period.startTime} - {period.endTime}
                    </span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="caption text-muted-foreground mb-2 block">Subject</label>
                  <select
                    value={period.subjectId}
                    onChange={(e) =>
                      handlePeriodChange(period.periodNumber, 'subjectId', e.target.value)
                    }
                    className="w-full px-3 py-2 bg-card border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                  >
                    <option value="">No Class / Break</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.courseCode} - {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="caption text-muted-foreground mb-2 block">Classroom</label>
                  <input
                    type="text"
                    value={period.classroom}
                    onChange={(e) =>
                      handlePeriodChange(period.periodNumber, 'classroom', e.target.value)
                    }
                    placeholder="Room 101"
                    disabled={!period.subjectId}
                    className="w-full px-3 py-2 bg-card border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-foreground">
              <span className="font-medium">Assigned Periods:</span>{' '}
              {schedule.filter((p) => p.subjectId).length} / {schedule.length}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default DailyScheduleConfig;
