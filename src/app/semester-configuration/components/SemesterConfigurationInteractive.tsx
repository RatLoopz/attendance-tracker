'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { saveSemesterConfiguration, getSemesterConfiguration, SemesterConfig } from '@/lib/semesterConfig';
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

  const [configuration, setConfiguration] = useState<ConfigurationData>({
    startDate: '2026-01-15',
    endDate: '2026-05-30',
    academicYear: '2025-2026',
    semesterType: 'even',
    subjects: [
      {
        id: 'sub-1',
        courseCode: 'CS301',
        name: 'Data Structures and Algorithms',
        weeklyClasses: 4,
      },
      {
        id: 'sub-2',
        courseCode: 'CS302',
        name: 'Database Management Systems',
        weeklyClasses: 3,
      },
      {
        id: 'sub-3',
        courseCode: 'CS303',
        name: 'Operating Systems',
        weeklyClasses: 3,
      },
      {
        id: 'sub-4',
        courseCode: 'CS304',
        name: 'Computer Networks',
        weeklyClasses: 3,
      },
      {
        id: 'sub-5',
        courseCode: 'MA301',
        name: 'Discrete Mathematics',
        weeklyClasses: 3,
      },
    ],
    schedule: [
      {
        periodNumber: 1,
        startTime: '09:00',
        endTime: '10:00',
        subjectId: 'sub-1',
        classroom: 'Lab 201',
      },
      {
        periodNumber: 2,
        startTime: '10:00',
        endTime: '11:00',
        subjectId: 'sub-2',
        classroom: 'Room 305',
      },
      {
        periodNumber: 3,
        startTime: '11:00',
        endTime: '12:00',
        subjectId: 'sub-3',
        classroom: 'Room 402',
      },
      { periodNumber: 4, startTime: '12:00', endTime: '13:00', subjectId: '', classroom: '' },
      {
        periodNumber: 5,
        startTime: '14:00',
        endTime: '15:00',
        subjectId: 'sub-4',
        classroom: 'Lab 103',
      },
      {
        periodNumber: 6,
        startTime: '15:00',
        endTime: '16:00',
        subjectId: 'sub-5',
        classroom: 'Room 210',
      },
    ],
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const loadConfiguration = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await getSemesterConfiguration(user.id);
        
        if (data && !error) {
          setConfiguration({
            startDate: data.startDate,
            endDate: data.endDate,
            academicYear: data.academicYear,
            semesterType: data.semesterType,
            subjects: data.subjects,
            schedule: data.schedule
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

  const handleSaveConfiguration = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await saveSemesterConfiguration({
        userId: user.id,
        startDate: configuration.startDate,
        endDate: configuration.endDate,
        academicYear: configuration.academicYear,
        semesterType: configuration.semesterType as 'odd' | 'even',
        subjects: configuration.subjects,
        schedule: configuration.schedule
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

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Cog6ToothIcon" size={48} className="text-primary mx-auto mb-4 animate-spin" />
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
            <Icon name="ExclamationCircleIcon" size={20} className="text-error flex-shrink-0 mt-0.5" />
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
