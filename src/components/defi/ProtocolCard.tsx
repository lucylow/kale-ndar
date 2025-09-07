import React from 'react';
import { ArrowUpRight, ExternalLink, Shield, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Protocol } from '@/services/defiService';

interface ProtocolCardProps {
  protocol: Protocol;
  onExplore: (protocolId: string) => Promise<void>;
  onViewAnalytics?: (protocolId: string) => void;
}

const ProtocolCard: React.FC<ProtocolCardProps> = ({ 
  protocol, 
  onExplore, 
  onViewAnalytics 
}) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DEX': return <TrendingUp className="w-4 h-4" />;
      case 'Lending': return <Shield className="w-4 h-4" />;
      case 'Yield': return <TrendingUp className="w-4 h-4" />;
      case 'CDP': return <Shield className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon(protocol.type)}
            <CardTitle className="text-lg">{protocol.name}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge variant="default">{protocol.type}</Badge>
            <Badge className={getRiskColor(protocol.riskLevel)}>
              {protocol.riskLevel} Risk
            </Badge>
          </div>
        </div>
        <CardDescription>{protocol.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Value Locked</span>
            <span className="font-medium">
              ${(protocol.tvl / 1000).toFixed(0)}K
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">APY</span>
            <span className="font-medium text-green-600">
              {protocol.apy}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <Badge 
              variant={protocol.status === 'active' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {protocol.status}
            </Badge>
          </div>
        </div>
        
        {/* Features */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Features</p>
          <div className="flex flex-wrap gap-2">
            {protocol.features.map((feature, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <EnhancedButton
            className="flex-1"
            variant="outline"
            onAsyncClick={() => onExplore(protocol.id)}
            successText={`Connected to ${protocol.name}`}
            errorText="Failed to connect to protocol"
          >
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Explore Protocol
          </EnhancedButton>
          
          {protocol.website && (
            <EnhancedButton
              variant="ghost"
              size="icon"
              onClick={() => window.open(protocol.website, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </EnhancedButton>
          )}
        </div>
        
        {onViewAnalytics && (
          <EnhancedButton
            className="w-full"
            variant="secondary"
            onClick={() => onViewAnalytics(protocol.id)}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            View Analytics
          </EnhancedButton>
        )}
      </CardContent>
    </Card>
  );
};

export default ProtocolCard;
