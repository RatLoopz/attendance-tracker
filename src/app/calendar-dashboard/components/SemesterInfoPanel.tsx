'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface SubjectAlert {
  name: string;
  percentage: number;
  status: 'safe' | 'warning' | 'danger';
  requiredClasses: number;
}

interface SemesterInfoPanelProps {
  semesterStart: string;
  semesterEnd: string;
  className?: string;
}

const SemesterInfoPanel = ({ semesterStart, semesterEnd, className = '' }: SemesterInfoPanelProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [overallPercentage, setOverallPercentage] = useState(82);
  const [subjectAlerts, setSubjectAlerts] = useState<SubjectAlert[]>([]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const mockSubjects: SubjectAlert[] = [
      { name: 'Data Structures', percentage: 72, status: 'warning', requiredClasses: 3 },
      { name: 'Operating Systems', percentage: 68, status: 'danger', requiredClasses: 5 },
      { name: 'Database Management', percentage: 85, status: 'safe', requiredClasses: 0 },
      { name: 'Computer Networks', percentage: 78, status: 'safe', requiredClasses: 0 },
      { name: 'Software Engineering', percentage: 88, status: 'safe', requiredClasses: 0 },
    ];

    setSubjectAlerts(mockSubjects);
  }, [isHydrated]);

  const formatDate = (dateString: string) => {
    if (!isHydrated) return dateString;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'text-success bg-success/10';
      case 'warning':
        return 'text-warning bg-warning/10';
      case 'danger':
        return 'text-error bg-error/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return 'CheckCircleIcon';
      case 'warning':
        return 'ExclamationTriangleIcon';
      case 'danger':
        return 'XCircleIcon';
      default:
        return 'InformationCircleIcon';
    }
  };

  if (!isHydrated) {
    return (
      <div className={`bg-card rounded-lg shadow-elevation-2 p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-muted rounded w-3/4" />
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-lg shadow-elevation-2 p-6 space-y-6 ${className}`}>
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">Current Semester</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Icon name="CalendarIcon" size={20} className="text-muted-foreground" />
            <div>
              <div className="caption text-muted-foreground">Start Date</div>
              <div className="text-sm font-medium text-foreground">{formatDate(semesterStart)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Icon name="CalendarIcon" size={20} className="text-muted-foreground" />
            <div>
              <div className="caption text-muted-foreground">End Date</div>
              <div className="text-sm font-medium text-foreground">{formatDate(semesterEnd)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-foreground">Overall Attendance</h4>
          <Link
            href="/semester-statistics"
            className="caption text-primary hover:text-primary/80 transition-smooth flex items-center gap-1"
          >
            View Details
            <Icon name="ChevronRightIcon" size={16} />
          </Link>
        </div>
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="caption text-muted-foreground">Current Status</span>
            <span className="data-text text-2xl font-semibold text-foreground">{overallPercentage}%</span>
          </div>
          <div className="w-full bg-background rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-smooth ${
                overallPercentage >= 75 ? 'bg-success' : overallPercentage >= 70 ? 'bg-warning' : 'bg-error'
              }`}
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">Subject Alerts</h4>
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {subjectAlerts
            .filter((subject) => subject.status !== 'safe')
            .map((subject, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${getStatusColor(subject.status)} flex items-start gap-3`}
              >
                <Icon name={getStatusIcon(subject.status) as any} size={20} variant="solid" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{subject.name}</div>
                  <div className="caption text-muted-foreground mt-1">
                    {subject.percentage}% attendance
                  </div>
                  {subject.requiredClasses > 0 && (
                    <div className="caption mt-1">
                      Attend next {subject.requiredClasses} class{subject.requiredClasses > 1 ? 'es' : ''} to reach 75%
                    </div>
                  )}
                </div>
              </div>
            ))}
          {subjectAlerts.filter((subject) => subject.status !== 'safe').length === 0 && (
            <div className="text-center py-6">
              <Icon name="CheckCircleIcon" size={48} className="text-success mx-auto mb-2" variant="solid" />
              <p className="caption text-muted-foreground">All subjects are in safe zone!</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <Link
          href="/semester-configuration"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth"
        >
          <Icon name="Cog6ToothIcon" size={20} />
          <span className="text-sm font-medium">Configure Semester</span>
        </Link>
      </div>
    </div>
  );
};

export default SemesterInfoPanel;