import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from "@/lib/utils"
import { Home, GraduationCap, Rocket } from "lucide-react"

export default function Layout({ children }) {
  const location = useLocation();
  const navItems = [
    { name: 'Home', path: '/', icon: <Home className="h-4 w-4" /> },
    { name: 'JEE Mains', path: '/jee-mains', icon: <GraduationCap className="h-4 w-4" /> },
    { name: 'JEE Advanced', path: '/jee-advanced', icon: <Rocket className="h-4 w-4" /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 p-4 pt-6 fixed h-full">
        <h2 className="text-2xl font-bold mb-8 px-2 text-gray-900 dark:text-gray-100">
          College Predictor
        </h2>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                  location.pathname === item.path && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <main className="flex-1 p-6 lg:p-10 ml-64">
        {children}
      </main>
    </div>
  )
}