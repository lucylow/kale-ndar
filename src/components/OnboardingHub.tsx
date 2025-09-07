import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  BookOpen, 
  Wallet, 
  Star, 
  Target,
  TrendingUp,
  Award,
  Globe,
  Smartphone,
  Wifi,
  Settings
} from 'lucide-react';
import InteractiveTutorial from './onboarding/InteractiveTutorial';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { useI18n } from '@/contexts/I18nContext';
import { useToast } from '@/hooks/use-toast';

interface OnboardingHubProps {
  onStartTutorial: () => void;
}

const OnboardingHub: React.FC<OnboardingHubProps> = ({ onStartTutorial }) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const { settings } = usePersonalization();
  const { t } = useI18n();
  const { toast } = useToast();

  const features = [
    {
      icon: Target,
      title: "Prediction Markets",
      description: "Bet on real-world events and earn KALE tokens for accurate predictions",
      status: "available"
    },
    {
      icon: Wallet,
      title: "Stellar Wallet Integration",
      description: "Connect your Freighter, Lobstr, Rabet, or Albedo wallet",
      status: "available"
    },
    {
      icon: TrendingUp,
      title: "Real-time Market Data",
      description: "Live price updates and market analytics",
      status: "available"
    },
    {
      icon: Award,
      title: "Yield Optimization",
      description: "Automated strategies to maximize your KALE earnings",
      status: "coming-soon"
    },
    {
      icon: Globe,
      title: "Multi-language Support",
      description: "Available in English, Spanish, French, and more",
      status: "available"
    },
    {
      icon: Smartphone,
      title: "Mobile PWA",
      description: "Install as a mobile app for the best experience",
      status: "available"
    }
  ];

  const learningResources = [
    {
      title: "What are Prediction Markets?",
      description: "Learn the basics of how prediction markets work",
      type: "article",
      duration: "5 min read"
    },
    {
      title: "Understanding KALE Token",
      description: "Deep dive into the KALE ecosystem and tokenomics",
      type: "video",
      duration: "10 min watch"
    },
    {
      title: "Risk Management Strategies",
      description: "Best practices for managing your prediction portfolio",
      type: "guide",
      duration: "15 min read"
    },
    {
      title: "Advanced Trading Features",
      description: "Unlock the full potential of the platform",
      type: "tutorial",
      duration: "20 min"
    }
  ];

  return (
    <>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🌱</div>
          <h1 className="text-4xl font-bold text-foreground">
            Welcome to KALE-ndar!
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The future of prediction markets is here. Start earning KALE tokens by making accurate forecasts about real-world events.
          </p>
        </div>

        {/* Quick Start Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Quick Start
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                onClick={() => setShowTutorial(true)}
                className="h-auto p-6 flex flex-col items-center gap-3"
                variant="hero"
              >
                <BookOpen className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-semibold">Interactive Tutorial</div>
                  <div className="text-xs opacity-80">Learn the basics</div>
                </div>
              </Button>

              <Button
                onClick={() => {
                  if ('serviceWorker' in navigator) {
                    toast({
                      title: "PWA Ready!",
                      description: "Install KALE-ndar as a mobile app for the best experience.",
                    });
                  }
                }}
                className="h-auto p-6 flex flex-col items-center gap-3"
                variant="outline"
              >
                <Smartphone className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-semibold">Install Mobile App</div>
                  <div className="text-xs opacity-80">PWA Ready</div>
                </div>
              </Button>

              <Button
                onClick={() => {
                  window.open('/prediction-markets', '_self');
                }}
                className="h-auto p-6 flex flex-col items-center gap-3"
                variant="outline"
              >
                <Target className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-semibold">Browse Markets</div>
                  <div className="text-xs opacity-80">Start predicting</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Platform Features */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Features</CardTitle>
            <p className="text-muted-foreground">
              Discover what makes KALE-ndar the ultimate prediction market platform
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/20 transition-colors">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{feature.title}</h3>
                      <Badge 
                        variant={feature.status === 'available' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {feature.status === 'available' ? 'Live' : 'Soon'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learning Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Learning Resources
            </CardTitle>
            <p className="text-muted-foreground">
              Master prediction markets with our comprehensive guides
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {learningResources.map((resource, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/20 transition-colors cursor-pointer">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">{resource.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {resource.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {resource.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {resource.duration}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Read More
                    </Button>
                  </div>
                  {index < learningResources.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Accessibility & Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                KALE-ndar is designed to be accessible to everyone:
              </div>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Full keyboard navigation support
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Screen reader optimization
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  High contrast mode available
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Multi-language support
                </li>
              </ul>
              <Button variant="outline" size="sm" className="w-full">
                Configure Accessibility
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Offline Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                View your markets and portfolio even when offline:
              </div>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-teal rounded-full" />
                  Cached market data
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-teal rounded-full" />
                  Portfolio history
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-teal rounded-full" />
                  Educational content
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-teal rounded-full" />
                  Sync when back online
                </li>
              </ul>
              <Button variant="outline" size="sm" className="w-full">
                Enable Offline Mode
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interactive Tutorial Modal */}
      <InteractiveTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={() => {
          setShowTutorial(false);
          toast({
            title: "Tutorial Complete! 🎉",
            description: "You're ready to start predicting and earning KALE!",
          });
        }}
      />
    </>
  );
};

export default OnboardingHub;