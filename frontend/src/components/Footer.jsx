import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";

export default function Footer() {
  return (
    // Use a slightly darker grey for the footer background
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 pt-16 pb-8">
      <div className="container mx-auto px-4 lg:px-6">

        {/* Top Section: Email Signup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 items-center">
          <div>
            <h3 className="text-xl font-semibold uppercase tracking-wider text-primary-blue mb-2">Join Our Monthly Digest</h3>
            <p className="text-gray-600 dark:text-gray-400">No spam. Insights on cutoffs, mentorship playbooks, and feature drops.</p>
          </div>
          <form className="flex gap-2 max-w-md ml-auto" onSubmit={(e) => e.preventDefault()}> {/* Prevent default submit */}
            <Input type="email" placeholder="Enter your email" className="flex-grow" aria-label="Email for newsletter"/>
            <Button type="submit" className="bg-primary-blue text-white hover:bg-blue-700">Subscribe</Button>
          </form>
        </div>

        {/* Middle Section: Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 mb-12">
          {/* Column 1: Product */}
          <div>
            <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/jee-mains" className="text-gray-600 hover:text-primary-blue dark:text-gray-400 dark:hover:text-blue-400">JEE Mains Predictor</Link></li>
              <li><Link to="/jee-advanced" className="text-gray-600 hover:text-primary-blue dark:text-gray-400 dark:hover:text-blue-400">JEE Advanced Predictor</Link></li>
              <li><Link to="/talk-to-senior" className="text-gray-600 hover:text-primary-blue dark:text-gray-400 dark:hover:text-blue-400">Mentors</Link></li>
              <li><Link to="/ai-counsellor" className="text-gray-600 hover:text-primary-blue dark:text-gray-400 dark:hover:text-blue-400">AI Counsellor</Link></li>
              <li><Link to="/pricing" className="text-gray-600 hover:text-primary-blue dark:text-gray-400 dark:hover:text-blue-400">Pricing</Link></li>
              <li><Link to="/profile" className="text-gray-600 hover:text-primary-blue dark:text-gray-400 dark:hover:text-blue-400">Profile</Link></li> {/* Added Profile */}
            </ul>
          </div>

          {/* Column 2: Company */}
          <div>
            <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-gray-600 hover:text-primary-blue dark:text-gray-400 dark:hover:text-blue-400">About Us</Link></li>
              {/* <li><Link to="/careers" className="text-gray-600 hover:text-primary-blue dark:text-gray-400 dark:hover:text-blue-400">Careers</Link></li> */}
              {/* <li><Link to="/press" className="text-gray-600 hover:text-primary-blue dark:text-gray-400 dark:hover:text-blue-400">Press</Link></li> */}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Resources</h4>
            <ul className="space-y-2 text-sm">
               <li><Link to="/help" className="text-gray-600 hover:text-primary-blue dark:text-gray-400 dark:hover:text-blue-400">Help Center</Link></li>
               {/* <li><Link to="/guides" className="text-gray-600 hover:text-primary-blue dark:text-gray-400 dark:hover:text-blue-400">Guides</Link></li> */}
               {/* <li><Link to="/blog" className="text-gray-600 hover:text-primary-blue dark:text-gray-400 dark:hover:text-blue-400">Blog</Link></li> */}
            </ul>
          </div>

          {/* Column 4: Community/Support */}
          <div>
             <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Support</h4>
             <ul className="space-y-2 text-sm">
                <li><Link to="/contact" className="text-gray-600 hover:text-primary-blue dark:text-gray-400 dark:hover:text-blue-400">Contact Us</Link></li>
                <li><Link to="/feedback" className="text-gray-600 hover:text-primary-blue dark:text-gray-400 dark:hover:text-blue-400">Feedback</Link></li>
                {/* <li><Link to="/community" className="text-gray-600 hover:text-primary-blue dark:text-gray-400 dark:hover:text-blue-400">Community</Link></li> */}
             </ul>
          </div>

           {/* Column 5: Legal (Example) */}
           <div>
             <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Legal</h4>
             <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="text-gray-600 hover:text-primary-blue dark:text-gray-400 dark:hover:text-blue-400">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-600 hover:text-primary-blue dark:text-gray-400 dark:hover:text-blue-400">Terms of Service</Link></li>
                {/* <li><Link to="/security" className="text-gray-600 hover:text-primary-blue dark:text-gray-400 dark:hover:text-blue-400">Security</Link></li> */}
             </ul>
           </div>
        </div>

        {/* Bottom Bar: Copyright & Brand */}
        <div className="border-t border-gray-300 dark:border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
           <div className="flex items-center gap-2 mb-4 md:mb-0">
             <GraduationCap className="h-6 w-6 text-primary-blue" />
             <span className="font-bold text-gray-800 dark:text-gray-200">College Predictor</span>
           </div>
           <p>© {new Date().getFullYear()} College Predictor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}