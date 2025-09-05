import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Discord } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">StellarFi</span>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              The future of decentralized finance on Stellar. Build, farm, and compose with KALE and Reflector protocols.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Discord className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/kale" className="text-gray-600 hover:text-gray-900 transition-colors">KALE Farming</Link></li>
              <li><Link to="/reflector" className="text-gray-600 hover:text-gray-900 transition-colors">Reflector Oracle</Link></li>
              <li><Link to="/defi" className="text-gray-600 hover:text-gray-900 transition-colors">DeFi Protocols</Link></li>
              <li><Link to="/markets" className="text-gray-600 hover:text-gray-900 transition-colors">Prediction Markets</Link></li>
              <li><Link to="/portfolio" className="text-gray-600 hover:text-gray-900 transition-colors">Portfolio</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Community</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © 2024 StellarFi. Built for the Stellar Hackathon.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
