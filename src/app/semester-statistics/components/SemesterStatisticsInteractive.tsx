'use client';

import { useState, useEffect } from 'react';
import StatisticsHeader from './StatisticsHeader';
import FilterControls from './FilterControls';
import SubjectCard from './SubjectCard';
import AttendanceTrendChart from './AttendanceTrendChart';
import ExportButton from './ExportButton';
import Icon from '@/components/ui/AppIcon';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

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
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const mockSubjects: Subject[] = [
    {
      id: 'sub1',
      name: 'Data Structures and Algorithms',
      code: 'CS301',
      totalClasses: 55,
      attendedClasses: 45,
      missedClasses: 8,
      cancelledClasses: 2,
      percentage: 81.8,
    },
    {
      id: 'sub2',
      name: 'Database Management Systems',
      code: 'CS302',
      totalClasses: 48,
      attendedClasses: 38,
      missedClasses: 7,
      cancelledClasses: 3,
      percentage: 79.2,
    },
    {
      id: 'sub3',
      name: 'Operating Systems',
      code: 'CS303',
      totalClasses: 52,
      attendedClasses: 36,
      missedClasses: 14,
      cancelledClasses: 2,
      percentage: 69.2,
      requiredClasses: 5,
    },
    {
      id: 'sub4',
      name: 'Computer Networks',
      code: 'CS304',
      totalClasses: 50,
      attendedClasses: 40,
      missedClasses: 8,
      cancelledClasses: 2,
      percentage: 80.0,
    },
    {
      id: 'sub5',
      name: 'Software Engineering',
      code: 'CS305',
      totalClasses: 45,
      attendedClasses: 30,
      missedClasses: 12,
      cancelledClasses: 3,
      percentage: 66.7,
      requiredClasses: 7,
    },
    {
      id: 'sub6',
      name: 'Web Technologies',
      code: 'CS306',
      totalClasses: 42,
      attendedClasses: 35,
      missedClasses: 5,
      cancelledClasses: 2,
      percentage: 83.3,
    },
  ];

  const mockTrendData: TrendDataPoint[] = [
    { week: 'Week 1', percentage: 85.0, attended: 17, total: 20 },
    { week: 'Week 2', percentage: 82.5, attended: 33, total: 40 },
    { week: 'Week 3', percentage: 80.0, attended: 48, total: 60 },
    { week: 'Week 4', percentage: 78.8, attended: 63, total: 80 },
    { week: 'Week 5', percentage: 77.0, attended: 77, total: 100 },
    { week: 'Week 6', percentage: 76.7, attended: 92, total: 120 },
    { week: 'Week 7', percentage: 75.7, attended: 106, total: 140 },
    { week: 'Week 8', percentage: 75.0, attended: 120, total: 160 },
    { week: 'Week 9', percentage: 74.4, attended: 134, total: 180 },
    { week: 'Week 10', percentage: 75.0, attended: 150, total: 200 },
    { week: 'Week 11', percentage: 75.9, attended: 167, total: 220 },
    { week: 'Week 12', percentage: 76.7, attended: 184, total: 240 },
  ];

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || !user) return;

    const fetchStatistics = async () => {
      try {
        setLoading(true);

        // Get the current semester dates
        const { data: semesterData, error: semesterError } = await supabase
          .from('semesters')
          .select('*')
          .eq('is_current', true)
          .single();

        if (semesterError) throw semesterError;

        // Fetch attendance data for the current user in the current semester
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance_records')
          .select(`
            status,
            date,
            subjects (
              id,
              name,
              code
            )
          `)
          .eq('user_id', user.id)
          .gte('date', semesterData.start_date)
          .lte('date', semesterData.end_date);

        if (attendanceError) throw attendanceError;

        // Fetch all scheduled classes for the current semester
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('class_schedule')
          .select(`
            subject_id,
            subjects (
              id,
              name,
              code
            )
          `)
          .gte('date', semesterData.start_date)
          .lte('date', semesterData.end_date);

        if (scheduleError) throw scheduleError;

        // Process the data to calculate statistics
        const subjectStats = new Map();

        // Initialize subjects from schedule
        scheduleData?.forEach(item => {
          if (!subjectStats.has(item.subject_id)) {
            // Check if subjects data exists and is an array
            const subjectInfo = Array.isArray(item.subjects) ? item.subjects[0] : item.subjects;
            subjectStats.set(item.subject_id, {
              id: item.subject_id,
              name: subjectInfo?.name || 'Unknown Subject',
              code: subjectInfo?.code || 'UNKNOWN',
              totalClasses: 0,
              attendedClasses: 0,
              missedClasses: 0,
              cancelledClasses: 0,
            });
          }
          subjectStats.get(item.subject_id).totalClasses++;
        });

        // Update with attendance data
        attendanceData?.forEach(record => {
          // Check if subjects data exists and is an array
          const subjectInfo = Array.isArray(record.subjects) ? record.subjects[0] : record.subjects;
          if (subjectInfo && subjectInfo.id) {
            const subject = subjectStats.get(subjectInfo.id);
            if (subject) {
              if (record.status === 'attended') {
                subject.attendedClasses++;
              } else if (record.status === 'missed') {
                subject.missedClasses++;
              } else if (record.status === 'cancelled') {
                subject.cancelledClasses++;
              }
            }
          }
        });

        // Convert to array and calculate percentages
        const subjects: Subject[] = Array.from(subjectStats.values()).map(subject => {
          const validClasses = subject.totalClasses - subject.cancelledClasses;
          const percentage = validClasses > 0 ? (subject.attendedClasses / validClasses) * 100 : 0;
          const requiredClasses = percentage < 75 ? Math.ceil((0.75 * validClasses) - subject.attendedClasses) : undefined;

          return {
            ...subject,
            percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal place
            requiredClasses
          };
        });

        // Generate trend data (weekly)
        const weeklyStats = new Map();

        // Get week number from date
        const getWeekNumber = (dateStr: string) => {
          const date = new Date(dateStr);
          const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
          const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
          return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        };

        // Process attendance data by week
        attendanceData?.forEach(record => {
          const weekNum = getWeekNumber(record.date);

          if (!weeklyStats.has(weekNum)) {
            weeklyStats.set(weekNum, {
              week: `Week ${weekNum}`,
              attended: 0,
              total: 0
            });
          }

          const week = weeklyStats.get(weekNum);
          week.total++;
          if (record.status === 'attended') {
            week.attended++;
          }
        });

        // Convert to array and calculate percentages
        const trends: TrendDataPoint[] = Array.from(weeklyStats.values())
          .sort((a, b) => parseInt(a.week.split(' ')[1]) - parseInt(b.week.split(' ')[1]))
          .map(week => ({
            ...week,
            percentage: week.total > 0 ? Math.round((week.attended / week.total) * 100 * 10) / 10 : 0
          }));

        setFilteredSubjects(subjects);
        setTrendData(trends);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        // Fallback to mock data if there's an error
        setFilteredSubjects(mockSubjects);
        setTrendData(mockTrendData);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [isHydrated, user]);

  const calculateOverallStats = () => {
    const subjects = filteredSubjects.length > 0 ? filteredSubjects : mockSubjects;
    const totalClasses = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
    const totalAttended = subjects.reduce((sum, s) => sum + s.attendedClasses, 0);
    const overallPercentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;
    const safeSubjects = subjects.filter((s) => s.percentage >= 75).length;
    const dangerSubjects = subjects.filter((s) => s.percentage < 70).length;

    return {
      totalSubjects: subjects.length,
      overallPercentage,
      safeSubjects,
      dangerSubjects,
    };
  };

  const handleFilterChange = (filters: FilterState) => {
    let filtered = [...mockSubjects];

    if (filters.subject !== 'all') {
      filtered = filtered.filter((s) => s.id === filters.subject);
    }

    if (filters.status !== 'all') {
      if (filters.status === 'safe') {
        filtered = filtered.filter((s) => s.percentage >= 75);
      } else if (filters.status === 'warning') {
        filtered = filtered.filter((s) => s.percentage >= 70 && s.percentage < 75);
      } else if (filters.status === 'danger') {
        filtered = filtered.filter((s) => s.percentage < 70);
      }
    }

    filtered.sort((a, b) => {
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

    setFilteredSubjects(filtered);
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
      subjects: mockSubjects,
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

          <FilterControls onFilterChange={handleFilterChange} subjects={mockSubjects} />

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

          <AttendanceTrendChart data={mockTrendData} />

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
