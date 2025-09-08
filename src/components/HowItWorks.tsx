import { Wallet, Target, Trophy } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Wallet,
    title: "Connect Wallet",
    description: "Link your digital wallet and fund it with KALE tokens to start your prediction journey.",
    color: "from-primary to-primary-glow"
  },
  {
    number: "02", 
    icon: Target,
    title: "Make Predictions",
    description: "Browse active markets covering sports, politics, economics, and more. Stake KALE on outcomes you predict.",
    color: "from-accent-teal to-accent-purple"
  },
  {
    number: "03",
    icon: Trophy,
    title: "Earn Rewards",
    description: "Collect your winnings when markets resolve. The more accurate your predictions, the greater your rewards.",
    color: "from-accent-gold to-accent-purple"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start earning KALE tokens in just three simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center group">
                {/* Connection Line (Desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent -translate-y-1/2 translate-x-8" />
                )}

                {/* Step Number */}
                <div className="relative mb-8">
                  <div className={`w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br ${step.color} p-0.5 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full bg-background rounded-2xl flex items-center justify-center">
                      <step.icon className="h-12 w-12 text-foreground" />
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-accent-teal to-accent-purple rounded-full flex items-center justify-center">
                    <span className="text-background font-bold text-sm">{step.number}</span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-display font-semibold mb-4 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-primary font-medium">Ready to start?</span>
            <span className="text-muted-foreground">It takes less than 2 minutes</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;