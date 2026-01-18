import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface Testimonial {
  name: string;
  role: string;
  image: string;
  alt: string;
  quote: string;
  rating: number;
}

interface LoginTestimonialsProps {
  className?: string;
}

const LoginTestimonials = ({ className = '' }: LoginTestimonialsProps) => {
  const testimonials: Testimonial[] = [
    {
      name: 'Rahul Sharma',
      role: 'B.Tech CSE, 3rd Year',
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1042ca7dc-1763296127922.png',
      alt: 'Young Indian male student with short black hair wearing blue shirt smiling at camera',
      quote:
        'AttendanceTracker saved my semester! The real-time alerts helped me maintain 75% attendance across all subjects.',
      rating: 5,
    },
    {
      name: 'Priya Patel',
      role: 'B.Tech ECE, 2nd Year',
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_10120f91e-1763301853398.png',
      alt: 'Young Indian female student with long dark hair in white top smiling confidently',
      quote:
        'The calendar view and notes feature make it so easy to track everything. I never miss important classes now!',
      rating: 5,
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Trusted by Students</h2>
        <p className="text-muted-foreground">
          Join thousands of B.Tech students managing their attendance effectively
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-card rounded-lg p-6 shadow-elevation-2">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                <AppImage
                  src={testimonial.image}
                  alt={testimonial.alt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>

            <div className="flex gap-1 mb-3">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Icon key={i} name="StarIcon" size={16} className="text-warning" variant="solid" />
              ))}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              &quot;{testimonial.quote}&quot;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoginTestimonials;
