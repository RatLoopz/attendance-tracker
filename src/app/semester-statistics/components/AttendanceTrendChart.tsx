'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Icon from '@/components/ui/AppIcon';

interface TrendDataPoint {
  week: string;
  percentage: number;
  attended: number;
  total: number;
}

interface AttendanceTrendChartProps {
  data: TrendDataPoint[];
}

const AttendanceTrendChart = ({ data }: AttendanceTrendChartProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-lg shadow-elevation-2 p-6">
        <div className="h-80 animate-pulse bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-elevation-2 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Attendance Trend</h3>
          <p className="caption text-muted-foreground">
            Weekly attendance percentage over the semester
          </p>
        </div>
        <Icon name="ChartBarIcon" size={24} className="text-primary" />
      </div>

      <div className="w-full h-80" aria-label="Attendance Trend Line Chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
            <XAxis
              dataKey="week"
              stroke="hsl(var(--color-muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="hsl(var(--color-muted-foreground))"
              style={{ fontSize: '12px' }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--color-popover))',
                border: '1px solid hsl(var(--color-border))',
                borderRadius: '8px',
                color: 'hsl(var(--color-popover-foreground))',
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px',
              }}
            />
            <Line
              type="monotone"
              dataKey="percentage"
              stroke="hsl(var(--color-primary))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--color-primary))', r: 4 }}
              activeDot={{ r: 6 }}
              name="Attendance %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="caption text-muted-foreground mb-1">Highest</div>
          <div className="data-text text-xl font-semibold text-success">
            {Math.max(...data.map((d) => d.percentage)).toFixed(1)}%
          </div>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="caption text-muted-foreground mb-1">Average</div>
          <div className="data-text text-xl font-semibold text-primary">
            {(data.reduce((sum, d) => sum + d.percentage, 0) / data.length).toFixed(1)}%
          </div>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="caption text-muted-foreground mb-1">Lowest</div>
          <div className="data-text text-xl font-semibold text-error">
            {Math.min(...data.map((d) => d.percentage)).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTrendChart;
