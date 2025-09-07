import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  Wallet, 
  Target, 
  Trophy, 
  BookOpen,
  CheckCircle,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  content: React.ReactNode;
  target?: string;
  action?: string;
  allowSkip?: boolean;
}

interface InteractiveTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [practiceBalance, setPracticeBalance] = useState(1000);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { toast } = useToast();

  const tutorialSteps: TutorialStep[] = [
    {
      id: 1,
      title: "Welcome to KALE-ndar!",
      description: "Learn how to predict the future and earn KALE tokens",
      content: (
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-2xl font-bold text-primary">Welcome to KALE-ndar!</h3>
          <p className="text-muted-foreground">
            You're about to learn how to make predictions on real-world events and earn KALE tokens for accurate forecasts.
          </p>
          <div className="bg-primary/10 p-4 rounded-lg">
            <p className="text-sm">
              <strong>Practice Mode:</strong> You'll start with 1,000 fake KALE tokens to practice with.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Understanding Prediction Markets",
      description: "Learn the basics of how prediction markets work",
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">How Prediction Markets Work</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <h4 className="font-semibold text-primary mb-2">📈 Bet FOR</h4>
              <p className="text-sm">You believe the event will happen or the target will be reached.</p>
            </div>
            <div className="p-4 bg-accent-teal/10 rounded-lg">
              <h4 className="font-semibold text-accent-teal mb-2">📉 Bet AGAINST</h4>
              <p className="text-sm">You believe the event won't happen or the target won't be reached.</p>
            </div>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm">
              <strong>Example:</strong> "Will Bitcoin reach $100,000 by Dec 31, 2024?"
              <br />• Bet FOR if you think it will reach $100K
              <br />• Bet AGAINST if you think it won't
            </p>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Practice: Place Your First Bet",
      description: "Try placing a bet with practice tokens",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Practice Market</h3>
            <Badge variant="secondary">Practice Mode</Badge>
          </div>
          
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Will this tutorial be completed?</CardTitle>
              <p className="text-sm text-muted-foreground">Practice market for learning</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <div className="text-xl font-bold text-primary">850</div>
                  <div className="text-xs">FOR</div>
                </div>
                <div className="text-center p-3 bg-accent-teal/10 rounded-lg">
                  <div className="text-xl font-bold text-accent-teal">150</div>
                  <div className="text-xs">AGAINST</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => {
                    if (practiceBalance >= 100) {
                      setPracticeBalance(prev => prev - 100);
                      setCompletedSteps(prev => [...prev, 3]);
                      toast({
                        title: "Practice Bet Placed!",
                        description: "You bet 100 KALE FOR completion. Great job!",
                      });
                    }
                  }}
                  disabled={practiceBalance < 100 || completedSteps.includes(3)}
                >
                  {completedSteps.includes(3) ? <CheckCircle className="h-4 w-4 mr-2" /> : <Target className="h-4 w-4 mr-2" />}
                  Bet 100 KALE FOR
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Practice Balance: <span className="font-semibold">{practiceBalance} KALE</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 4,
      title: "Understanding Odds & Payouts",
      description: "Learn how odds work and calculate potential winnings",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Odds & Payouts
          </h3>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">How Odds Work:</h4>
            <p className="text-sm mb-3">
              Odds are calculated based on how much KALE is bet on each side. The more popular a side, the lower the payout.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/10 p-3 rounded">
                <p className="text-sm"><strong>FOR Side:</strong> 850 KALE</p>
                <p className="text-sm">Odds: 1.18x (if you win)</p>
                <p className="text-xs text-muted-foreground">Lower risk, lower reward</p>
              </div>
              <div className="bg-accent-teal/10 p-3 rounded">
                <p className="text-sm"><strong>AGAINST Side:</strong> 150 KALE</p>
                <p className="text-sm">Odds: 6.67x (if you win)</p>
                <p className="text-xs text-muted-foreground">Higher risk, higher reward</p>
              </div>
            </div>
          </div>
          
          <div className="bg-accent-gold/10 p-4 rounded-lg border border-accent-gold/20">
            <p className="text-sm">
              <strong>💡 Pro Tip:</strong> Look for markets where you have unique insights or information that others might not have!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Connect Your Wallet",
      description: "Ready to use real KALE tokens? Connect your Stellar wallet",
      content: (
        <div className="space-y-4 text-center">
          <Wallet className="h-16 w-16 text-primary mx-auto" />
          <h3 className="text-xl font-semibold">Ready for Real Trading?</h3>
          <p className="text-muted-foreground">
            To start trading with real KALE tokens, you'll need to connect a Stellar wallet like Freighter, Lobstr, or Rabet.
          </p>
          
          <div className="bg-primary/10 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">What you'll need:</h4>
            <ul className="text-sm text-left space-y-1">
              <li>• A Stellar wallet (Freighter recommended)</li>
              <li>• Some XLM for transaction fees</li>
              <li>• KALE tokens to start betting</li>
            </ul>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Don't worry, you can always come back to practice mode anytime!
          </p>
        </div>
      )
    }
  ];

  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
      toast({
        title: "Tutorial Complete! 🎉",
        description: "You're ready to start predicting and earning KALE!",
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    onClose();
    toast({
      title: "Tutorial Skipped",
      description: "You can restart the tutorial anytime from Settings.",
    });
  };

  if (!isOpen) return null;

  const currentTutorialStep = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Interactive Tutorial</h2>
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {tutorialSteps.length}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={skipTutorial}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% Complete</p>
        </div>

        {/* Content Card */}
        <Card className="bg-card border-border shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                {currentStep + 1}
              </div>
              {currentTutorialStep.title}
            </CardTitle>
            <p className="text-muted-foreground">{currentTutorialStep.description}</p>
          </CardHeader>
          <CardContent>
            {currentTutorialStep.content}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={skipTutorial} className="text-muted-foreground">
              Skip Tutorial
            </Button>
            <Button onClick={nextStep} className="flex items-center gap-2">
              {currentStep === tutorialSteps.length - 1 ? 'Complete' : 'Next'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveTutorial;