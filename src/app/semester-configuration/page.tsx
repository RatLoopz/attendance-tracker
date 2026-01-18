import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import SemesterConfigurationInteractive from './components/SemesterConfigurationInteractive';

export const metadata: Metadata = {
  title: 'Semester Configuration - AttendanceTracker',
  description:
    'Set up and manage your academic semester parameters, enrolled subjects, and daily class schedule for comprehensive attendance tracking.',
};

export default function SemesterConfigurationPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-[76px] pb-24 md:pb-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">
              Semester Configuration
            </h1>
            <p className="text-muted-foreground">
              Configure your academic semester settings, subjects, and daily schedule
            </p>
          </div>

          <SemesterConfigurationInteractive />
        </div>
      </main>
    </div>
  );
}
