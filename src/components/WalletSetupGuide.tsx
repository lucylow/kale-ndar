import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Download, Shield, CheckCircle } from 'lucide-react';

const WalletSetupGuide: React.FC = () => {
  const wallets = [
    {
      name: 'Freighter',
      icon: '🦋',
      url: 'https://freighter.app/',
      description: 'Official Stellar Development Foundation wallet',
      features: ['Web Extension', 'Most Popular', 'Beginner Friendly'],
      recommended: true
    },
    {
      name: 'Lobstr',
      icon: '🦞',
      url: 'https://lobstr.co/',
      description: 'User-friendly mobile and web wallet',
      features: ['Mobile App', 'Web Wallet', 'Easy to Use']
    },
    {
      name: 'Rabet',
      icon: '🐰',
      url: 'https://rabet.io/',
      description: 'Open-source wallet with advanced features',
      features: ['Open Source', 'Advanced Features', 'Web Extension']
    },
    {
      name: 'Albedo',
      icon: '⭐',
      url: 'https://albedo.link/',
      description: 'Web-based wallet for Stellar transactions',
      features: ['No Installation', 'Web-based', 'Quick Access']
    }
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Connect Your Stellar Wallet
        </CardTitle>
        <CardDescription>
          To use KALE-ndar prediction markets, you'll need a Stellar wallet. Choose one below to get started.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wallets.map((wallet) => (
            <div
              key={wallet.name}
              className={`relative p-4 border rounded-lg hover:bg-accent/50 transition-all ${
                wallet.recommended ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              {wallet.recommended && (
                <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
                  Recommended
                </Badge>
              )}
              
              <div className="flex items-start gap-3">
                <div className="text-2xl">{wallet.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    {wallet.name}
                    {wallet.recommended && <CheckCircle className="h-4 w-4 text-primary" />}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">{wallet.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {wallet.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button
                    variant={wallet.recommended ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(wallet.url, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Install {wallet.name}
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-muted rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Next Steps:
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Install your chosen Stellar wallet</li>
            <li>Set up your wallet and create/import an account</li>
            <li>Make sure you have some XLM for transaction fees</li>
            <li>Refresh this page and click "Connect Wallet"</li>
          </ol>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Check out the{' '}
            <a 
              href="https://developers.stellar.org/docs/wallets" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Stellar Wallet Documentation
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletSetupGuide;