'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Subject {
  id: string;
  courseCode: string;
  name: string;
  weeklyClasses: number;
}

interface SubjectManagementProps {
  onSubjectsChange: (subjects: Subject[]) => void;
  initialSubjects?: Subject[];
}

const SubjectManagement = ({ onSubjectsChange, initialSubjects = [] }: SubjectManagementProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubject, setNewSubject] = useState<Omit<Subject, 'id'>>({
    courseCode: '',
    name: '',
    weeklyClasses: 3,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      onSubjectsChange(subjects);
    }
  }, [subjects, isHydrated, onSubjectsChange]);

  const handleAddSubject = () => {
    if (!newSubject.courseCode.trim() || !newSubject.name.trim()) {
      setError('Course code and name are required');
      return;
    }

    if (subjects.some((s) => s.courseCode === newSubject.courseCode)) {
      setError('Course code already exists');
      return;
    }

    const subject: Subject = {
      id: `subject-${Date.now()}`,
      ...newSubject,
    };

    setSubjects([...subjects, subject]);
    setNewSubject({ courseCode: '', name: '', weeklyClasses: 3 });
    setIsAddingSubject(false);
    setError('');
  };

  const handleRemoveSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  const handleUpdateWeeklyClasses = (id: string, value: number) => {
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, weeklyClasses: value } : s)));
  };

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-elevation-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Icon name="BookOpenIcon" size={20} className="text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Subject Management</h2>
            <p className="caption text-muted-foreground">Loading subjects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-elevation-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Icon name="BookOpenIcon" size={20} className="text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Subject Management</h2>
            <p className="caption text-muted-foreground">Add and manage your enrolled subjects</p>
          </div>
        </div>
        <button
          onClick={() => setIsAddingSubject(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth"
        >
          <Icon name="PlusIcon" size={20} />
          <span className="hidden sm:inline">Add Subject</span>
        </button>
      </div>

      {isAddingSubject && (
        <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
          <h3 className="text-sm font-medium text-foreground mb-4">Add New Subject</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Course Code</label>
              <input
                type="text"
                value={newSubject.courseCode}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, courseCode: e.target.value.toUpperCase() })
                }
                placeholder="CS101"
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Subject Name</label>
              <input
                type="text"
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                placeholder="Data Structures"
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Weekly Classes</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newSubject.weeklyClasses}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, weeklyClasses: parseInt(e.target.value) || 1 })
                }
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          {error && (
            <div className="mb-4 flex items-center gap-2 text-error text-sm">
              <Icon name="ExclamationCircleIcon" size={16} />
              <span>{error}</span>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleAddSubject}
              className="px-4 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-smooth"
            >
              Save Subject
            </button>
            <button
              onClick={() => {
                setIsAddingSubject(false);
                setError('');
                setNewSubject({ courseCode: '', name: '', weeklyClasses: 3 });
              }}
              className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-smooth"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="BookOpenIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No subjects added yet</p>
          <button
            onClick={() => setIsAddingSubject(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth"
          >
            Add Your First Subject
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border"
            >
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="caption text-muted-foreground mb-1">Course Code</p>
                  <p className="font-medium text-foreground data-text">{subject.courseCode}</p>
                </div>
                <div>
                  <p className="caption text-muted-foreground mb-1">Subject Name</p>
                  <p className="font-medium text-foreground">{subject.name}</p>
                </div>
                <div>
                  <p className="caption text-muted-foreground mb-1">Weekly Classes</p>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={subject.weeklyClasses}
                    onChange={(e) =>
                      handleUpdateWeeklyClasses(subject.id, parseInt(e.target.value) || 1)
                    }
                    className="w-20 px-2 py-1 bg-card border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <button
                onClick={() => handleRemoveSubject(subject.id)}
                className="p-2 text-error hover:bg-error/10 rounded-lg transition-smooth"
                title="Remove subject"
              >
                <Icon name="TrashIcon" size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {subjects.length > 0 && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-foreground">
            <span className="font-medium">Total Subjects:</span> {subjects.length} |
            <span className="font-medium ml-2">Total Weekly Classes:</span>{' '}
            {subjects.reduce((sum, s) => sum + s.weeklyClasses, 0)}
          </p>
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;
