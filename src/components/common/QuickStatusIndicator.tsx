'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { getOverallAttendancePercentage } from '@/lib/attendanceStatsService';

interface QuickStatusIndicatorProps {
  className?: string;
}

type AttendanceStatus = 'safe' | 'warning' | 'danger';

interface StatusConfig {
  color: string;
  bgColor: string;
  icon: string;
  label: string;
  percentage: string;
}

const QuickStatusIndicator = ({ className = '' }: QuickStatusIndicatorProps) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<AttendanceStatus>('safe');
  const [percentage, setPercentage] = useState('0');
  const [stats, setStats] = useState({
    attended: 0,
    total: 0,
    requiredFor75: 0,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const result = await getOverallAttendancePercentage(user.id);
        if (!result.error) {
          setPercentage(result.percentage.toString());
          setStats({
            attended: result.attended,
            total: result.total,
            requiredFor75: result.requiredFor75,
          });
        }
      } catch (error) {
        console.error('Error fetching quick stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Set up an interval to refresh stats occasionally or listen to an event
    // For now, simpler is better. Maybe in a real app we'd use a swr/react-query
    const interval = setInterval(fetchStats, 30000); // 30 seconds refresh

    return () => clearInterval(interval);
  }, [user, isExpanded]); // Re-fetch when expanded too, to ensure freshness

  useEffect(() => {
    const percentageNum = parseInt(percentage);

    if (percentageNum >= 75) {
      setStatus('safe');
    } else if (percentageNum >= 70) {
      setStatus('warning');
    } else {
      setStatus('danger');
    }
  }, [percentage]);

  const statusConfig: Record<AttendanceStatus, StatusConfig> = {
    safe: {
      color: 'text-success',
      bgColor: 'bg-success/10',
      icon: 'CheckCircleIcon',
      label: 'Safe Zone',
      percentage: percentage,
    },
    warning: {
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      icon: 'ExclamationTriangleIcon',
      label: 'Caution',
      percentage: percentage,
    },
    danger: {
      color: 'text-error',
      bgColor: 'bg-error/10',
      icon: 'XCircleIcon',
      label: 'Danger Zone',
      percentage: percentage,
    },
  };

  const currentConfig = statusConfig[status];

  if (loading && !user) return null;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-smooth
          ${currentConfig.bgColor} ${currentConfig.color}
          hover:scale-105 active:scale-95
        `}
        title="View attendance status"
      >
        <Icon name={currentConfig.icon as any} size={20} variant="solid" />
        <span className="data-text font-medium text-sm hidden sm:inline">
          {currentConfig.percentage}%
        </span>
      </button>

      {isExpanded && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-popover rounded-lg shadow-elevation-4 p-4 animate-slide-down z-50">
          <div className="flex items-center justify-between mb-3">
            <span className="caption font-medium text-popover-foreground">Semester Status</span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-muted-foreground hover:text-foreground transition-smooth"
            >
              <Icon name="XMarkIcon" size={16} />
            </button>
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-lg ${currentConfig.bgColor} mb-3`}>
            <Icon
              name={currentConfig.icon as any}
              size={24}
              className={currentConfig.color}
              variant="solid"
            />
            <div className="flex-1">
              <div className="data-text text-2xl font-semibold text-popover-foreground">
                {currentConfig.percentage}%
              </div>
              <div className={`caption ${currentConfig.color}`}>{currentConfig.label}</div>
            </div>
          </div>

          <div className="space-y-2 caption text-muted-foreground">
            <div className="flex justify-between">
              <span>Classes Attended:</span>
              <span className="font-medium text-popover-foreground">{stats.attended}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Classes:</span>
              <span className="font-medium text-popover-foreground">{stats.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Required for 75%:</span>
              <span className="font-medium text-popover-foreground">{stats.requiredFor75}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border">
            <div className="caption text-muted-foreground text-center">
              {status === 'safe' && "You're doing great! Keep it up."}
              {status === 'warning' && 'Attend more classes to stay safe.'}
              {status === 'danger' && 'Urgent: Attend all upcoming classes!'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickStatusIndicator;
