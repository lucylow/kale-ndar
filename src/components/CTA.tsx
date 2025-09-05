import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Shield, Zap, Users } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-accent-teal/5">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-primary mb-8 animate-pulse-glow">
            <Sparkles className="h-10 w-10 text-background" />
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 text-foreground">
            Ready to Predict the{" "}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Future?
            </span>
          </h2>

          {/* Description */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of users who are already earning KALE by accurately predicting real-world events
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">Active Predictors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent-teal mb-2">$2.5M+</div>
              <div className="text-muted-foreground">Volume Traded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent-gold mb-2">85%</div>
              <div className="text-muted-foreground">Avg. Accuracy Rate</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="premium" size="lg" className="text-lg px-8 py-6">
              Start Earning Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Learn More
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-5 w-5 text-primary" />
              <span>Fully Audited</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="h-5 w-5 text-accent-teal" />
              <span>Instant Settlements</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5 text-accent-purple" />
              <span>Community Verified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;