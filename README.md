# attendance-tracker

An open-source full-stack web application built with TypeScript and Tailwind CSS, that helps students track semester-wise attendance, calculate real-time eligibility, and visualize subject-level safe and danger zones.

## 🚀 Features

- **Next.js 15** - Latest version with improved performance and features
- **React 19** - Latest React version with enhanced capabilities
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development

## 🛠️ Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Start the development server:

```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:4028](http://localhost:4028) with your browser to see the result.

## 📁 Project Structure

```
nextjs/
├─ public
│  ├─ assets
│  │  └─ images
│  │     └─ no_image.png
│  └─ favicon.ico
├─ src
│  ├─ app
│  │  ├─ calendar-dashboard
│  │  │  ├─ components
│  │  │  │  ├─ CalendarDashboardInteractive.tsx
│  │  │  │  ├─ MonthCalendar.tsx
│  │  │  │  ├─ SemesterInfoPanel.tsx
│  │  │  │  └─ YearNavigator.tsx
│  │  │  └─ page.tsx
│  │  ├─ daily-attendance
│  │  │  ├─ components
│  │  │  │  ├─ DailyAttendanceInteractive.tsx
│  │  │  │  ├─ DailyScheduleTimeline.tsx
│  │  │  │  ├─ DailyStatisticsSummary.tsx
│  │  │  │  ├─ DateNavigator.tsx
│  │  │  │  └─ DateNotesEditor.tsx
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ login
│  │  │  ├─ components
│  │  │  │  ├─ LoginFeatures.tsx
│  │  │  │  ├─ LoginForm.tsx
│  │  │  │  └─ LoginTestimonials.tsx
│  │  │  └─ page.tsx
│  │  ├─ not-found.tsx
│  │  ├─ providers.tsx
│  │  ├─ register
│  │  │  ├─ components
│  │  │  │  ├─ RegistrationBenefits.tsx
│  │  │  │  └─ RegistrationForm.tsx
│  │  │  └─ page.tsx
│  │  ├─ semester-configuration
│  │  │  ├─ components
│  │  │  │  ├─ AcademicYearSelector.tsx
│  │  │  │  ├─ ConfigurationPreview.tsx
│  │  │  │  ├─ DailyScheduleConfig.tsx
│  │  │  │  ├─ SemesterConfigurationInteractive.tsx
│  │  │  │  ├─ SemesterDateRangeConfig.tsx
│  │  │  │  └─ SubjectManagement.tsx
│  │  │  └─ page.tsx
│  │  └─ semester-statistics
│  │     ├─ components
│  │     │  ├─ AttendanceTrendChart.tsx
│  │     │  ├─ ExportButton.tsx
│  │     │  ├─ FilterControls.tsx
│  │     │  ├─ SemesterStatisticsInteractive.tsx
│  │     │  ├─ StatisticsHeader.tsx
│  │     │  └─ SubjectCard.tsx
│  │     └─ page.tsx
│  ├─ components
│  │  ├─ QuickStatusIndicator.module.css
│  │  ├─ QuickStatusIndicator.tsx
│  │  ├─ auth
│  │  │  └─ ProtectedRoute.tsx
│  │  ├─ common
│  │  │  ├─ DateContextIndicator.tsx
│  │  │  ├─ Header.tsx
│  │  │  └─ QuickStatusIndicator.tsx
│  │  └─ ui
│  │     ├─ AppIcon.tsx
│  │     ├─ AppImage.tsx
│  │     ├─ DatabaseSetupNotification.tsx
│  │     └─ ErrorBoundary.tsx
│  ├─ contexts
│  │  └─ AuthContext.tsx
│  ├─ lib
│  │  ├─ attendanceService.ts
│  │  ├─ databaseSetup.ts
│  │  ├─ semesterConfig.ts
│  │  ├─ supabase.ts
│  │  └─ supabase.tsx
│  └─ styles
│     ├─ index.css
│     └─ tailwind.css
├─ supabase-schema.sql
├─ tailwind.config.js
└─ tsconfig.json
├─ .env
├─ .eslintrc.json
├─ .gitignore
├─ .prettierignore
├─ .prettierrc
├─ DATABASE_SETUP.md
├─ README.md
├─ next-env.d.ts
├─ next.config.mjs
├─ package.json
├─ postcss.config.js

```

## 🧩 Page Editing

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## 🎨 Styling

This project uses Tailwind CSS for styling with the following features:

- Utility-first approach for rapid development
- Custom theme configuration
- Responsive design utilities
- PostCSS and Autoprefixer integration

## 📦 Available Scripts

- `npm run dev` - Start development server on port 4028
- `npm run build` - Build the application for production
- `npm run start` - Start the development server
- `npm run serve` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier

## 📱 Deployment

Build the application for production:

```bash
npm run build
```

## 📚 Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial

You can check out the [Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 🙏 Acknowledgments

- Powered by Next.js and React
- Styled with Tailwind CSS

Built with ❤️
