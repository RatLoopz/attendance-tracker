'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import {
  saveSemesterConfiguration,
  getSemesterConfiguration,
  SemesterConfig,
} from '@/lib/semesterConfig';
import SemesterDateRangeConfig from './SemesterDateRangeConfig';
import AcademicYearSelector from './AcademicYearSelector';
import SubjectManagement from './SubjectManagement';
import DailyScheduleConfig from './DailyScheduleConfig';
import ConfigurationPreview from './ConfigurationPreview';

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
  dayOfWeek?: string;
}

interface WeeklySchedule {
  [key: string]: SchedulePeriod[]; // Monday, Tuesday, etc.
}

interface ConfigurationData {
  startDate: string;
  endDate: string;
  academicYear: string;
  semesterType: string;
  subjects: Subject[];
  schedule: SchedulePeriod[];
}

const SemesterConfigurationInteractive = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveError, setSaveError] = useState('');

  // Helper function to get current academic year dates
  const getCurrentAcademicYearDates = () => {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-indexed
    const currentYear = now.getFullYear();

    // If we're in Jan-June, it's the even semester (Spring)
    // If we're in Jul-Dec, it's the odd semester (Fall)
    const isEvenSemester = currentMonth < 6;

    if (isEvenSemester) {
      // Even semester: January to May
      return {
        startDate: `${currentYear}-01-15`,
        endDate: `${currentYear}-05-30`,
        academicYear: `${currentYear - 1}-${currentYear}`,
        semesterType: 'even' as const,
      };
    } else {
      // Odd semester: August to December
      return {
        startDate: `${currentYear}-08-01`,
        endDate: `${currentYear}-12-20`,
        academicYear: `${currentYear}-${currentYear + 1}`,
        semesterType: 'odd' as const,
      };
    }
  };

  const defaultDates = getCurrentAcademicYearDates();

  const [configuration, setConfiguration] = useState<ConfigurationData>({
    startDate: defaultDates.startDate,
    endDate: defaultDates.endDate,
    academicYear: defaultDates.academicYear,
    semesterType: defaultDates.semesterType,
    subjects: [], // Empty by default - user must add
    schedule: [], // Empty by default - user must configure
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Helper function to normalize schedule from WeeklySchedule to array
  const normalizeSchedule = (schedule: any): SchedulePeriod[] => {
    if (Array.isArray(schedule)) {
      return schedule;
    }

    if (schedule && typeof schedule === 'object') {
      // WeeklySchedule object - extract Monday's schedule or first available day
      const days = Object.keys(schedule);
      if (days.length > 0) {
        const firstDay = days.includes('Monday') ? 'Monday' : days[0];
        return schedule[firstDay] || [];
      }
    }

    return [];
  };

  useEffect(() => {
    const loadConfiguration = async () => {
      if (!user) return;

      try {
        const { data, error } = await getSemesterConfiguration(user.id);

        if (data && !error) {
          // Normalize schedule  - convert WeeklySchedule to array if needed
          const normalizedSchedule = normalizeSchedule(data.schedule);

          setConfiguration({
            startDate: data.startDate,
            endDate: data.endDate,
            academicYear: data.academicYear,
            semesterType: data.semesterType,
            subjects: data.subjects,
            schedule: normalizedSchedule,
          });
        }
      } catch (err) {
        console.error('Error loading configuration:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadConfiguration();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleDateChange = useCallback((startDate: string, endDate: string) => {
    setConfiguration((prev) => ({ ...prev, startDate, endDate }));
  }, []);

  const handleYearChange = useCallback((academicYear: string, semesterType: string) => {
    setConfiguration((prev) => ({ ...prev, academicYear, semesterType }));
  }, []);

  const handleSubjectsChange = useCallback((subjects: Subject[]) => {
    setConfiguration((prev) => ({ ...prev, subjects }));
  }, []);

  const handleScheduleChange = useCallback((schedule: SchedulePeriod[]) => {
    setConfiguration((prev) => ({ ...prev, schedule }));
  }, []);

  // Helper function to convert schedule array to WeeklySchedule format for database
  const convertToWeeklySchedule = (schedule: SchedulePeriod[]): WeeklySchedule => {
    const weeklySchedule: WeeklySchedule = {};

    // Group periods by day of week
    schedule.forEach((period) => {
      const day = period.dayOfWeek || 'Monday'; // Default to Monday if no day specified
      if (!weeklySchedule[day]) {
        weeklySchedule[day] = [];
      }
      weeklySchedule[day].push(period);
    });

    // If no days were specified, group all under Monday for backward compatibility
    if (Object.keys(weeklySchedule).length === 0) {
      weeklySchedule['Monday'] = schedule;
    }

    return weeklySchedule;
  };

  const handleSaveConfiguration = async () => {
    if (!user) return;

    setIsSaving(true);

    try {
      // Convert schedule array to WeeklySchedule format for database
      const weeklySchedule = convertToWeeklySchedule(configuration.schedule);

      const { error } = await saveSemesterConfiguration({
        userId: user.id,
        startDate: configuration.startDate,
        endDate: configuration.endDate,
        academicYear: configuration.academicYear,
        semesterType: configuration.semesterType as 'odd' | 'even',
        subjects: configuration.subjects,
        schedule: weeklySchedule,
      });

      if (error) {
        console.error('Error saving configuration:', error);
        alert('Failed to save configuration. Please try again.');
      } else {
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          router.push('/calendar-dashboard');
        }, 2000);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const isConfigurationComplete = () => {
    return (
      configuration.startDate &&
      configuration.endDate &&
      configuration.academicYear &&
      configuration.subjects.length > 0
    );
  };

  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SemesterDateRangeConfig
          onDateChange={handleDateChange}
          initialStartDate={configuration.startDate}
          initialEndDate={configuration.endDate}
        />
        <AcademicYearSelector
          onYearChange={handleYearChange}
          initialYear={configuration.academicYear}
          initialSemesterType={configuration.semesterType}
        />
      </div>

      <SubjectManagement
        onSubjectsChange={handleSubjectsChange}
        initialSubjects={configuration.subjects}
      />

      <DailyScheduleConfig
        subjects={configuration.subjects}
        onScheduleChange={handleScheduleChange}
        initialSchedule={configuration.schedule}
      />

      <ConfigurationPreview
        startDate={configuration.startDate}
        endDate={configuration.endDate}
        academicYear={configuration.academicYear}
        semesterType={configuration.semesterType}
        subjects={configuration.subjects}
        schedule={configuration.schedule}
      />

      <div className="sticky bottom-4 bg-card rounded-lg p-4 shadow-elevation-4 border border-border">
        {saveError && (
          <div className="mb-4 flex items-start gap-2 p-3 bg-error/10 border border-error/20 rounded-lg">
            <Icon
              name="ExclamationCircleIcon"
              size={20}
              className="text-error flex-shrink-0 mt-0.5"
            />
            <p className="text-sm text-error">{saveError}</p>
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Icon
              name={isConfigurationComplete() ? 'CheckCircleIcon' : 'ExclamationCircleIcon'}
              size={24}
              className={isConfigurationComplete() ? 'text-success' : 'text-warning'}
            />
            <div>
              <p className="font-medium text-foreground">
                {isConfigurationComplete() ? 'Ready to Save' : 'Configuration Incomplete'}
              </p>
              <p className="caption text-muted-foreground">
                {isConfigurationComplete()
                  ? 'All required information has been provided'
                  : 'Please complete all required sections'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSaveConfiguration}
            disabled={!isConfigurationComplete() || isSaving}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-smooth
              ${
                isConfigurationComplete() && !isSaving
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }
            `}
          >
            {isSaving ? (
              <>
                <Icon name="ArrowPathIcon" size={20} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Icon name="CheckIcon" size={20} />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </div>

      {showSuccessMessage && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-8 shadow-elevation-6 max-w-md w-full mx-4 animate-slide-down">
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircleIcon" size={32} className="text-success" variant="solid" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Configuration Saved!</h3>
              <p className="text-muted-foreground mb-4">
                Your semester configuration has been saved successfully. Redirecting to dashboard...
              </p>
              <div className="flex items-center justify-center gap-2">
                <Icon name="ArrowPathIcon" size={20} className="text-primary animate-spin" />
                <span className="caption text-muted-foreground">Redirecting...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SemesterConfigurationInteractive;
