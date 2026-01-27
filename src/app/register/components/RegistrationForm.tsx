'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  collegeName: string;
  semester: string;
  degreeProgram: string;
  graduationYear: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  collegeName?: string;
  semester?: string;
  degreeProgram?: string;
  graduationYear?: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

const RegistrationForm = () => {
  const router = useRouter();
  const { signUp } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    collegeName: '',
    semester: '',
    degreeProgram: '',
    graduationYear: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: '',
    color: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (formData.password) {
      calculatePasswordStrength(formData.password);
    } else {
      setPasswordStrength({ score: 0, label: '', color: '' });
    }
  }, [formData.password]);

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const strengthMap: Record<number, PasswordStrength> = {
      0: { score: 0, label: '', color: '' },
      1: { score: 1, label: 'Weak', color: 'bg-error' },
      2: { score: 2, label: 'Fair', color: 'bg-warning' },
      3: { score: 3, label: 'Good', color: 'bg-primary' },
      4: { score: 4, label: 'Strong', color: 'bg-success' },
      5: { score: 5, label: 'Very Strong', color: 'bg-success' },
    };

    setPasswordStrength(strengthMap[score] || strengthMap[0]);
  };

  const validateField = (name: keyof FormData, value: string): string => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 3) return 'Name must be at least 3 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      case 'collegeName':
        if (!value.trim()) return 'College name is required';
        return '';
      case 'semester':
        if (!value) return 'Please select your current semester';
        return '';
      case 'degreeProgram':
        if (!value.trim()) return 'Degree program is required';
        return '';
      case 'graduationYear':
        if (!value) return 'Please select expected graduation year';
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const error = validateField(name as keyof FormData, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const error = validateField(name as keyof FormData, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof FormData>).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      alert('Please accept the Terms of Service and Privacy Policy to continue');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Register the user with Supabase
      const profileData = {
        name: formData.fullName,
        collegeName: formData.collegeName,
        semester: formData.semester,
        degreeProgram: formData.degreeProgram,
        graduationYear: formData.graduationYear
      };
      
      const result = await signUp(formData.email, formData.password, profileData);
      const { error } = result;
      
      if (error) {
        alert(`Registration failed: ${error.message}`);
      } else if (result.needsConfirmation) {
        alert(result.message || 'Registration successful! Please check your email to confirm your account.');
        router.push('/login');
      } else {
        alert('Registration successful! Welcome to AttendanceTracker. Redirecting to semester configuration...');
        router.push('/semester-configuration');
      }
    } catch (err) {
      alert('An unexpected error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const semesterOptions = [
    { value: '1', label: '1st Semester' },
    { value: '2', label: '2nd Semester' },
    { value: '3', label: '3rd Semester' },
    { value: '4', label: '4th Semester' },
    { value: '5', label: '5th Semester' },
    { value: '6', label: '6th Semester' },
    { value: '7', label: '7th Semester' },
    { value: '8', label: '8th Semester' },
  ];

  const currentYear = 2026;
  const graduationYears = Array.from({ length: 6 }, (_, i) => currentYear + i);

  if (!isHydrated) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-card rounded-xl shadow-elevation-3 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-card rounded-xl shadow-elevation-3 p-8">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <Icon
              name="AcademicCapIcon"
              size={32}
              className="text-primary-foreground"
              variant="solid"
            />
          </div>
        </div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Create Your Account</h1>
        <p className="text-muted-foreground">
          Start tracking your attendance and stay on top of your academic goals
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
              Full Name <span className="text-error">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="UserIcon" size={20} className="text-muted-foreground" />
              </div>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-smooth ${
                  errors.fullName
                    ? 'border-error focus:ring-error'
                    : 'border-input focus:ring-primary'
                } focus:outline-none focus:ring-2 bg-background text-foreground`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.fullName && (
              <p className="mt-1 text-sm text-error flex items-center gap-1">
                <Icon name="ExclamationCircleIcon" size={16} />
                {errors.fullName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email Address <span className="text-error">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="EnvelopeIcon" size={20} className="text-muted-foreground" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-smooth ${
                  errors.email ? 'border-error focus:ring-error' : 'border-input focus:ring-primary'
                } focus:outline-none focus:ring-2 bg-background text-foreground`}
                placeholder="your.email@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-error flex items-center gap-1">
                <Icon name="ExclamationCircleIcon" size={16} />
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password <span className="text-error">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="LockClosedIcon" size={20} className="text-muted-foreground" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-smooth ${
                  errors.password
                    ? 'border-error focus:ring-error'
                    : 'border-input focus:ring-primary'
                } focus:outline-none focus:ring-2 bg-background text-foreground`}
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-smooth"
              >
                <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={20} />
              </button>
            </div>
            {formData.password && passwordStrength.label && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Password Strength:</span>
                  <span
                    className={`text-xs font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
            {errors.password && (
              <p className="mt-1 text-sm text-error flex items-center gap-1">
                <Icon name="ExclamationCircleIcon" size={16} />
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Confirm Password <span className="text-error">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="LockClosedIcon" size={20} className="text-muted-foreground" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-smooth ${
                  errors.confirmPassword
                    ? 'border-error focus:ring-error'
                    : formData.confirmPassword && !errors.confirmPassword
                      ? 'border-success focus:ring-success'
                      : 'border-input focus:ring-primary'
                } focus:outline-none focus:ring-2 bg-background text-foreground`}
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-smooth"
              >
                <Icon name={showConfirmPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={20} />
              </button>
            </div>
            {formData.confirmPassword && !errors.confirmPassword && (
              <p className="mt-1 text-sm text-success flex items-center gap-1">
                <Icon name="CheckCircleIcon" size={16} />
                Passwords match
              </p>
            )}
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-error flex items-center gap-1">
                <Icon name="ExclamationCircleIcon" size={16} />
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-border pt-6 space-y-4">
          <h3 className="text-lg font-medium text-foreground">Academic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="collegeName"
                className="block text-sm font-medium text-foreground mb-2"
              >
                College Name <span className="text-error">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="BuildingLibraryIcon" size={20} className="text-muted-foreground" />
                </div>
                <input
                  type="text"
                  id="collegeName"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-smooth ${
                    errors.collegeName
                      ? 'border-error focus:ring-error'
                      : 'border-input focus:ring-primary'
                  } focus:outline-none focus:ring-2 bg-background text-foreground`}
                  placeholder="Your college name"
                />
              </div>
              {errors.collegeName && (
                <p className="mt-1 text-sm text-error flex items-center gap-1">
                  <Icon name="ExclamationCircleIcon" size={16} />
                  {errors.collegeName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-foreground mb-2">
                Current Semester <span className="text-error">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="CalendarIcon" size={20} className="text-muted-foreground" />
                </div>
                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-smooth ${
                    errors.semester
                      ? 'border-error focus:ring-error'
                      : 'border-input focus:ring-primary'
                  } focus:outline-none focus:ring-2 bg-background text-foreground appearance-none cursor-pointer`}
                >
                  <option value="">Select semester</option>
                  {semesterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Icon name="ChevronDownIcon" size={20} className="text-muted-foreground" />
                </div>
              </div>
              {errors.semester && (
                <p className="mt-1 text-sm text-error flex items-center gap-1">
                  <Icon name="ExclamationCircleIcon" size={16} />
                  {errors.semester}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="degreeProgram"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Degree Program <span className="text-error">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="AcademicCapIcon" size={20} className="text-muted-foreground" />
                </div>
                <input
                  type="text"
                  id="degreeProgram"
                  name="degreeProgram"
                  value={formData.degreeProgram}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-smooth ${
                    errors.degreeProgram
                      ? 'border-error focus:ring-error'
                      : 'border-input focus:ring-primary'
                  } focus:outline-none focus:ring-2 bg-background text-foreground`}
                  placeholder="e.g., B.Tech Computer Science"
                />
              </div>
              {errors.degreeProgram && (
                <p className="mt-1 text-sm text-error flex items-center gap-1">
                  <Icon name="ExclamationCircleIcon" size={16} />
                  {errors.degreeProgram}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="graduationYear"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Expected Graduation <span className="text-error">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="CalendarDaysIcon" size={20} className="text-muted-foreground" />
                </div>
                <select
                  id="graduationYear"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-smooth ${
                    errors.graduationYear
                      ? 'border-error focus:ring-error'
                      : 'border-input focus:ring-primary'
                  } focus:outline-none focus:ring-2 bg-background text-foreground appearance-none cursor-pointer`}
                >
                  <option value="">Select year</option>
                  {graduationYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Icon name="ChevronDownIcon" size={20} className="text-muted-foreground" />
                </div>
              </div>
              {errors.graduationYear && (
                <p className="mt-1 text-sm text-error flex items-center gap-1">
                  <Icon name="ExclamationCircleIcon" size={16} />
                  {errors.graduationYear}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <div className="flex gap-3">
              <Icon name="ShieldCheckIcon" size={24} className="text-primary flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Your Data is Secure</h4>
                <p className="text-sm text-muted-foreground">
                  We use industry-standard encryption to protect your personal information. Your
                  attendance data is stored securely and never shared with third parties without
                  your explicit consent.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 mb-6">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
              I agree to the{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium transition-smooth hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <Icon name="UserPlusIcon" size={20} />
                Create Account
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegistrationForm;
