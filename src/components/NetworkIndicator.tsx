import React from 'react';
import { Badge } from '@/components/ui/badge';
import { config } from '@/lib/config';
import { Wifi } from 'lucide-react';

const NetworkIndicator: React.FC = () => {
  const isTestnet = config.soroban.networkPassphrase.includes('Test');
  
  return (
    <Badge 
      variant={isTestnet ? "destructive" : "default"}
      className="flex items-center gap-1 text-xs"
    >
      <Wifi className="w-3 h-3" />
      {isTestnet ? 'Testnet' : 'Mainnet'}
    </Badge>
  );
};

export default NetworkIndicator;