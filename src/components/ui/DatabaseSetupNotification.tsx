import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
    <Alert className="mb-4 border-amber-200 bg-amber-50">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Database Setup Required</AlertTitle>
      <AlertDescription className="text-amber-700">
        <p className="mb-2">
          The required database tables are missing. To fix this issue:
        </p>
        <ol className="list-decimal list-inside mb-3 space-y-1 text-sm">
          <li>Navigate to your Supabase project dashboard</li>
          <li>Go to the SQL Editor tab</li>
          <li>Copy and execute the contents of 'supabase-schema.sql' file</li>
        </ol>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
            className="text-amber-700 border-amber-300 hover:bg-amber-100"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Open Supabase
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="text-amber-700 border-amber-300 hover:bg-amber-100"
          >
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
