import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white py-16 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <Logo className="text-white mb-6" />
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Sarothi is a premier student support platform dedicated to providing high-quality educational content for HSC, SSC, and Admission students. We bring all your study materials into one place.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-6">Quick Links</h3>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/category/hsc" className="hover:text-white transition-colors">HSC Classes</Link></li>
            <li><Link to="/category/ssc" className="hover:text-white transition-colors">SSC Classes</Link></li>
            <li><Link to="/category/admission" className="hover:text-white transition-colors">Admission Prep</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-6">Contact Us</h3>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4" />
              <span>info@sarothi.edu</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4" />
              <span>+880 1234 567890</span>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="w-4 h-4" />
              <span>Dhaka, Bangladesh</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-6">Follow Us</h3>
          <div className="flex gap-4">
            <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all hover:scale-110">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all hover:scale-110">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all hover:scale-110">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all hover:scale-110">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
          <div className="mt-8">
            <h4 className="text-sm font-semibold mb-4 text-gray-400">Subscribe to our newsletter</h4>
            <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
              <input
                type="email"
                placeholder="Email address"
                className="bg-transparent border-none outline-none px-4 py-2 text-sm w-full"
              />
              <button className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
        <p>© 2026 Sarothi Education. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white">Terms of Service</a>
          <a href="#" className="hover:text-white">Cookie Policy</a>
          <a href="#" className="hover:text-white">Accessibility</a>
        </div>
      </div>
    </footer>
  );
};
