'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ExportButtonProps {
  onExport: () => void;
}

const ExportButton = ({ onExport }: ExportButtonProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <button className="px-4 py-2 bg-muted rounded-lg animate-pulse" disabled>
        <div className="w-24 h-5 bg-muted-foreground/20 rounded" />
      </button>
    );
  }

  const handleExport = () => {
    setIsExporting(true);
    onExport();
    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Icon
        name={isExporting ? 'ArrowPathIcon' : 'ArrowDownTrayIcon'}
        size={20}
        className={isExporting ? 'animate-spin' : ''}
      />
      <span className="caption font-medium">{isExporting ? 'Exporting...' : 'Export Report'}</span>
    </button>
  );
};

export default ExportButton;
