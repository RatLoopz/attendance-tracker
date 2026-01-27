'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  className?: string;
}

interface NavigationItem {
  label: string;
  path?: string;
  action?: string;
  icon: string;
  tooltip?: string;
}

const Header = ({ className = '' }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<'safe' | 'warning' | 'danger'>('safe');
  const [currentDate, setCurrentDate] = useState('');

  const navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      path: '/calendar-dashboard',
      icon: 'CalendarIcon',
      tooltip: 'View calendar overview',
    },
    {
      label: 'Today',
      path: '/daily-attendance',
      icon: 'ClockIcon',
      tooltip: "Mark today's attendance",
    },
    {
      label: 'Statistics',
      path: '/semester-statistics',
      icon: 'ChartBarIcon',
      tooltip: 'View semester analytics',
    },
  ];

  const settingsItems = [
    {
      label: 'Semester Configuration',
      path: '/semester-configuration',
      icon: 'CogIcon',
    },
    {
      label: 'Logout',
      action: 'logout',
      icon: 'ArrowRightOnRectangleIcon',
    },
  ];

  useEffect(() => {
    const date = new Date();
    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    setCurrentDate(formatted);

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.settings-dropdown')) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => pathname === path;

  const getStatusColor = () => {
    switch (attendanceStatus) {
      case 'safe':
        return 'bg-success';
      case 'warning':
        return 'bg-warning';
      case 'danger':
        return 'bg-error';
      default:
        return 'bg-success';
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-card shadow-elevation-2 ${className}`}>
      <div className="flex items-center justify-between h-[60px] px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/calendar-dashboard"
            className="flex items-center gap-3 transition-smooth hover:opacity-80"
          >
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Icon
                name="AcademicCapIcon"
                size={24}
                className="text-primary-foreground"
                variant="solid"
              />
            </div>
            <span className="font-heading font-semibold text-xl text-foreground">
              AttendanceTracker
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path || item.label}
                href={item.path || '#'}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-smooth
                  ${
                    item.path && isActive(item.path)
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
                title={item.tooltip}
              >
                <Icon
                  name={item.icon as any}
                  size={20}
                  variant={item.path && isActive(item.path) ? 'solid' : 'outline'}
                />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-muted rounded-lg">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <span className="caption text-muted-foreground">{currentDate}</span>
          </div>

          <div className="relative settings-dropdown">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`
                flex items-center justify-center w-10 h-10 rounded-lg transition-smooth
                ${isSettingsOpen ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground'}
              `}
              aria-label="Settings menu"
            >
              <Icon name="Cog6ToothIcon" size={20} variant={isSettingsOpen ? 'solid' : 'outline'} />
            </button>

            {isSettingsOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-popover rounded-lg shadow-elevation-4 overflow-hidden animate-slide-down">
                {settingsItems.map((item, index) => {
                  if (item.action === 'logout') {
                    return (
                      <button
                        key="logout"
                        onClick={async () => {
                          setIsSettingsOpen(false);
                          await signOut();
                          router.push('/login');
                        }}
                        className={`
                          flex items-center gap-3 px-4 py-3 transition-smooth w-full text-left
                          hover:bg-muted text-popover-foreground
                          ${index !== settingsItems.length - 1 ? 'border-b border-border' : ''}
                        `}
                      >
                        <Icon name={item.icon as any} size={20} />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    );
                  }
                  
                  return (
                    <Link
                      key={item.path || item.label}
                      href={item.path || '#'}
                      onClick={() => setIsSettingsOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 transition-smooth
                        hover:bg-muted text-popover-foreground
                        ${index !== settingsItems.length - 1 ? 'border-b border-border' : ''}
                      `}
                    >
                      <Icon name={item.icon as any} size={20} />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="flex items-center justify-around h-16 px-2">
          {navigationItems.map((item) => (
            <Link
              key={item.path || item.label}
              href={item.path || '#'}
              className={`
                flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-smooth min-w-[64px]
                ${item.path && isActive(item.path) ? 'text-primary' : 'text-muted-foreground'}
              `}
            >
              <Icon
                name={item.icon as any}
                size={24}
                variant={item.path && isActive(item.path) ? 'solid' : 'outline'}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`
              flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-smooth min-w-[64px]
              ${isSettingsOpen ? 'text-primary' : 'text-muted-foreground'}
            `}
          >
            <Icon name="Cog6ToothIcon" size={24} variant={isSettingsOpen ? 'solid' : 'outline'} />
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
