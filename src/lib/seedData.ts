/**
 * Seed data for CSE 6th Semester B.Tech
 * Based on actual timetable for B.Tech 6th Semester CSE
 */

export interface Subject {
  id: string;
  courseCode: string;
  name: string;
  weeklyClasses: number;
  type: 'theory' | 'lab';
}

export interface SchedulePeriod {
  periodNumber: number;
  startTime: string;
  endTime: string;
  subjectId: string;
  classroom: string;
  dayOfWeek: string;
  isLab?: boolean;
}

export interface WeeklySchedule {
  [key: string]: SchedulePeriod[];
}

// CSE 6th Semester Subjects based on the timetable
export const cse6thSemesterSubjects: Subject[] = [
  {
    id: 'IT930',
    courseCode: 'IT930',
    name: 'Data Mining & Warehousing',
    weeklyClasses: 5,
    type: 'theory',
  },
  {
    id: 'IT322',
    courseCode: 'IT322',
    name: 'AIML',
    weeklyClasses: 5,
    type: 'theory',
  },
  {
    id: 'IT321',
    courseCode: 'IT321',
    name: 'FLAT',
    weeklyClasses: 5,
    type: 'theory',
  },
  {
    id: 'IT920',
    courseCode: 'IT920',
    name: 'HCI',
    weeklyClasses: 5,
    type: 'theory',
  },
  {
    id: 'HS321',
    courseCode: 'HS321/HS322',
    name: 'French/Russian',
    weeklyClasses: 3,
    type: 'theory',
  },
  {
    id: 'IT930-LAB',
    courseCode: 'IT930 Lab',
    name: 'Data Mining & W. Lab',
    weeklyClasses: 2,
    type: 'lab',
  },
  {
    id: 'IT322-LAB',
    courseCode: 'IT322 Lab',
    name: 'AIML Lab',
    weeklyClasses: 2,
    type: 'lab',
  },
  {
    id: 'IT321-LAB',
    courseCode: 'IT321 Lab',
    name: 'FLAT Lab',
    weeklyClasses: 2,
    type: 'lab',
  },
  {
    id: 'IT920-LAB',
    courseCode: 'IT920 Lab',
    name: 'HCI Lab',
    weeklyClasses: 2,
    type: 'lab',
  },
];

// Weekly Schedule for CSE 6th Semester based on the timetable
export const cse6thSemesterSchedule: WeeklySchedule = {
  Monday: [
    {
      periodNumber: 1,
      startTime: '09:00',
      endTime: '10:00',
      subjectId: 'IT930',
      classroom: 'Class Room III (IT Dept)',
      dayOfWeek: 'Monday',
    },
    {
      periodNumber: 2,
      startTime: '11:00',
      endTime: '12:00',
      subjectId: 'IT322',
      classroom: 'Class Room III (IT Dept)',
      dayOfWeek: 'Monday',
    },
    {
      periodNumber: 3,
      startTime: '12:00',
      endTime: '13:00',
      subjectId: 'IT321',
      classroom: 'Class Room III (IT Dept)',
      dayOfWeek: 'Monday',
    },
    {
      periodNumber: 4,
      startTime: '14:00',
      endTime: '15:00',
      subjectId: 'HS321',
      classroom: 'Gallery 1 / 2 (GUIST)',
      dayOfWeek: 'Monday',
    },
  ],
  Tuesday: [
    {
      periodNumber: 1,
      startTime: '09:00',
      endTime: '10:00',
      subjectId: 'IT930',
      classroom: 'Class Room III (IT Dept)',
      dayOfWeek: 'Tuesday',
    },
    {
      periodNumber: 2,
      startTime: '11:00',
      endTime: '12:00',
      subjectId: 'IT322',
      classroom: 'Class Room III (IT Dept)',
      dayOfWeek: 'Tuesday',
    },
    {
      periodNumber: 3,
      startTime: '12:00',
      endTime: '13:00',
      subjectId: 'IT321',
      classroom: 'Class Room III (IT Dept)',
      dayOfWeek: 'Tuesday',
    },
    {
      periodNumber: 4,
      startTime: '14:00',
      endTime: '15:00',
      subjectId: 'IT920',
      classroom: 'Class Room III (IT Dept)',
      dayOfWeek: 'Tuesday',
    },
    {
      periodNumber: 5,
      startTime: '16:00',
      endTime: '17:00',
      subjectId: 'HS321',
      classroom: 'Gallery 1 / 2 (GUIST)',
      dayOfWeek: 'Tuesday',
    },
  ],
  Wednesday: [
    {
      periodNumber: 1,
      startTime: '09:00',
      endTime: '10:00',
      subjectId: 'IT930',
      classroom: 'Class Room III (IT Dept)',
      dayOfWeek: 'Wednesday',
    },
    {
      periodNumber: 2,
      startTime: '11:00',
      endTime: '13:00',
      subjectId: 'IT321-LAB',
      classroom: 'Lab 1 (IT Dept)',
      dayOfWeek: 'Wednesday',
      isLab: true,
    },
    {
      periodNumber: 3,
      startTime: '14:00',
      endTime: '16:00',
      subjectId: 'IT920-LAB',
      classroom: 'Lab 2 (IT Dept)',
      dayOfWeek: 'Wednesday',
      isLab: true,
    },
  ],
  Thursday: [
    {
      periodNumber: 1,
      startTime: '10:00',
      endTime: '11:00',
      subjectId: 'IT920',
      classroom: 'Class Room III (IT Dept)',
      dayOfWeek: 'Thursday',
    },
    {
      periodNumber: 2,
      startTime: '11:00',
      endTime: '13:00',
      subjectId: 'IT322-LAB',
      classroom: 'Lab 2 (IT Dept)',
      dayOfWeek: 'Thursday',
      isLab: true,
    },
    {
      periodNumber: 3,
      startTime: '15:00',
      endTime: '16:00',
      subjectId: 'HS321',
      classroom: 'Gallery 1 / 2 (GUIST)',
      dayOfWeek: 'Thursday',
    },
  ],
  Friday: [
    {
      periodNumber: 1,
      startTime: '11:00',
      endTime: '12:00',
      subjectId: 'IT322',
      classroom: 'Class Room III (IT Dept)',
      dayOfWeek: 'Friday',
    },
    {
      periodNumber: 2,
      startTime: '12:00',
      endTime: '13:00',
      subjectId: 'IT321',
      classroom: 'Class Room III (IT Dept)',
      dayOfWeek: 'Friday',
    },
    {
      periodNumber: 3,
      startTime: '14:00',
      endTime: '15:00',
      subjectId: 'IT920',
      classroom: 'Class Room III (IT Dept)',
      dayOfWeek: 'Friday',
    },
    {
      periodNumber: 4,
      startTime: '15:00',
      endTime: '17:00',
      subjectId: 'IT930-LAB',
      classroom: 'Lab 2 (IT Dept)',
      dayOfWeek: 'Friday',
      isLab: true,
    },
  ],
};

// Default semester configuration for CSE 6th semester
export const getDefaultCSE6thSemesterConfig = () => {
  return {
    startDate: '2026-01-15',
    endDate: '2026-05-30',
    academicYear: '2025-2026',
    semesterType: 'even' as const,
    subjects: cse6thSemesterSubjects,
    schedule: cse6thSemesterSchedule,
  };
};
