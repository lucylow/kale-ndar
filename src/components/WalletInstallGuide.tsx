import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download } from 'lucide-react';

const WalletInstallGuide: React.FC = () => {
  const wallets = [
    {
      name: 'Freighter',
      icon: '🦋',
      description: 'Official Stellar Development Foundation wallet',
      url: 'https://freighter.app',
      type: 'Browser Extension'
    },
    {
      name: 'Lobstr',
      icon: '🦞',
      description: 'User-friendly mobile and web wallet',
      url: 'https://lobstr.co',
      type: 'Mobile & Web'
    },
    {
      name: 'Rabet',
      icon: '🐰',
      description: 'Open-source Stellar wallet with advanced features',
      url: 'https://rabet.app',
      type: 'Browser Extension'
    },
    {
      name: 'Albedo',
      icon: '🌅',
      description: 'Web-based wallet for Stellar transactions',
      url: 'https://albedo.link',
      type: 'Web App'
    }
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Install a Stellar Wallet
        </CardTitle>
        <CardDescription>
          To use KALE-ndar, you need a Stellar wallet. Choose from these popular options:
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wallets.map((wallet) => (
            <Card key={wallet.name} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{wallet.icon}</span>
                  <div>
                    <h3 className="font-semibold">{wallet.name}</h3>
                    <p className="text-sm text-muted-foreground">{wallet.description}</p>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 inline-block">
                      {wallet.type}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(wallet.url, '_blank')}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Install
                </Button>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">How to get started:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Install one of the wallets above</li>
            <li>2. Create a new wallet or import an existing one</li>
            <li>3. Fund your wallet with XLM (Stellar Lumens)</li>
            <li>4. Refresh this page and connect your wallet</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletInstallGuide;
