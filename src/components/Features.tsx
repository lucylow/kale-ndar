import { Brain, Shield, Zap, TrendingUp, Users, Award } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Predictions",
    description: "Leverage advanced machine learning models to enhance your forecasting accuracy and maximize returns.",
    color: "text-accent-purple"
  },
  {
    icon: Shield,
    title: "Secure & Transparent",
    description: "Built on Stellar blockchain technology, ensuring complete transparency and security for all transactions.",
    color: "text-primary"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Execute predictions and settlements in seconds with our high-performance blockchain infrastructure.",
    color: "text-accent-teal"
  },
  {
    icon: TrendingUp,
    title: "Real-Time Analytics",
    description: "Advanced charting and analytics tools to help you make informed decisions based on market trends.",
    color: "text-accent-gold"
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Join a vibrant community of predictors sharing insights and strategies for better outcomes.",
    color: "text-accent-purple"
  },
  {
    icon: Award,
    title: "Reward System",
    description: "Earn KALE tokens for accurate predictions and participate in exclusive high-stakes markets.",
    color: "text-primary"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-secondary">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">
            Powerful Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of prediction markets with our advanced platform designed for both novice and expert traders.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-gradient-card border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-card"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className={`h-8 w-8 ${feature.color}`} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-display font-semibold mb-4 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;