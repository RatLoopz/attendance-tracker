'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { getTodayMotivation, MotivationData } from '@/lib/motivationService';

interface MotivationCardProps {
  attendancePercentage: number;
  totalClasses: number;
  attendedClasses: number;
  className?: string;
}

const MotivationCard = ({
  attendancePercentage,
  totalClasses,
  attendedClasses,
  className = '',
}: MotivationCardProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [motivation, setMotivation] = useState<MotivationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Fetch motivation on mount
  useEffect(() => {
    if (!isHydrated) return;

    const fetchMotivation = async () => {
      setLoading(true);
      try {
        const data = await getTodayMotivation(
          attendancePercentage,
          totalClasses,
          attendedClasses,
          false // Don't force refresh on initial load
        );
        setMotivation(data);
      } catch (error) {
        console.error('Error fetching motivation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMotivation();
  }, [isHydrated, attendancePercentage, totalClasses, attendedClasses]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await getTodayMotivation(
        attendancePercentage,
        totalClasses,
        attendedClasses,
        true // Force refresh
      );
      setMotivation(data);
    } catch (error) {
      console.error('Error refreshing motivation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated) {
    return (
      <div
        className={`bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-muted/20 rounded w-32 mb-3" />
          <div className="h-6 bg-muted/20 rounded w-full mb-2" />
          <div className="h-6 bg-muted/20 rounded w-3/4" />
        </div>
      </div>
    );
  }

  // Determine card border/accent color based on attendance
  let accentColor = 'border-primary/50';
  if (attendancePercentage < 50) {
    accentColor = 'border-red-500/50';
  } else if (attendancePercentage < 65) {
    accentColor = 'border-orange-500/50';
  } else if (attendancePercentage < 75) {
    accentColor = 'border-yellow-500/50';
  }

  return (
    <div
      className={`relative bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm border-2 ${accentColor} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="FireIcon" size={20} className="text-orange-500" />
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Daily Motivation
          </h3>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
          aria-label="Refresh motivation"
        >
          <Icon
            name="ArrowPathIcon"
            size={16}
            className={`text-muted-foreground group-hover:text-foreground transition-colors ${
              loading ? 'animate-spin' : ''
            }`}
          />
        </button>
      </div>

      {/* Motivation Message */}
      <div className="min-h-[60px] flex items-center">
        {loading ? (
          <div className="w-full space-y-2">
            <div className="h-5 bg-muted/20 rounded w-full animate-pulse" />
            <div className="h-5 bg-muted/20 rounded w-4/5 animate-pulse" />
          </div>
        ) : (
          <p className="text-base font-medium text-foreground leading-relaxed">
            {motivation?.message || 'Bhai class attend karo, motivation baad me milega! 😅'}
          </p>
        )}
      </div>

      {/* Footer Badge */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {motivation?.isAIGenerated ? (
            <>
              <div className="px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
                <span className="text-xs font-medium text-primary">AI Generated</span>
              </div>
              <Icon name="SparklesIcon" size={14} className="text-primary" />
            </>
          ) : (
            <div className="px-2 py-1 rounded-md bg-muted/30 border border-border/30">
              <span className="text-xs font-medium text-muted-foreground">Static Roast</span>
            </div>
          )}
        </div>

        {/* Attendance Badge */}
        <div className="text-xs font-semibold text-muted-foreground">
          {attendancePercentage.toFixed(0)}% Attendance
        </div>
      </div>
    </div>
  );
};

export default MotivationCard;
