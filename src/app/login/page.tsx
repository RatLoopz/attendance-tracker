import type { Metadata } from 'next';
import LoginForm from './components/LoginForm';
import LoginFeatures from './components/LoginFeatures';
import Icon from '@/components/ui/AppIcon';

export const metadata: Metadata = {
  title: 'Login - AttendanceTracker',
  description:
    'Sign in to your AttendanceTracker account to manage your B.Tech class attendance, monitor 75% compliance, and track your academic progress with real-time statistics and alerts.',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Icon
                  name="AcademicCapIcon"
                  size={28}
                  className="text-primary-foreground"
                  variant="solid"
                />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">AttendanceTracker</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your personal academic attendance management system with calendar-based tracking and
              statistical analysis
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
            <div className="order-2 lg:order-1">
              <LoginFeatures />
            </div>
            <div className="order-1 lg:order-2">
              <LoginForm />
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8 lg:p-12 text-center">
            <h2 className="text-2xl lg:text-3xl font-semibold text-foreground mb-4">
              Never Miss Your 75% Attendance Again
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get real-time alerts, track daily attendance, maintain detailed notes, and ensure exam
              eligibility with our comprehensive attendance management system.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Icon name="CheckCircleIcon" size={20} className="text-success" variant="solid" />
                <span className="text-foreground">Calendar-based tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="CheckCircleIcon" size={20} className="text-success" variant="solid" />
                <span className="text-foreground">Real-time statistics</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="CheckCircleIcon" size={20} className="text-success" variant="solid" />
                <span className="text-foreground">Smart alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="CheckCircleIcon" size={20} className="text-success" variant="solid" />
                <span className="text-foreground">Rich note-taking</span>
              </div>
            </div>
          </div>

          <footer className="mt-16 pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} AttendanceTracker. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Support
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
