import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { Wallet, User, TrendingUp, DollarSign } from 'lucide-react';

const MockDataDemo: React.FC = () => {
  const { wallet, user, userStats, availableWallets, currentWalletType } = useWallet();
  const isDevelopment = import.meta.env.DEV;

  if (!isDevelopment) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Mock Wallet Data Demo
          </CardTitle>
          <CardDescription>
            This component shows the mock data available in development mode
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Available Wallets:</h4>
            <div className="flex flex-wrap gap-2">
              {availableWallets.map((wallet) => (
                <Badge 
                  key={wallet.name} 
                  variant={wallet.isAvailable ? "default" : "secondary"}
                  className="flex items-center gap-1"
                >
                  <span>{wallet.icon}</span>
                  {wallet.name}
                  {wallet.isAvailable ? " ✓" : " ✗"}
                </Badge>
              ))}
            </div>
          </div>

          {wallet.isConnected && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Current Connection:</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {currentWalletType} Wallet
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {wallet.publicKey?.slice(0, 8)}...{wallet.publicKey?.slice(-8)}
                  </span>
                </div>
              </div>

              {user && (
                <div>
                  <h4 className="font-semibold mb-2">User Profile:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Username:</span>
                      <p className="font-medium">{user.username || 'Not set'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium">{user.email || 'Not set'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Bets:</span>
                      <p className="font-medium">{user.total_bets}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Winnings:</span>
                      <p className="font-medium">${user.total_winnings}</p>
                    </div>
                  </div>
                </div>
              )}

              {userStats && (
                <div>
                  <h4 className="font-semibold mb-2">User Statistics:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-muted-foreground">Win Rate:</span>
                      <span className="font-medium">{userStats.win_rate}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-500" />
                      <span className="text-muted-foreground">Total Bet Amount:</span>
                      <span className="font-medium">${userStats.total_bet_amount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Wins:</span>
                      <p className="font-medium text-green-600">{userStats.wins}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Losses:</span>
                      <p className="font-medium text-red-600">{userStats.losses}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MockDataDemo;
