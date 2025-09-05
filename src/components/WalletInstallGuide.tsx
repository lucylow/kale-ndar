import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Download, Shield, Zap, Globe } from 'lucide-react';

const WalletInstallGuide: React.FC = () => {
  const wallets = [
    {
      name: 'Freighter',
      description: 'The most popular Stellar wallet',
      icon: '🦎',
      features: ['Easy to use', 'Secure', 'Browser extension'],
      installUrl: 'https://freighter.app',
      rating: 4.8,
      users: '100K+',
      color: 'from-blue-500 to-purple-600'
    },
    {
      name: 'Lobstr',
      description: 'Mobile-first Stellar wallet',
      icon: '📱',
      features: ['Mobile app', 'User-friendly', 'Multi-platform'],
      installUrl: 'https://lobstr.co',
      rating: 4.6,
      users: '50K+',
      color: 'from-green-500 to-teal-600'
    },
    {
      name: 'Rabet',
      description: 'Open source Stellar wallet',
      icon: '🐰',
      features: ['Open source', 'Privacy-focused', 'Lightweight'],
      installUrl: 'https://rabet.io',
      rating: 4.5,
      users: '25K+',
      color: 'from-orange-500 to-red-600'
    },
    {
      name: 'Albedo',
      description: 'Web-based Stellar wallet',
      icon: '🌅',
      features: ['Web-based', 'No installation', 'Quick access'],
      installUrl: 'https://albedo.link',
      rating: 4.4,
      users: '15K+',
      color: 'from-yellow-500 to-orange-600'
    }
  ];

  const handleInstall = (walletName: string, installUrl: string) => {
    window.open(installUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Choose Your Stellar Wallet</h3>
        <p className="text-sm text-muted-foreground">
          Connect your wallet to start predicting on KALE-ndar markets
        </p>
      </div>

      {/* Wallet Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {wallets.map((wallet) => (
          <Card key={wallet.name} className="group hover:shadow-lg transition-all duration-300 border-white/10 bg-gradient-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{wallet.icon}</div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {wallet.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {wallet.description}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {wallet.rating} ⭐
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Features */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Features:</h4>
                <div className="flex flex-wrap gap-1">
                  {wallet.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{wallet.users} users</span>
                <span>Highly rated</span>
              </div>

              {/* Install Button */}
              <Button 
                onClick={() => handleInstall(wallet.name, wallet.installUrl)}
                className="w-full group-hover:scale-105 transition-transform"
                variant="hero"
              >
                <Download className="h-4 w-4 mr-2" />
                Install {wallet.name}
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits Section */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent-teal/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Why Connect Your Wallet?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Instant Access</h4>
                <p className="text-xs text-muted-foreground">
                  Start predicting immediately after connection
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent-teal/20 rounded-lg">
                <Shield className="h-4 w-4 text-accent-teal" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Secure</h4>
                <p className="text-xs text-muted-foreground">
                  Your keys stay in your wallet, never shared
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent-gold/20 rounded-lg">
                <Globe className="h-4 w-4 text-accent-gold" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Global Markets</h4>
                <p className="text-xs text-muted-foreground">
                  Access prediction markets worldwide
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Need help choosing a wallet?
        </p>
        <Button variant="outline" size="sm" className="gap-2">
          <ExternalLink className="h-4 w-4" />
          View Wallet Comparison
        </Button>
      </div>
    </div>
  );
};

export default WalletInstallGuide;