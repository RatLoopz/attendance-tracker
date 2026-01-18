import type { Metadata } from 'next';
import DailyAttendanceInteractive from './components/DailyAttendanceInteractive';

export const metadata: Metadata = {
  title: 'Daily Attendance - AttendanceTracker',
  description:
    'Track and manage your daily class attendance with real-time statistics, period-wise status updates, and integrated note-taking for academic records.',
};

export default function DailyAttendancePage() {
  return <DailyAttendanceInteractive />;
}
