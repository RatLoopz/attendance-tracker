'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

interface DateContextIndicatorProps {
  className?: string;
}

const DateContextIndicator = ({ className = '' }: DateContextIndicatorProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [displayDate, setDisplayDate] = useState('');
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (pathname === '/daily-attendance') {
      const dateParam = searchParams.get('date');
      const date = dateParam ? new Date(dateParam) : new Date();

      const formatted = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      setDisplayDate(formatted);
      setShowIndicator(true);
    } else {
      setShowIndicator(false);
    }
  }, [pathname, searchParams]);

  if (!showIndicator) return null;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 bg-muted rounded-lg ${className}`}>
      <Link
        href="/calendar-dashboard"
        className="flex items-center gap-2 transition-smooth hover:text-primary"
        title="Back to calendar"
      >
        <Icon name="CalendarIcon" size={16} />
        <span className="caption text-muted-foreground">Calendar</span>
      </Link>
      <Icon name="ChevronRightIcon" size={16} className="text-muted-foreground" />
      <span className="caption font-medium text-foreground">{displayDate}</span>
    </div>
  );
};

export default DateContextIndicator;
