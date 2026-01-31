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
        <div className="bg-card rounded-lg p-4 border border-border/50">
          <div className="h-32 bg-muted/50 rounded" />
        </div>
        <div className="bg-card rounded-lg p-4 border border-border/50">
          <div className="h-64 bg-muted/50 rounded" />
        </div>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'safe':
        return {
          textColor: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/10',
          label: 'Safe',
        };
      case 'warning':
        return {
          textColor: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-50 dark:bg-amber-900/10',
          label: 'Caution',
        };
      case 'danger':
        return {
          textColor: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/10',
          label: 'Danger',
        };
      default:
        return {
          textColor: 'text-muted-foreground',
          bgColor: 'bg-muted',
          label: 'Unknown',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Daily Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border/50 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-green-600 dark:text-green-400">
            {dailyTotals.attended}
          </span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">
            Attended
          </span>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-[#8a5d5d] dark:text-[#dcbdbd]">
            {dailyTotals.missed}
          </span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">
            Missed
          </span>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-amber-500">{dailyTotals.cancelled}</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">
            Cancelled
          </span>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-primary">{dailyTotals.total}</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">
            Total
          </span>
        </div>
      </div>

      {/* Subject List */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 bg-muted/20">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Icon name="ChartBarIcon" size={18} className="text-primary" />
            Subject Performance
          </h3>
        </div>

        <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto custom-scrollbar">
          {subjectStats.map((subject) => {
            const statusConfig = getStatusConfig(subject.status);

            // Calculate required classes to reach 75%
            let requiredClasses = 0;
            if (subject.attendancePercentage < 75) {
              const currentTotal = subject.totalClasses;
              const currentAttended = subject.attendedClasses;
              requiredClasses = Math.ceil((0.75 * currentTotal - currentAttended) / 0.25);
              requiredClasses = Math.max(0, requiredClasses);
            }

            return (
              <div key={subject.subjectCode} className="p-4 hover:bg-muted/20 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{subject.subjectName}</h4>
                    <span className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">
                      {subject.subjectCode}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${statusConfig.textColor}`}>
                      {subject.attendancePercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex gap-3">
                    <span>
                      <strong>{subject.attendedClasses}</strong> Present
                    </span>
                    <span>
                      <strong>{subject.missedClasses}</strong> Absent
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide ${statusConfig.bgColor} ${statusConfig.textColor}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>

                {(subject.status === 'danger' || subject.status === 'warning') && (
                  <div
                    className={`mt-3 text-xs flex items-start gap-1.5 ${statusConfig.textColor} bg-card/50 p-2 rounded border border-border/50`}
                  >
                    <Icon name="ExclamationCircleIcon" size={14} className="mt-0.5 flex-shrink-0" />
                    <span>
                      Attend next <strong>{requiredClasses} classes</strong> to reach{' '}
                      {subject.status === 'danger' ? '75%' : 'Safe Zone'}.
                    </span>
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
