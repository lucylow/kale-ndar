import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Code, Database } from 'lucide-react';

const DevModeIndicator: React.FC = () => {
  const isDevelopment = import.meta.env.DEV;
  
  if (!isDevelopment) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <Badge variant="secondary" className="flex items-center gap-1">
        <Code className="h-3 w-3" />
        Dev Mode
      </Badge>
      <Badge variant="outline" className="flex items-center gap-1">
        <Database className="h-3 w-3" />
        Mock Data
      </Badge>
    </div>
  );
};

export default DevModeIndicator;
