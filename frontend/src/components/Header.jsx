import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button.jsx";
import { GraduationCap, Menu, MessageSquare, Sparkles, DollarSign, LogIn, UserPlus, LogOut, UserCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet.jsx";
import { useAuth } from '../context/AuthContext.jsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.jsx";

export default function Header() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogoutConfirm = () => {
    logout();
    navigate('/');
  };

  // Main navigation links shown on desktop
  const mainNavItems = [
    { name: 'Home', path: '/' }, // Home is usually the logo link
    { name: 'JEE Mains', path: '/jee-mains' },
    { name: 'JEE Advanced', path: '/jee-advanced' },
    { name: 'Mentors', path: '/talk-to-senior' }, 
    // { name: 'Resources', path: '/resources' }, // Example link
  ];

  // Links shown in mobile sheet menu
  const mobileNavItems = [
    ...(userInfo ? [{ name: 'Profile', path: '/profile', icon: <UserCircle className="h-5 w-5" /> }] : []), // Profile only if logged in
    { name: 'Home', path: '/', icon: <GraduationCap className="h-5 w-5" /> },
    { name: 'JEE Mains', path: '/jee-mains', icon: <GraduationCap className="h-5 w-5" /> },
    { name: 'JEE Advanced', path: '/jee-advanced', icon: <Sparkles className="h-5 w-5" /> },
    { name: 'Mentors', path: '/talk-to-senior', icon: <MessageSquare className="h-5 w-5" /> },
    { name: 'AI Counsellor', path: '/ai-counsellor', icon: <Sparkles className="h-5 w-5" /> },
    { name: 'Pricing', path: '/pricing', icon: <DollarSign className="h-5 w-5" /> }
  ];

  return (
    // Use the custom primary-blue color defined in tailwind.config.js
    <header className="bg-primary-blue text-white sticky top-0 z-50 shadow-md">
      <nav className="container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">

        {/* Brand/Logo */}
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-white" />
          <span className="text-xl font-bold text-white">College Predictor</span>
        </Link>

        {/* --- DESKTOP NAVIGATION --- */}
        <div className="hidden md:flex items-center gap-4"> {/* Increased gap */}
          {mainNavItems.map((item) => (
            <Link to={item.path} key={item.path}>
              <Button variant="ghost" className="text-white hover:bg-white/10 px-3 py-2 font-medium">
                {item.name}
              </Button>
            </Link>
          ))}

          {/* Conditional Buttons: Profile or Auth */}
          {userInfo ? (
            <AlertDialog> {/* AlertDialog wraps Dropdown for logout confirmation */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-2 font-medium">
                    <UserCircle className="h-5 w-5" />
                    {userInfo.name?.split(' ')[0]} {/* Show first name */}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="mt-2">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/profile">Profile</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer">Logout</DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* Logout Dialog Content */}
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>Confirm logout?</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleLogoutConfirm} className="bg-red-600 hover:bg-red-700">Logout</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-white hover:bg-white/10 px-3 py-2 font-medium">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-white text-primary-blue hover:bg-gray-100 font-semibold px-4 py-2 rounded-md">Get started</Button>
              </Link>
            </>
          )}
        </div>

        {/* --- MOBILE NAVIGATION (Sheet) --- */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10"><Menu className="h-6 w-6" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col space-y-1 pt-6">
                {/* Brand Logo inside Sheet */}
                 <Link to="/" onClick={() => setIsSheetOpen(false)} className="flex items-center gap-2 mb-4 px-2">
                    <GraduationCap className="h-6 w-6 text-primary-blue" />
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">College Predictor</span>
                 </Link>

                {/* Mobile Navigation Items */}
                {mobileNavItems.map((item) => (
                  <SheetClose asChild key={`mobile-${item.path}`}>
                    <Link to={item.path}>
                      <Button variant="ghost" className="w-full justify-start text-base gap-3 px-2 py-3">
                        {item.icon} {item.name}
                      </Button>
                    </Link>
                  </SheetClose>
                ))}
                <hr className="my-3" />

                {/* Auth Buttons for mobile */}
                {userInfo ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      {/* Removed the sheet closing onClick from here */}
                      <Button variant="ghost" className="w-full justify-start text-base gap-3 px-2 py-3 text-red-600 hover:text-red-700">
                        <LogOut className="h-5 w-5" /> Logout
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>Confirm logout?</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter>
                         {/* Close sheet on Cancel */}
                        <AlertDialogCancel onClick={() => setIsSheetOpen(false)}>Cancel</AlertDialogCancel>
                        {/* Close sheet on Confirm */}
                        <AlertDialogAction onClick={() => { handleLogoutConfirm(); setIsSheetOpen(false); }} className="bg-red-600 hover:bg-red-700">Logout</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Link to="/login"><Button variant="ghost" className="w-full justify-start text-base gap-3 px-2 py-3"><LogIn className="h-5 w-5" /> Login</Button></Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/signup"><Button className="w-full bg-primary-blue text-white hover:bg-blue-700 text-base gap-3 mt-2"><UserPlus className="h-5 w-5" /> Get started</Button></Link>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}