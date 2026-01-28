'use client';

import { useState, useEffect, useMemo } from 'react';
import StatisticsHeader from './StatisticsHeader';
import FilterControls from './FilterControls';
import SubjectCard from './SubjectCard';
import AttendanceTrendChart from './AttendanceTrendChart';
import ExportButton from './ExportButton';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { getSubjectAttendanceStats, getAttendanceTrend } from '@/lib/attendanceStatsService';

interface Subject {
  id: string;
  name: string;
  code: string;
  totalClasses: number;
  attendedClasses: number;
  missedClasses: number;
  cancelledClasses: number;
  percentage: number;
  requiredClasses?: number;
}

interface TrendDataPoint {
  week: string;
  percentage: number;
  attended: number;
  total: number;
}

interface FilterState {
  subject: string;
  status: string;
  sortBy: string;
}

const SemesterStatisticsInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  // Removed filteredSubjects state in favor of derived state
  const [filters, setFilters] = useState<FilterState>({
    subject: 'all',
    status: 'all',
    sortBy: 'percentage',
  });
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!isHydrated || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch subject attendance statistics
        const { data, error: fetchError } = await getSubjectAttendanceStats(user.id);

        if (fetchError) {
          console.error('Error fetching statistics:', fetchError);
          setError('Failed to load statistics');
          setAllSubjects([]);
          // setFilteredSubjects([]); // No longer needed
          return;
        }

        // Transform data to match expected format
        const subjects: Subject[] = (data || []).map((subjectStat) => {
          // Calculate required classes to reach 75% if below threshold
          let requiredClasses: number | undefined;
          if (subjectStat.attendancePercentage < 75) {
            // Formula: (attended + x) / (total + x) = 0.75
            // x = (0.75 * total - attended) / 0.25
            const totalClasses = subjectStat.totalClasses;
            const attendedClasses = subjectStat.attendedClasses;
            requiredClasses = Math.ceil((0.75 * totalClasses - attendedClasses) / 0.25);
            requiredClasses = Math.max(0, requiredClasses);
          }

          return {
            id: subjectStat.subjectId,
            name: subjectStat.subjectName,
            code: subjectStat.subjectCode,
            totalClasses: subjectStat.totalClasses,
            attendedClasses: subjectStat.attendedClasses,
            missedClasses: subjectStat.missedClasses,
            cancelledClasses: subjectStat.cancelledClasses,
            percentage: subjectStat.attendancePercentage,
            requiredClasses,
          };
        });

        setAllSubjects(subjects);
        // setFilteredSubjects(subjects); // No longer needed

        // Fetch trend data
        const { data: trend, error: trendError } = await getAttendanceTrend(user.id);

        if (trendError) {
          console.error('Error fetching trend data:', trendError);
          // Don't fail the whole page if trend data fails
        }

        setTrendData(trend || []);
      } catch (err) {
        console.error('Unexpected error fetching statistics:', err);
        setError('An unexpected error occurred');
        setAllSubjects([]);
        // setFilteredSubjects([]); // No longer needed
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [isHydrated, user]);

  const calculateOverallStats = () => {
    const subjects = filteredSubjects.length > 0 ? filteredSubjects : [];
    const totalClasses = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
    const totalAttended = subjects.reduce((sum, s) => sum + s.attendedClasses, 0);
    const overallPercentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;
    const safeSubjects = subjects.filter((s) => s.percentage >= 75).length;
    const dangerSubjects = subjects.filter((s) => s.percentage < 70).length;

    return {
      totalSubjects: allSubjects.length, // Use all subjects count
      overallPercentage,
      safeSubjects,
      dangerSubjects,
    };
  };

  const filteredSubjects = useMemo(() => {
    let result = [...allSubjects];

    if (filters.subject !== 'all') {
      result = result.filter((s) => s.id === filters.subject);
    }

    if (filters.status !== 'all') {
      if (filters.status === 'safe') {
        result = result.filter((s) => s.percentage >= 75);
      } else if (filters.status === 'warning') {
        result = result.filter((s) => s.percentage >= 70 && s.percentage < 75);
      } else if (filters.status === 'danger') {
        result = result.filter((s) => s.percentage < 70);
      }
    }

    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'percentage':
          return b.percentage - a.percentage;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'attended':
          return b.attendedClasses - a.attendedClasses;
        case 'missed':
          return b.missedClasses - a.missedClasses;
        default:
          return 0;
      }
    });

    return result;
  }, [allSubjects, filters]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleExport = () => {
    const stats = calculateOverallStats();
    const reportData = {
      generatedOn: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      overallStats: stats,
      subjects: allSubjects,
    };

    console.log('Exporting report:', reportData);
    alert('Report exported successfully! Check console for data.');
  };

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-background pt-[60px] pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-muted rounded-lg" />
            <div className="h-24 bg-muted rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-[60px] pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-card rounded-lg shadow-elevation-2 p-12 text-center">
            <Icon name="ExclamationCircleIcon" size={48} className="text-error mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Statistics</h3>
            <p className="caption text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (allSubjects.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-[60px] pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-card rounded-lg shadow-elevation-2 p-12 text-center">
            <Icon name="ChartBarIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Statistics Available</h3>
            <p className="caption text-muted-foreground mb-4">
              Configure your semester and mark some attendance to see statistics
            </p>
            <a
              href="/semester-configuration"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth"
            >
              <Icon name="Cog6ToothIcon" size={20} />
              <span className="text-sm font-medium">Go to Configuration</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const stats = calculateOverallStats();

  return (
    <div className="min-h-screen bg-background pt-[60px] pb-20 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <StatisticsHeader
            totalSubjects={stats.totalSubjects}
            overallPercentage={stats.overallPercentage}
            safeSubjects={stats.safeSubjects}
            dangerSubjects={stats.dangerSubjects}
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Subject-wise Analysis</h2>
              <p className="caption text-muted-foreground mt-1">
                Detailed breakdown of attendance for each subject
              </p>
            </div>
            <ExportButton onExport={handleExport} />
          </div>

          <FilterControls
            onFilterChange={handleFilterChange}
            subjects={allSubjects}
            filters={filters}
          />

          {filteredSubjects.length === 0 ? (
            <div className="bg-card rounded-lg shadow-elevation-2 p-12 text-center">
              <Icon name="FunnelIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No subjects found</h3>
              <p className="caption text-muted-foreground">
                Try adjusting your filters to see more results
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubjects.map((subject) => (
                <SubjectCard key={subject.id} subject={subject} />
              ))}
            </div>
          )}

          {trendData.length > 0 && <AttendanceTrendChart data={trendData} />}

          <div className="bg-card rounded-lg shadow-elevation-2 p-6">
            <div className="flex items-start gap-4">
              <Icon name="InformationCircleIcon" size={24} className="text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Understanding Your Statistics
                </h3>
                <ul className="caption text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <Icon
                      name="CheckCircleIcon"
                      size={16}
                      className="text-success mt-0.5 flex-shrink-0"
                      variant="solid"
                    />
                    <span>
                      <strong className="text-success">Safe Zone (≥75%):</strong> You are eligible
                      for exams in these subjects
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon
                      name="ExclamationTriangleIcon"
                      size={16}
                      className="text-warning mt-0.5 flex-shrink-0"
                      variant="solid"
                    />
                    <span>
                      <strong className="text-warning">Caution (70-74%):</strong> Attend upcoming
                      classes to maintain eligibility
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon
                      name="XCircleIcon"
                      size={16}
                      className="text-error mt-0.5 flex-shrink-0"
                      variant="solid"
                    />
                    <span>
                      <strong className="text-error">Danger Zone (&lt;70%):</strong> Immediate
                      action required to reach 75% threshold
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SemesterStatisticsInteractive;
