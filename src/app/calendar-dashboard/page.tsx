import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import DateContextIndicator from '@/components/common/DateContextIndicator';
import QuickStatusIndicator from '@/components/common/QuickStatusIndicator';
import CalendarDashboardInteractive from './components/CalendarDashboardInteractive';

export const metadata: Metadata = {
  title: 'Calendar Dashboard - AttendanceTracker',
  description: 'Navigate your academic year and access daily attendance tracking with an interactive calendar view showing semester highlights and attendance status indicators.',
};

export default function CalendarDashboardPage() {
  return (
    <>
      <Header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <DateContextIndicator />
        </div>
        <QuickStatusIndicator />
      </Header>
      <CalendarDashboardInteractive />
    </>
  );
}