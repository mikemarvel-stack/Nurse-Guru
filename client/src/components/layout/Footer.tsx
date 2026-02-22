import { Link } from 'react-router-dom';
import { HeartPulse, Mail, Twitter, Linkedin, Instagram, Facebook } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="border-t bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600">
                <HeartPulse className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">Nurse Guru</span>
                <span className="block text-xs text-teal-600 font-medium">Study Smarter</span>
              </div>
            </Link>
            <p className="mt-4 max-w-sm text-gray-600">
              The premier marketplace for nursing students and professionals. 
              Buy and sell study notes, care plans, NCLEX prep materials, and more. 
              Your path to nursing excellence starts here.
            </p>
            <div className="mt-6 flex gap-4">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-teal-100 hover:text-teal-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-teal-100 hover:text-teal-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-teal-100 hover:text-teal-600 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-teal-100 hover:text-teal-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900">Resources</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/browse" className="text-gray-600 hover:text-teal-600 transition-colors">
                  Browse Materials
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-600 hover:text-teal-600 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/seller" className="text-gray-600 hover:text-teal-600 transition-colors">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-teal-600 transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900">Support</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/help" className="text-gray-600 hover:text-teal-600 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-teal-600 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-teal-600 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-teal-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-teal-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-gray-900">Stay Updated</h3>
            <p className="mt-4 text-sm text-gray-600">
              Get nursing tips, new materials, and exclusive offers delivered to your inbox.
            </p>
            <form className="mt-4 flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 rounded-full"
                />
              </div>
              <Button type="submit" className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-full px-6">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Nurse Guru. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="/terms" className="hover:text-teal-600 transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-teal-600 transition-colors">
              Privacy
            </Link>
            <Link to="/cookies" className="hover:text-teal-600 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
