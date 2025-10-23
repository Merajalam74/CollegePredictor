import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { MessageSquare, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert.jsx";
import { Link } from 'react-router-dom';

// MOCK DATA: Later, you will fetch this from your database
const seniors = [
  { id: 1, name: 'Rohan Sharma', college: 'IIT Bombay', branch: 'Computer Science', year: 4, rating: 4.8 },
  { id: 2, name: 'Priya Singh', college: 'NIT Trichy', branch: 'Electronics & Comm.', year: 3, rating: 4.9 },
  { id: 3, name: 'Arjun Verma', college: 'IIT Delhi', branch: 'Mechanical Engg.', year: 4, rating: 4.7 },
  { id: 4, name: 'Sneha Reddy', college: 'NIT Warangal', branch: 'Chemical Engg.', year: 3, rating: 4.8 },
];

export default function TalkToSenior() {
  const { userInfo } = useAuth();
  
  // Check if user is logged in AND is premium
  if (!userInfo || userInfo.subscription !== 'premium') {
    return (
      <div className="max-w-3xl mx-auto">
        <Alert variant="destructive">
          <Star className="h-4 w-4" />
          <AlertTitle>Premium Feature</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            This feature is only for premium users.
            <Link to="/pricing"><Button>Upgrade to Premium</Button></Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // User is premium, show the page
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">Talk to a Senior</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Get one-on-one guidance from students at your dream college.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {seniors.map((senior) => (
          <Card key={senior.id} className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{senior.name}</CardTitle>
                  <CardDescription className="text-md">{senior.college}</CardDescription>
                </div>
                <div className="flex items-center gap-1 bg-yellow-400 text-black px-2 py-1 rounded-full">
                  <Star className="w-4 h-4" />
                  <span className="font-bold text-sm">{senior.rating}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Badge variant="secondary">{senior.branch}</Badge>
                <Badge variant="outline">Year {senior.year}</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                "Happy to help with admission doubts, college life, and branch selection!"
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <MessageSquare className="mr-2 h-4 w-4" />
                Book a Session
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}