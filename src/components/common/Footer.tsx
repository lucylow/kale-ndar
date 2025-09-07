import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, MessageCircle, Leaf } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-secondary border-t border-white/5 mt-auto">
      <div className="max-w-full mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-primary">
                <Leaf className="h-6 w-6 text-background" />
              </div>
              <span className="text-2xl font-display font-bold text-foreground">KALE-ndar</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              The premier prediction market platform on the Stellar blockchain. 
              Predict the future, earn rewards, and be part of the decentralized economy.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-accent-teal hover:bg-accent-teal/10 transition-all duration-300">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-accent-teal hover:bg-accent-teal/10 transition-all duration-300">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-accent-teal hover:bg-accent-teal/10 transition-all duration-300">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link to="/kale" className="text-muted-foreground hover:text-accent-teal transition-colors">KALE Farming</Link></li>
              <li><Link to="/reflector" className="text-muted-foreground hover:text-accent-teal transition-colors">Reflector Oracle</Link></li>
              <li><Link to="/defi" className="text-muted-foreground hover:text-accent-teal transition-colors">DeFi Protocols</Link></li>
              <li><Link to="/markets" className="text-muted-foreground hover:text-accent-teal transition-colors">Prediction Markets</Link></li>
              <li><Link to="/portfolio" className="text-muted-foreground hover:text-accent-teal transition-colors">Portfolio</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-accent-teal transition-colors">Documentation</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent-teal transition-colors">Help Center</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent-teal transition-colors">Community</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent-teal transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
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
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-accent-teal text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-muted-foreground hover:text-accent-teal text-sm transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
