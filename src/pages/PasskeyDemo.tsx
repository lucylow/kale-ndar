import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useWallet } from '@/contexts/WalletContext';
import { useNavigate } from 'react-router-dom';
import PasskeyWalletConnector from '@/components/PasskeyWalletConnector';
import PasskeyTest from '@/components/PasskeyTest';
import PasskeyButtonGuide from '@/components/PasskeyButtonGuide';
import { 
  Shield, 
  Fingerprint, 
  Lock, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Key,
  Smartphone,
  Laptop,
  TrendingUp,
  DollarSign,
  Clock,
  ArrowLeft,
  Home
} from 'lucide-react';

const PasskeyDemo: React.FC = () => {
  const { wallet, user, userStats, currentWalletType } = useWallet();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'benefits' | 'testing' | 'guide'>('overview');

  const isPasskeyConnected = wallet.isConnected && currentWalletType === 'passkey';

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Shield className="h-10 w-10 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Passkey Wallet Integration</h2>
          <p className="text-muted-foreground mt-2">
            Experience the future of secure wallet authentication with biometric technology
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-primary" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">1</div>
              <div>
                <div className="font-medium">Device Registration</div>
                <div className="text-sm text-muted-foreground">Register your device's biometric authentication</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">2</div>
              <div>
                <div className="font-medium">Secure Key Generation</div>
                <div className="text-sm text-muted-foreground">Generate cryptographic keys tied to your biometrics</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">3</div>
              <div>
                <div className="font-medium">Transaction Signing</div>
                <div className="text-sm text-muted-foreground">Sign transactions with your biometric authentication</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-accent-teal" />
              Security Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Phishing-resistant authentication</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">No passwords to remember</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Device-bound security</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">WebAuthn standard compliance</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center space-y-4">
        <PasskeyWalletConnector />
        
        {/* Additional Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Go to Dashboard
          </Button>
          <Button 
            onClick={() => navigate('/markets')}
            variant="outline"
            className="gap-2"
          >
            <DollarSign className="h-4 w-4" />
            View Markets
          </Button>
          <Button 
            onClick={() => navigate('/portfolio')}
            variant="outline"
            className="gap-2"
          >
            <Shield className="h-4 w-4" />
            Check Portfolio
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Security Comparison</h2>
        <p className="text-muted-foreground">
          See how passkey authentication compares to traditional methods
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-yellow-500" />
              Traditional Wallet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Password-based</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Phishing vulnerable</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Seed phrase risk</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Manual backup needed</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-blue-500/20 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Passkey Wallet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Biometric authentication</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Phishing-resistant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Device-bound keys</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Automatic backup</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-500" />
              Hardware Wallet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Offline storage</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Requires device</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Complex setup</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Maximum security</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Actions */}
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Security Actions</h3>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => navigate('/settings')}
            variant="outline"
            className="gap-2"
          >
            <Lock className="h-4 w-4" />
            Security Settings
          </Button>
          <Button 
            onClick={() => setActiveTab('testing')}
            variant="outline"
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Run Security Tests
          </Button>
        </div>
      </div>
    </div>
  );

  const renderBenefits = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Passkey Benefits</h2>
        <p className="text-muted-foreground">
          Discover the advantages of using passkey authentication
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent-gold" />
              Staking Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-gold">+15%</div>
              <div className="text-sm text-muted-foreground">Bonus staking rewards</div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Standard Rate</span>
                <span className="text-sm font-medium">5% APY</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Passkey Bonus</span>
                <span className="text-sm font-medium text-accent-gold">+0.75% APY</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total Rate</span>
                <span className="text-accent-gold">5.75% APY</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              User Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">One-tap authentication</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">No password management</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Cross-device compatibility</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Instant setup</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Device Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Mobile Devices
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>• iOS: Face ID, Touch ID</div>
                <div>• Android: Fingerprint, Face unlock</div>
                <div>• Samsung: Knox security</div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Laptop className="h-4 w-4" />
                Desktop Devices
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>• Windows: Windows Hello</div>
                <div>• macOS: Touch ID, Face ID</div>
                <div>• Chrome OS: Fingerprint sensors</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Actions */}
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Start Earning Benefits</h3>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => navigate('/kale')}
            variant="default"
            className="gap-2 bg-gradient-to-r from-accent-gold to-yellow-500 hover:from-accent-gold/80 hover:to-yellow-500/80"
          >
            <Zap className="h-4 w-4" />
            Start Staking
          </Button>
          <Button 
            onClick={() => navigate('/defi')}
            variant="outline"
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            DeFi Opportunities
          </Button>
          <Button 
            onClick={() => setActiveTab('overview')}
            variant="outline"
            className="gap-2"
          >
            <Shield className="h-4 w-4" />
            Connect Passkey
          </Button>
        </div>
      </div>
    </div>
  );

  const renderTesting = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Passkey Testing</h2>
        <p className="text-muted-foreground">
          Test the passkey wallet integration with comprehensive test suite
        </p>
      </div>
      
      <PasskeyTest />
    </div>
  );

  const renderGuide = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Button Functionality Guide</h2>
        <p className="text-muted-foreground">
          Complete overview of all buttons and their functionality
        </p>
      </div>
      
      <PasskeyButtonGuide />
    </div>
  );

  const renderUserStats = () => {
    if (!isPasskeyConnected || !userStats) return null;

    return (
      <Card className="bg-gradient-card border-blue-500/20 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Your Passkey Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{userStats.total_bets}</div>
              <div className="text-sm text-muted-foreground">Total Bets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-gold">{userStats.win_rate?.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{userStats.total_winnings?.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">KALE Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">+15%</div>
              <div className="text-sm text-muted-foreground">Security Bonus</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button 
              onClick={() => navigate(-1)}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Passkey Wallet Demo
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the future of secure wallet authentication with biometric technology and enhanced rewards
          </p>
        </div>

        {/* User Stats */}
        {renderUserStats()}

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gradient-card rounded-lg p-1 border border-white/10">
            {[
              { id: 'overview', label: 'Overview', icon: Shield },
              { id: 'security', label: 'Security', icon: Lock },
              { id: 'benefits', label: 'Benefits', icon: Zap },
              { id: 'testing', label: 'Testing', icon: CheckCircle },
              { id: 'guide', label: 'Button Guide', icon: AlertCircle }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.id as any)}
                className="gap-2"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'security' && renderSecurity()}
          {activeTab === 'benefits' && renderBenefits()}
          {activeTab === 'testing' && renderTesting()}
          {activeTab === 'guide' && renderGuide()}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>
            This is a demonstration of passkey wallet integration with mock data. 
            In a production environment, this would use real WebAuthn APIs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasskeyDemo;
