'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import {
  getOverallAttendancePercentage,
  getAttendanceAlertsForSubjects,
  SubjectAlert,
} from '@/lib/attendanceStatsService';

interface SemesterInfoPanelProps {
  semesterStart: string;
  semesterEnd: string;
  className?: string;
}

const SemesterInfoPanel = ({
  semesterStart,
  semesterEnd,
  className = '',
}: SemesterInfoPanelProps) => {
  const { user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [overallPercentage, setOverallPercentage] = useState(0);
  const [subjectAlerts, setSubjectAlerts] = useState<SubjectAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!isHydrated || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch overall attendance percentage
        const { percentage, error: percentageError } = await getOverallAttendancePercentage(
          user.id
        );

        if (percentageError) {
          console.error('Error fetching overall percentage:', percentageError);
        } else {
          setOverallPercentage(percentage);
        }

        // Fetch subject alerts
        const { data: alerts, error: alertsError } = await getAttendanceAlertsForSubjects(user.id);

        if (alertsError) {
          console.error('Error fetching subject alerts:', alertsError);
        } else {
          setSubjectAlerts(alerts || []);
        }
      } catch (err) {
        console.error('Unexpected error fetching attendance data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [isHydrated, user]);

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

  if (!isHydrated || loading) {
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
    <div
      className={`bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm p-6 space-y-8 ${className}`}
    >
      <div>
        <h3 className="text-xl font-bold text-foreground mb-6 tracking-tight">Current Semester</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 group">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <Icon name="CalendarIcon" size={20} />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Start Date
              </div>
              <div className="text-sm font-semibold text-foreground">
                {formatDate(semesterStart)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <Icon name="CalendarIcon" size={20} />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                End Date
              </div>
              <div className="text-sm font-semibold text-foreground">{formatDate(semesterEnd)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/50 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Overall Attendance
          </h4>
          <Link
            href="/semester-statistics"
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-smooth flex items-center gap-1 hover:gap-1.5"
          >
            View Details
            <Icon name="ChevronRightIcon" size={14} />
          </Link>
        </div>
        <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Current Status</span>
            <span
              className={`text-3xl font-bold tracking-tight ${
                overallPercentage >= 75
                  ? 'text-success'
                  : overallPercentage >= 70
                    ? 'text-warning'
                    : 'text-error'
              }`}
            >
              {overallPercentage}%
            </span>
          </div>
          <div className="w-full bg-background/50 rounded-full h-2.5 overflow-hidden ring-1 ring-border/20">
            <div
              className={`h-full transition-all duration-1000 ease-out ${
                overallPercentage >= 75
                  ? 'bg-success shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                  : overallPercentage >= 70
                    ? 'bg-warning shadow-[0_0_10px_rgba(234,179,8,0.4)]'
                    : 'bg-error shadow-[0_0_10px_rgba(239,68,68,0.4)]'
              }`}
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border/50 pt-6">
        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Subject Alerts
        </h4>
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {subjectAlerts.length > 0 ? (
            subjectAlerts.map((subject, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  subject.status === 'safe'
                    ? 'bg-success/5 border-success/20'
                    : subject.status === 'warning'
                      ? 'bg-warning/5 border-warning/20'
                      : 'bg-error/5 border-error/20'
                } flex items-start gap-3 transition-colors hover:bg-opacity-70`}
              >
                <div
                  className={`p-1.5 rounded-full ${
                    subject.status === 'safe'
                      ? 'bg-success/10 text-success'
                      : subject.status === 'warning'
                        ? 'bg-warning/10 text-warning'
                        : 'bg-error/10 text-error'
                  }`}
                >
                  <Icon name={getStatusIcon(subject.status) as any} size={16} variant="solid" />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-semibold text-foreground truncate"
                    title={subject.subjectName}
                  >
                    {subject.subjectName}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs font-bold ${
                        subject.status === 'safe'
                          ? 'text-success'
                          : subject.status === 'warning'
                            ? 'text-warning'
                            : 'text-error'
                      }`}
                    >
                      {subject.attendancePercentage}%
                    </span>
                  </div>
                  {subject.requiredClasses > 0 && (
                    <div className="text-xs text-muted-foreground mt-1 leading-snug">
                      Attend{' '}
                      <span className="font-semibold text-foreground">
                        {subject.requiredClasses}
                      </span>{' '}
                      more class{subject.requiredClasses > 1 ? 'es' : ''} to reach 75%
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed border-border">
              <div className="inline-flex p-3 rounded-full bg-success/10 text-success mb-3">
                <Icon name="CheckCircleIcon" size={24} variant="solid" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                All subjects are in safe zone!
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border/50 pt-6">
        <Link
          href="/semester-configuration"
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Icon name="Cog6ToothIcon" size={20} />
          <span className="text-sm font-semibold">Configure Semester</span>
        </Link>
      </div>
    </div>
  );
};

export default SemesterInfoPanel;
