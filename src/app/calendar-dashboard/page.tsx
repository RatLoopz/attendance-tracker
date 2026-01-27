import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import DateContextIndicator from '@/components/common/DateContextIndicator';
import QuickStatusIndicator from '@/components/common/QuickStatusIndicator';
import CalendarDashboardInteractive from './components/CalendarDashboardInteractive';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Calendar Dashboard - AttendanceTracker',
  description: 'Navigate your academic year and access daily attendance tracking with an interactive calendar view showing semester highlights and attendance status indicators.',
};

export default function CalendarDashboardPage() {
  return (
    <ProtectedRoute>
      <>
        <Header>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <DateContextIndicator />
            </div>
            <QuickStatusIndicator />
          </div>
        </Header>
        <CalendarDashboardInteractive />
      </>
    </ProtectedRoute>
  );
}