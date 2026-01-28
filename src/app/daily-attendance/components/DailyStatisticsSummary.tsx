'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

import { SubjectStats } from '@/lib/attendanceStatsService';

export interface DailyTotals {
  attended: number;
  missed: number;
  cancelled: number;
  total: number;
}

interface DailyStatisticsSummaryProps {
  dailyTotals: DailyTotals;
  subjectStats: SubjectStats[];
  loading?: boolean;
}

const DailyStatisticsSummary = ({
  dailyTotals,
  subjectStats,
  loading = false,
}: DailyStatisticsSummaryProps) => {
  if (loading) {
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
          {subjectStats.map((subject) => {
            const statusConfig = getStatusConfig(subject.status);

            // Calculate required classes to reach 75%
            let requiredClasses = 0;
            if (subject.attendancePercentage < 75) {
              const currentTotal = subject.totalClasses;
              const currentAttended = subject.attendedClasses;
              // Formula: (attended + x) / (total + x) >= 0.75
              // x = (0.75 * total - attended) / 0.25
              requiredClasses = Math.ceil((0.75 * currentTotal - currentAttended) / 0.25);
              requiredClasses = Math.max(0, requiredClasses);
            }

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
                    <span className="caption font-medium">
                      {subject.attendancePercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 caption text-muted-foreground">
                  <div className="text-center">
                    <div className="font-medium text-foreground">{subject.totalClasses}</div>
                    <div className="text-xs">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-success">{subject.attendedClasses}</div>
                    <div className="text-xs">Attended</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-error">{subject.missedClasses}</div>
                    <div className="text-xs">Missed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-warning">{subject.cancelledClasses}</div>
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
                        Attend next <strong>{requiredClasses} classes</strong> consecutively to
                        reach 75% attendance
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
                        Attend next <strong>{requiredClasses} classes</strong> to reach safe zone
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
