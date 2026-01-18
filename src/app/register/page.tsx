import type { Metadata } from 'next';
import RegistrationForm from './components/RegistrationForm';
import RegistrationBenefits from './components/RegistrationBenefits';

export const metadata: Metadata = {
  title: 'Register - AttendanceTracker',
  description:
    'Create your AttendanceTracker account to start managing your B.Tech class attendance, monitor 75% compliance, and maintain detailed academic records with integrated note-taking.',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="order-2 lg:order-1">
            <RegistrationBenefits />
          </div>

          <div className="order-1 lg:order-2">
            <RegistrationForm />
          </div>
        </div>
      </div>

      <div className="bg-muted/30 border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} AttendanceTracker. All rights reserved.</p>
            <p className="mt-2">
              Designed for B.Tech students to maintain academic excellence through smart attendance
              management
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
