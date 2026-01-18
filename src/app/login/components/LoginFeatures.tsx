import Icon from '@/components/ui/AppIcon';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface LoginFeaturesProps {
  className?: string;
}

const LoginFeatures = ({ className = '' }: LoginFeaturesProps) => {
  const features: Feature[] = [
    {
      icon: 'CalendarDaysIcon',
      title: 'Calendar Tracking',
      description:
        'Interactive yearly calendar with semester highlighting and date-specific attendance management',
    },
    {
      icon: 'ChartBarIcon',
      title: 'Real-time Statistics',
      description:
        'Live attendance calculations with 75% threshold monitoring and danger zone alerts',
    },
    {
      icon: 'DocumentTextIcon',
      title: 'Smart Notes',
      description:
        'Rich text editor for date-specific notes with formatting and assignment reminders',
    },
    {
      icon: 'BellAlertIcon',
      title: 'Alert System',
      description:
        'Instant notifications when attendance drops below safe zone with recovery guidance',
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {features.map((feature, index) => (
        <div
          key={index}
          className="bg-card rounded-lg p-6 shadow-elevation-2 hover:shadow-elevation-3 transition-smooth"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name={feature.icon as any} size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoginFeatures;
