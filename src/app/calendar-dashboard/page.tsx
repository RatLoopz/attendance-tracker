import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import CalendarDashboardInteractive from './components/CalendarDashboardInteractive';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Calendar Dashboard - AttendanceTracker',
  description:
    'Navigate your academic year and access daily attendance tracking with an interactive calendar view showing semester highlights and attendance status indicators.',
};

export default function CalendarDashboardPage() {
  return (
    <ProtectedRoute>
      <>
        <Header />
        <CalendarDashboardInteractive />
      </>
    </ProtectedRoute>
  );
}
