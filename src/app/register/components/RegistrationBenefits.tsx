import Icon from '@/components/ui/AppIcon';

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

const RegistrationBenefits = () => {
  const benefits: Benefit[] = [
    {
      icon: 'CalendarDaysIcon',
      title: 'Smart Calendar Tracking',
      description:
        'Visual calendar interface with semester highlighting and easy date navigation for comprehensive attendance overview',
    },
    {
      icon: 'ChartBarIcon',
      title: 'Real-time Statistics',
      description:
        'Instant calculation of attendance percentages with automatic alerts when approaching the 75% threshold',
    },
    {
      icon: 'BellAlertIcon',
      title: 'Danger Zone Alerts',
      description:
        'Get notified when your attendance drops below safe levels with actionable insights to recover',
    },
    {
      icon: 'DocumentTextIcon',
      title: 'Integrated Notes',
      description:
        'Rich text editor for date-specific notes, assignment reminders, and important academic information',
    },
    {
      icon: 'ShieldCheckIcon',
      title: 'Secure & Private',
      description:
        'Your attendance data is encrypted and stored securely with complete privacy protection',
    },
    {
      icon: 'DevicePhoneMobileIcon',
      title: 'Mobile Responsive',
      description:
        'Access your attendance tracker seamlessly across all devices with optimized mobile experience',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center lg:text-left">
        <h2 className="text-2xl font-semibold text-foreground mb-3">
          Why Choose AttendanceTracker?
        </h2>
        <p className="text-muted-foreground">
          Take control of your academic attendance with powerful features designed specifically for
          B.Tech students
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="bg-card rounded-lg p-5 shadow-elevation-2 hover:shadow-elevation-3 transition-smooth"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name={benefit.icon as any} size={24} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground mb-1">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Icon
              name="SparklesIcon"
              size={24}
              className="text-primary-foreground"
              variant="solid"
            />
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">Start Your Journey Today</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Join thousands of B.Tech students who have taken control of their attendance tracking.
              Set up your account in minutes and never worry about missing the 75% threshold again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationBenefits;
