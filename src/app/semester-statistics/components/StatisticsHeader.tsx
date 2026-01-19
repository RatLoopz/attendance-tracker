'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface StatisticsHeaderProps {
  totalSubjects: number;
  overallPercentage: number;
  safeSubjects: number;
  dangerSubjects: number;
}

const StatisticsHeader = ({
  totalSubjects,
  overallPercentage,
  safeSubjects,
  dangerSubjects,
}: StatisticsHeaderProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-lg shadow-elevation-2 p-6">
        <div className="h-32 animate-pulse bg-muted rounded" />
      </div>
    );
  }

  const getStatusColor = () => {
    if (overallPercentage >= 75) return 'text-success';
    if (overallPercentage >= 70) return 'text-warning';
    return 'text-error';
  };

  const getStatusBg = () => {
    if (overallPercentage >= 75) return 'bg-success/10';
    if (overallPercentage >= 70) return 'bg-warning/10';
    return 'bg-error/10';
  };

  const getStatusIcon = () => {
    if (overallPercentage >= 75) return 'CheckCircleIcon';
    if (overallPercentage >= 70) return 'ExclamationTriangleIcon';
    return 'XCircleIcon';
  };

  const getStatusLabel = () => {
    if (overallPercentage >= 75) return 'Safe Zone';
    if (overallPercentage >= 70) return 'Caution Zone';
    return 'Danger Zone';
  };

  return (
    <div className="bg-card rounded-lg shadow-elevation-2 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Semester Overview</h2>
          <p className="caption text-muted-foreground">
            Complete attendance statistics for all subjects
          </p>
        </div>

        <div className={`flex items-center gap-4 p-4 rounded-lg ${getStatusBg()}`}>
          <Icon
            name={getStatusIcon() as any}
            size={40}
            className={getStatusColor()}
            variant="solid"
          />
          <div>
            <div className={`data-text text-3xl font-bold ${getStatusColor()}`}>
              {overallPercentage.toFixed(1)}%
            </div>
            <div className={`caption font-medium ${getStatusColor()}`}>{getStatusLabel()}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="BookOpenIcon" size={20} className="text-primary" />
            <span className="caption text-muted-foreground">Total Subjects</span>
          </div>
          <div className="data-text text-2xl font-semibold text-foreground">{totalSubjects}</div>
        </div>

        <div className="bg-success/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="CheckCircleIcon" size={20} className="text-success" variant="solid" />
            <span className="caption text-muted-foreground">Safe Zone</span>
          </div>
          <div className="data-text text-2xl font-semibold text-success">{safeSubjects}</div>
        </div>

        <div className="bg-error/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="ExclamationTriangleIcon" size={20} className="text-error" variant="solid" />
            <span className="caption text-muted-foreground">Danger Zone</span>
          </div>
          <div className="data-text text-2xl font-semibold text-error">{dangerSubjects}</div>
        </div>

        <div className="bg-primary/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="AcademicCapIcon" size={20} className="text-primary" variant="solid" />
            <span className="caption text-muted-foreground">Exam Eligible</span>
          </div>
          <div className="data-text text-2xl font-semibold text-primary">
            {safeSubjects}/{totalSubjects}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsHeader;
