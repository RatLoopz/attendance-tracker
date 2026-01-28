'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FilterState {
  subject: string;
  status: string;
  sortBy: string;
}

interface FilterControlsProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  subjects: Array<{ id: string; name: string; code: string }>;
}

const FilterControls = ({ filters, onFilterChange, subjects }: FilterControlsProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-lg shadow-elevation-2 p-4">
        <div className="h-12 animate-pulse bg-muted rounded" />
      </div>
    );
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFilterChange({
      subject: 'all',
      status: 'all',
      sortBy: 'percentage',
    });
  };

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== 'all' && v !== 'percentage'
  ).length;

  return (
    <div className="bg-card rounded-lg shadow-elevation-2 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="FunnelIcon" size={20} className="text-primary" />
            <h3 className="font-semibold text-foreground">Filters</h3>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-1 bg-primary text-primary-foreground rounded-full caption font-medium">
                {activeFiltersCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="caption text-primary hover:text-primary/80 transition-smooth"
              >
                Reset
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-smooth"
            >
              <Icon name={isExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={20} />
            </button>
          </div>
        </div>

        <div className={`${isExpanded ? 'block' : 'hidden'} lg:block mt-4`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="caption text-muted-foreground mb-2 block">Subject</label>
              <select
                value={filters.subject}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
              >
                <option value="all">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="caption text-muted-foreground mb-2 block">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
              >
                <option value="all">All Status</option>
                <option value="safe">Safe Zone (≥75%)</option>
                <option value="warning">Caution (70-74%)</option>
                <option value="danger">Danger Zone (&lt;70%)</option>
              </select>
            </div>

            <div>
              <label className="caption text-muted-foreground mb-2 block">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
              >
                <option value="percentage">Attendance %</option>
                <option value="name">Subject Name</option>
                <option value="attended">Classes Attended</option>
                <option value="missed">Classes Missed</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
