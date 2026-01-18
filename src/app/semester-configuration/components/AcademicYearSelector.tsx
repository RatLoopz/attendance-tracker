'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface AcademicYearSelectorProps {
  onYearChange: (year: string, semesterType: string) => void;
  initialYear?: string;
  initialSemesterType?: string;
}

const AcademicYearSelector = ({
  onYearChange,
  initialYear = '',
  initialSemesterType = 'odd',
}: AcademicYearSelectorProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [academicYear, setAcademicYear] = useState(initialYear);
  const [semesterType, setSemesterType] = useState(initialSemesterType);

  // Track if the component has been initialized to prevent calling onYearChange on mount
  const isInitializedRef = useRef(false);
  const previousAcademicYearRef = useRef(academicYear);
  const previousSemesterTypeRef = useRef(semesterType);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Skip on first render or when values haven't actually changed
    if (!isHydrated) return;

    const hasYearChanged = academicYear !== previousAcademicYearRef.current;
    const hasTypeChanged = semesterType !== previousSemesterTypeRef.current;

    // Only call parent callback if values have changed after initialization
    if (
      isInitializedRef.current &&
      (hasYearChanged || hasTypeChanged) &&
      academicYear &&
      semesterType
    ) {
      onYearChange(academicYear, semesterType);
    } else if (!isInitializedRef.current && academicYear && semesterType) {
      // Mark as initialized without calling parent callback
      isInitializedRef.current = true;
    }

    // Update refs
    previousAcademicYearRef.current = academicYear;
    previousSemesterTypeRef.current = semesterType;
  }, [academicYear, semesterType, isHydrated]);

  const generateAcademicYears = () => {
    const currentYear = 2026;
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
      years.push(`${i}-${i + 1}`);
    }
    return years;
  };

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-elevation-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
            <Icon name="AcademicCapIcon" size={20} className="text-secondary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Academic Year</h2>
            <p className="caption text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-elevation-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
          <Icon name="AcademicCapIcon" size={20} className="text-secondary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Academic Year</h2>
          <p className="caption text-muted-foreground">
            Select your current academic year and semester type
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="academicYear" className="block text-sm font-medium text-foreground mb-2">
            Academic Year
          </label>
          <div className="relative">
            <select
              id="academicYear"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-smooth appearance-none"
              required
            >
              <option value="">Select Academic Year</option>
              {generateAcademicYears().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <Icon
              name="ChevronDownIcon"
              size={20}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Semester Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSemesterType('odd')}
              className={`
                px-4 py-3 rounded-lg border transition-smooth font-medium
                ${
                  semesterType === 'odd'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-input hover:border-primary'
                }
              `}
            >
              Odd Semester
            </button>
            <button
              type="button"
              onClick={() => setSemesterType('even')}
              className={`
                px-4 py-3 rounded-lg border transition-smooth font-medium
                ${
                  semesterType === 'even'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-input hover:border-primary'
                }
              `}
            >
              Even Semester
            </button>
          </div>
        </div>
      </div>

      {academicYear && semesterType && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-foreground">
            <span className="font-medium">Selected:</span> {academicYear} -{' '}
            {semesterType.charAt(0).toUpperCase() + semesterType.slice(1)} Semester
          </p>
        </div>
      )}
    </div>
  );
};

export default AcademicYearSelector;
