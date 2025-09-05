import { Leaf, Twitter, Github, MessageCircle, Send } from "lucide-react";

const footerLinks = {
  platform: [
    { name: "Markets", href: "#markets" },
    { name: "Leaderboard", href: "#leaderboard" },
    { name: "Create Market", href: "#create" },
    { name: "API", href: "#api" }
  ],
  resources: [
    { name: "Documentation", href: "#docs" },
    { name: "Tutorials", href: "#tutorials" },
    { name: "Blog", href: "#blog" },
    { name: "FAQ", href: "#faq" }
  ],
  company: [
    { name: "About Us", href: "#about" },
    { name: "Careers", href: "#careers" },
    { name: "Privacy Policy", href: "#privacy" },
    { name: "Terms of Service", href: "#terms" }
  ]
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: MessageCircle, href: "#", label: "Discord" },
  { icon: Send, href: "#", label: "Telegram" },
  { icon: Github, href: "#", label: "GitHub" }
];

const Footer = () => {
  return (
    <footer className="bg-secondary border-t border-white/5">
      <div className="container mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-primary">
                <Leaf className="h-6 w-6 text-background" />
              </div>
              <span className="text-2xl font-display font-bold text-foreground">
                KALE-ndar
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              The premier prediction market platform on the Stellar blockchain. 
              Predict the future, earn rewards, and be part of the decentralized economy.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-accent-teal hover:bg-accent-teal/10 transition-all duration-300"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-lg font-display font-semibold text-foreground mb-6">
              Platform
            </h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-accent-teal transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-lg font-display font-semibold text-foreground mb-6">
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-accent-teal transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-display font-semibold text-foreground mb-6">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-accent-teal transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 KALE-ndar. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>Built on Stellar</span>
            <span>•</span>
            <span>Powered by AI</span>
            <span>•</span>
            <span>Community Driven</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;