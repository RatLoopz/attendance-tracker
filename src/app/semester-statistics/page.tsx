import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import SemesterStatisticsInteractive from './components/SemesterStatisticsInteractive';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Semester Statistics - AttendanceTracker',
  description:
    'View comprehensive attendance analytics, subject-wise breakdown, and threshold monitoring for academic performance tracking with real-time statistics and exam eligibility status.',
};

export default function SemesterStatisticsPage() {
  return (
    <ProtectedRoute>
      <>
        <Header />
        <SemesterStatisticsInteractive />
      </>
    </ProtectedRoute>
  );
}
