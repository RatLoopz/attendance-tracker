'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface SubjectStats {
  subjectName: string;
  subjectCode: string;
  totalClasses: number;
  attended: number;
  missed: number;
  cancelled: number;
  percentage: number;
  status: 'safe' | 'warning' | 'danger';
}

interface DailyStatisticsSummaryProps {
  selectedDate: Date;
}

const DailyStatisticsSummary = ({ selectedDate }: DailyStatisticsSummaryProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [stats, setStats] = useState<SubjectStats[]>([]);
  const [dailyTotals, setDailyTotals] = useState({
    attended: 0,
    missed: 0,
    cancelled: 0,
    total: 0,
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const mockStats: SubjectStats[] = [
      {
        subjectName: 'Data Structures',
        subjectCode: 'CS201',
        totalClasses: 45,
        attended: 38,
        missed: 5,
        cancelled: 2,
        percentage: 84.4,
        status: 'safe',
      },
      {
        subjectName: 'Database Management',
        subjectCode: 'CS202',
        totalClasses: 42,
        attended: 35,
        missed: 5,
        cancelled: 2,
        percentage: 83.3,
        status: 'safe',
      },
      {
        subjectName: 'Operating Systems',
        subjectCode: 'CS203',
        totalClasses: 48,
        attended: 34,
        missed: 12,
        cancelled: 2,
        percentage: 70.8,
        status: 'warning',
      },
      {
        subjectName: 'Computer Networks',
        subjectCode: 'CS204',
        totalClasses: 40,
        attended: 27,
        missed: 11,
        cancelled: 2,
        percentage: 67.5,
        status: 'danger',
      },
      {
        subjectName: 'Software Engineering',
        subjectCode: 'CS205',
        totalClasses: 44,
        attended: 36,
        missed: 6,
        cancelled: 2,
        percentage: 81.8,
        status: 'safe',
      },
      {
        subjectName: 'Web Technologies',
        subjectCode: 'CS206',
        totalClasses: 46,
        attended: 39,
        missed: 5,
        cancelled: 2,
        percentage: 84.8,
        status: 'safe',
      },
    ];

    setStats(mockStats);

    const totals = {
      attended: 4,
      missed: 1,
      cancelled: 1,
      total: 6,
    };
    setDailyTotals(totals);
  }, [isHydrated, selectedDate]);

  if (!isHydrated) {
    return (
      <div className="space-y-4">
        <div className="bg-card rounded-lg p-4 shadow-elevation-2 animate-pulse">
          <div className="h-32 bg-muted rounded" />
        </div>
        <div className="bg-card rounded-lg p-4 shadow-elevation-2 animate-pulse">
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'safe':
        return {
          color: 'text-success',
          bgColor: 'bg-success/10',
          icon: 'CheckCircleIcon',
          label: 'Safe Zone',
        };
      case 'warning':
        return {
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          icon: 'ExclamationTriangleIcon',
          label: 'Caution',
        };
      case 'danger':
        return {
          color: 'text-error',
          bgColor: 'bg-error/10',
          icon: 'XCircleIcon',
          label: 'Danger Zone',
        };
      default:
        return {
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          icon: 'InformationCircleIcon',
          label: 'Unknown',
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg p-4 md:p-6 shadow-elevation-2">
        <h3 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
          <Icon name="ChartBarIcon" size={20} className="text-primary" />
          Today's Summary
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-success/10 rounded-lg p-3 text-center">
            <div className="data-text text-2xl font-bold text-success mb-1">
              {dailyTotals.attended}
            </div>
            <div className="caption text-muted-foreground">Attended</div>
          </div>

          <div className="bg-error/10 rounded-lg p-3 text-center">
            <div className="data-text text-2xl font-bold text-error mb-1">{dailyTotals.missed}</div>
            <div className="caption text-muted-foreground">Missed</div>
          </div>

          <div className="bg-warning/10 rounded-lg p-3 text-center">
            <div className="data-text text-2xl font-bold text-warning mb-1">
              {dailyTotals.cancelled}
            </div>
            <div className="caption text-muted-foreground">Cancelled</div>
          </div>

          <div className="bg-primary/10 rounded-lg p-3 text-center">
            <div className="data-text text-2xl font-bold text-primary mb-1">
              {dailyTotals.total}
            </div>
            <div className="caption text-muted-foreground">Total</div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 md:p-6 shadow-elevation-2">
        <h3 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
          <Icon name="AcademicCapIcon" size={20} className="text-primary" />
          Subject-wise Statistics
        </h3>

        <div className="space-y-3">
          {stats.map((subject) => {
            const statusConfig = getStatusConfig(subject.status);

            return (
              <div
                key={subject.subjectCode}
                className="bg-muted/50 rounded-lg p-4 transition-smooth hover:bg-muted"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{subject.subjectName}</h4>
                    <span className="caption text-muted-foreground">{subject.subjectCode}</span>
                  </div>

                  <div
                    className={`
                    flex items-center gap-1 px-2 py-1 rounded-lg
                    ${statusConfig.bgColor} ${statusConfig.color}
                    flex-shrink-0
                  `}
                  >
                    <Icon name={statusConfig.icon as any} size={14} variant="solid" />
                    <span className="caption font-medium">{subject.percentage.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 caption text-muted-foreground">
                  <div className="text-center">
                    <div className="font-medium text-foreground">{subject.totalClasses}</div>
                    <div className="text-xs">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-success">{subject.attended}</div>
                    <div className="text-xs">Attended</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-error">{subject.missed}</div>
                    <div className="text-xs">Missed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-warning">{subject.cancelled}</div>
                    <div className="text-xs">Cancelled</div>
                  </div>
                </div>

                {subject.status === 'danger' && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-start gap-2 text-error caption">
                      <Icon
                        name="ExclamationCircleIcon"
                        size={16}
                        className="flex-shrink-0 mt-0.5"
                      />
                      <span>
                        Attend next <strong>8 classes</strong> consecutively to reach 75% attendance
                      </span>
                    </div>
                  </div>
                )}

                {subject.status === 'warning' && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-start gap-2 text-warning caption">
                      <Icon
                        name="ExclamationTriangleIcon"
                        size={16}
                        className="flex-shrink-0 mt-0.5"
                      />
                      <span>
                        Attend next <strong>4 classes</strong> to maintain safe zone
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DailyStatisticsSummary;
