'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSemesterConfiguration } from '@/lib/semesterConfig';
import YearNavigator from './YearNavigator';
import MonthCalendar from './MonthCalendar';
import SemesterInfoPanel from './SemesterInfoPanel';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

const CalendarDashboardInteractive = () => {
  const { user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentYear, setCurrentYear] = useState(2026);
  const [semesterConfig, setSemesterConfig] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const fetchSemesterConfig = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await getSemesterConfiguration(user.id);

        if (fetchError) {
          console.error('Error fetching semester configuration:', fetchError);
          setError('Failed to load semester configuration');
          setLoading(false);
          return;
        }

        if (!data) {
          // No configuration found - this is expected for new users
          setSemesterConfig(null);
          setLoading(false);
          return;
        }

        setSemesterConfig({
          startDate: data.startDate,
          endDate: data.endDate,
        });

        // Set current year based on semester start date
        const startYear = new Date(data.startDate).getFullYear();
        setCurrentYear(startYear);
      } catch (err) {
        console.error('Unexpected error fetching semester config:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSemesterConfig();
    }
  }, [user]);

  const handleYearChange = (year: number) => {
    setCurrentYear(year);
  };

  const months = Array.from({ length: 12 }, (_, i) => i);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background pt-[60px] pb-20 md:pb-6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 animate-pulse">
            <div className="h-10 bg-muted/20 rounded-xl w-48 mx-auto" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card/50 border border-border/50 rounded-xl shadow-sm p-6 h-[400px] animate-pulse"
                />
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-card/50 border border-border/50 rounded-xl shadow-sm p-6 h-[600px] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-[60px] pb-20 md:pb-6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-4 rounded-full bg-primary/10 mb-6 animate-pulse">
              <Icon name="ArrowPathIcon" size={48} className="text-primary animate-spin" />
            </div>
            <p className="text-xl font-medium text-foreground">Loading semester data...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please wait while we fetch your calendar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-[60px] pb-20 md:pb-6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-elevation-2 p-12 text-center max-w-2xl mx-auto">
            <div className="inline-flex p-4 rounded-full bg-error/10 text-error mb-6">
              <Icon name="ExclamationTriangleIcon" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Error Loading Data</h2>
            <p className="text-muted-foreground mb-8 text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!semesterConfig) {
    return (
      <div className="min-h-screen bg-background pt-[60px] pb-20 md:pb-6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-xl p-16 text-center max-w-2xl mx-auto transform transition-all hover:scale-[1.01]">
            <div className="inline-flex p-6 rounded-full bg-primary/5 text-primary mb-8 ring-1 ring-primary/20">
              <Icon name="CalendarDaysIcon" size={64} />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4 tracking-tight">
              No Semester Configuration Found
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg leading-relaxed">
              You haven't configured your semester yet. Please set up your semester details,
              subjects, and schedule to get started.
            </p>
            <Link
              href="/semester-configuration"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 font-semibold"
            >
              <Icon name="Cog6ToothIcon" size={24} />
              <span>Configure Semester</span>
            </Link>
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
