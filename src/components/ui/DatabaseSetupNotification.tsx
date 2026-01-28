'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';

export const DatabaseSetupNotification = () => {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Check if database setup is required
    const dbSetupRequired = localStorage.getItem('db_setup_required');
    if (dbSetupRequired === 'true') {
      setShowNotification(true);
    }
  }, []);

  const handleDismiss = () => {
    setShowNotification(false);
    // Note: We're not removing the flag from localStorage
    // so the notification will appear again if needed
  };

  if (!showNotification) {
    return null;
  }

  return (
    <div className="mb-4 border border-amber-200 bg-amber-50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-amber-800 font-semibold mb-2">Database Setup Required</h3>
          <div className="text-amber-700 text-sm">
            <p className="mb-2">The required database tables are missing. To fix this issue:</p>
            <ol className="list-decimal list-inside mb-3 space-y-1">
              <li>Navigate to your Supabase project dashboard</li>
              <li>Go to the SQL Editor tab</li>
              <li>Copy and execute the contents of &apos;supabase-schema.sql&apos; file</li>
            </ol>
            <div className="flex gap-2">
              <button
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-amber-700 border border-amber-300 rounded-md hover:bg-amber-100 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Open Supabase
              </button>
              <button
                onClick={handleDismiss}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-amber-700 border border-amber-300 rounded-md hover:bg-amber-100 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
