'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { Subject, SchedulePeriod } from '@/lib/semesterConfig';

interface DailyScheduleConfigProps {
  subjects: Subject[];
  onScheduleChange: (schedule: SchedulePeriod[]) => void;
  initialSchedule: SchedulePeriod[];
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DailyScheduleConfig = ({
  subjects,
  onScheduleChange,
  initialSchedule,
}: DailyScheduleConfigProps) => {
  const [activeDay, setActiveDay] = useState<string>('Monday');
  const [schedule, setSchedule] = useState<SchedulePeriod[]>(initialSchedule || []);

  // Update local state when prop changes
  useEffect(() => {
    if (initialSchedule) {
      setSchedule(initialSchedule);
    }
  }, [initialSchedule]);

  // Filter periods for the active day
  const activeDayPeriods = schedule
    .filter((period) => (period.dayOfWeek || 'Monday') === activeDay)
    .sort((a, b) => a.periodNumber - b.periodNumber);

  const handleAddPeriod = () => {
    const maxPeriodNumber =
      activeDayPeriods.length > 0 ? Math.max(...activeDayPeriods.map((p) => p.periodNumber)) : 0;

    const newPeriod: SchedulePeriod = {
      periodNumber: maxPeriodNumber + 1,
      startTime: '09:00',
      endTime: '10:00',
      subjectId: subjects.length > 0 ? subjects[0].id : '',
      dayOfWeek: activeDay,
    };

    const newSchedule = [...schedule, newPeriod];
    setSchedule(newSchedule);
    onScheduleChange(newSchedule);
  };

  const handleUpdatePeriod = (
    index: number,
    field: keyof SchedulePeriod,
    value: string | number
  ) => {
    // Determine the actual index in the full schedule array
    // We need to find the specific item that corresponds to the one being edited
    // Since activeDayPeriods is sorted and filtered, we use the period object itself logic?
    // Better: Map over the full schedule and update the matching one.
    // But since we don't have unique IDs for periods (yet), we rely on object identity or we strictly filter-map.

    // Let's rely on finding the item in the full list that matches the one we are rendering.
    // However, since we re-create objects, reference equality might fail if not careful.
    // Let's use the local 'activeDayPeriods' index to identify the item, and then find that item in the main list.

    const periodToUpdate = activeDayPeriods[index];

    const newSchedule = schedule.map((p) => {
      if (p === periodToUpdate) {
        return { ...p, [field]: value };
      }
      return p;
    });

    setSchedule(newSchedule);
    onScheduleChange(newSchedule);
  };

  const handleDeletePeriod = (index: number) => {
    const periodToDelete = activeDayPeriods[index];
    const newSchedule = schedule.filter((p) => p !== periodToDelete);
    setSchedule(newSchedule);
    onScheduleChange(newSchedule);
  };

  const copyDaySchedule = (targetDay: string) => {
    if (targetDay === activeDay) return;

    // Remove existing periods for target day
    const cleanSchedule = schedule.filter((p) => (p.dayOfWeek || 'Monday') !== targetDay);

    // duplicte active day periods
    const newPeriods = activeDayPeriods.map((p) => ({
      ...p,
      dayOfWeek: targetDay,
    }));

    const newSchedule = [...cleanSchedule, ...newPeriods];
    setSchedule(newSchedule);
    onScheduleChange(newSchedule);
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-elevation-2 border border-border animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon name="CalendarIcon" size={24} className="text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Weekly Schedule</h2>
          <p className="text-sm text-muted-foreground">Configure your class routine for each day</p>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="flex overflow-x-auto pb-2 mb-6 gap-2 scrollbar-thin">
        {DAYS_OF_WEEK.map((day) => (
          <button
            type="button"
            key={day}
            onClick={() => setActiveDay(day)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
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

      {/* Schedule Editor */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-foreground">{activeDay}'s Classes</h3>
          <div className="flex gap-2">
            {/* Copy To dropdown could go here, but let's keep it simple for now */}
          </div>
        </div>

        {activeDayPeriods.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-muted/20">
            <Icon
              name="ClockIcon"
              size={32}
              className="text-muted-foreground mx-auto mb-3 opacity-50"
            />
            <p className="text-muted-foreground mb-4">No classes scheduled for {activeDay}</p>
            <button
              type="button"
              onClick={handleAddPeriod}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium text-sm"
            >
              <Icon name="PlusIcon" size={16} />
              Add First Class
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeDayPeriods.map((period, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors group"
              >
                {/* Time Range */}
                <div className="md:col-span-3 flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Start</label>
                    <input
                      type="time"
                      value={period.startTime}
                      onChange={(e) => handleUpdatePeriod(index, 'startTime', e.target.value)}
                      className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    />
                  </div>
                  <span className="text-muted-foreground mt-5">-</span>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">End</label>
                    <input
                      type="time"
                      value={period.endTime}
                      onChange={(e) => handleUpdatePeriod(index, 'endTime', e.target.value)}
                      className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="md:col-span-8">
                  <label className="text-xs text-muted-foreground mb-1 block">Subject</label>
                  <select
                    value={period.subjectId}
                    onChange={(e) => handleUpdatePeriod(index, 'subjectId', e.target.value)}
                    className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="" disabled>
                      Select Subject
                    </option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.courseCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="md:col-span-1 flex items-end justify-center pb-1">
                  <button
                    type="button"
                    onClick={() => handleDeletePeriod(index)}
                    className="p-2 text-muted-foreground hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                    title="Remove Class"
                  >
                    <Icon name="TrashIcon" size={18} />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddPeriod}
              className="w-full py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium flex items-center justify-center gap-2 mt-4"
            >
              <Icon name="PlusIcon" size={16} />
              Add Another Class to {activeDay}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyScheduleConfig;
