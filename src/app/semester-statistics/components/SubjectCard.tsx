'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface SubjectCardProps {
  subject: {
    id: string;
    name: string;
    code: string;
    totalClasses: number;
    attendedClasses: number;
    missedClasses: number;
    cancelledClasses: number;
    percentage: number;
    requiredClasses?: number;
  };
}

const SubjectCard = ({ subject }: SubjectCardProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-lg shadow-elevation-2 p-6">
        <div className="h-48 animate-pulse bg-muted rounded" />
      </div>
    );
  }

  const isSafe = subject.percentage >= 75;
  const isWarning = subject.percentage >= 70 && subject.percentage < 75;
  const isDanger = subject.percentage < 70;

  const getStatusColor = () => {
    if (isSafe) return 'text-success';
    if (isWarning) return 'text-warning';
    return 'text-error';
  };

  const getStatusBg = () => {
    if (isSafe) return 'bg-success/10';
    if (isWarning) return 'bg-warning/10';
    return 'bg-error/10';
  };

  const getStatusIcon = () => {
    if (isSafe) return 'CheckCircleIcon';
    if (isWarning) return 'ExclamationTriangleIcon';
    return 'XCircleIcon';
  };

  const getStatusLabel = () => {
    if (isSafe) return 'Safe Zone';
    if (isWarning) return 'Caution';
    return 'Danger Zone';
  };

  return (
    <div className="bg-card rounded-lg shadow-elevation-2 hover:shadow-elevation-3 transition-smooth overflow-hidden">
      <div className={`h-2 ${isSafe ? 'bg-success' : isWarning ? 'bg-warning' : 'bg-error'}`} />

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1">{subject.name}</h3>
            <p className="caption text-muted-foreground">{subject.code}</p>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusBg()}`}>
            <Icon
              name={getStatusIcon() as any}
              size={16}
              className={getStatusColor()}
              variant="solid"
            />
            <span className={`caption font-medium ${getStatusColor()}`}>{getStatusLabel()}</span>
          </div>
        </div>

        <div className={`flex items-center justify-center p-4 rounded-lg ${getStatusBg()} mb-4`}>
          <div className="text-center">
            <div className={`data-text text-4xl font-bold ${getStatusColor()}`}>
              {subject.percentage.toFixed(1)}%
            </div>
            <div className="caption text-muted-foreground mt-1">Current Attendance</div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="CheckCircleIcon" size={16} className="text-success" variant="solid" />
              <span className="caption text-muted-foreground">Attended</span>
            </div>
            <span className="data-text font-semibold text-foreground">
              {subject.attendedClasses}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="XCircleIcon" size={16} className="text-error" variant="solid" />
              <span className="caption text-muted-foreground">Missed</span>
            </div>
            <span className="data-text font-semibold text-foreground">{subject.missedClasses}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="MinusCircleIcon" size={16} className="text-warning" variant="solid" />
              <span className="caption text-muted-foreground">Cancelled</span>
            </div>
            <span className="data-text font-semibold text-foreground">
              {subject.cancelledClasses}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <Icon name="BookOpenIcon" size={16} className="text-primary" />
              <span className="caption text-muted-foreground">Total Classes</span>
            </div>
            <span className="data-text font-semibold text-foreground">{subject.totalClasses}</span>
          </div>
        </div>

        {!isSafe && subject.requiredClasses && (
          <div className={`p-4 rounded-lg ${isDanger ? 'bg-error/10' : 'bg-warning/10'} mb-4`}>
            <div className="flex items-start gap-3">
              <Icon
                name="ExclamationTriangleIcon"
                size={20}
                className={isDanger ? 'text-error' : 'text-warning'}
                variant="solid"
              />
              <div className="flex-1">
                <p
                  className={`caption font-medium ${isDanger ? 'text-error' : 'text-warning'} mb-1`}
                >
                  Action Required
                </p>
                <p className="caption text-muted-foreground">
                  Attend next{' '}
                  <span className="font-semibold text-foreground">{subject.requiredClasses}</span>{' '}
                  consecutive classes to reach 75%
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 py-2 text-primary hover:bg-primary/10 rounded-lg transition-smooth"
        >
          <span className="caption font-medium">{isExpanded ? 'Show Less' : 'View Details'}</span>
          <Icon name={isExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={16} />
        </button>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border space-y-3 animate-slide-down">
            <div className="flex items-center justify-between">
              <span className="caption text-muted-foreground">Classes Conducted</span>
              <span className="data-text font-medium text-foreground">{subject.totalClasses}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="caption text-muted-foreground">Attendance Rate</span>
              <span className="data-text font-medium text-foreground">
                {subject.attendedClasses}/{subject.totalClasses}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="caption text-muted-foreground">Required for 75%</span>
              <span className="data-text font-medium text-foreground">
                {Math.ceil(subject.totalClasses * 0.75)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectCard;
