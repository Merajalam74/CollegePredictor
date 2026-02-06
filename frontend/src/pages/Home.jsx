import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card.jsx';
import { GraduationCap, Rocket, MessageSquare, Sparkles, CheckCircle, BarChart } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { userInfo } = useAuth(); 
  return (
    <div className="animate-in fade-in-50 duration-500 -mt-10 -mx-4 md:-mx-10"> 

      {/* --- Hero Section --- */}
      <section className="text-center py-16 md:py-24 bg-gradient-to-b from-primary-blue to-blue-700 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 leading-tight">
            YOUR COLLEGE JOURNEY, <br className="hidden md:block"/> GUIDED END-TO-END
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Get into the right college and thrive from day one. College Predictor blends historical data, AI predictions, and real mentor wisdom so you can make confident decisions.
          </p>
          {/* --- 3. Conditional Button Rendering --- */}
          {!userInfo && (
            <div className="flex flex-wrap gap-4 justify-center mb-16">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-primary-blue hover:bg-gray-100 font-semibold shadow-md px-6 py-3">
                  Create your free account
                </Button>
              </Link>
              <Link to="/jee-mains">
                 <Button size="lg" variant="outline" className="text-black border-white hover:bg-white/10 font-semibold shadow-md px-6 py-3">
                   Explore Predictors
                 </Button>
              </Link>
            </div>
          )}
          {userInfo && (
            <div className="mb-16">
               <Link to="/jee-mains">
                 <Button size="lg" variant="outline" className="text-black border-white hover:bg-white/10 font-semibold shadow-md px-6 py-3">
                   Explore Predictors
                 </Button>
              </Link>
            </div>
          )}

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-left">
           
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20">
              <p className="text-4xl font-bold text-white mb-2">25K+</p>
              <p className="text-blue-100">Students guided</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20">
              <p className="text-4xl font-bold text-white mb-2">12K+</p>
              <p className="text-blue-100">Mentor sessions completed</p>
            </div>
             <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20">
              <p className="text-4xl font-bold text-white mb-2">90%+ </p>
              <p className="text-blue-100">Prediction accuracy</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Dashboard Snapshot --- */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
         <div className="container mx-auto px-4 text-center">
             <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Snapshot of your personalized dashboard</h2>
             <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">Predictions, mentors, learning progress — all in one place.</p>
          
             {/* <img src={dashboardSnapshot} alt="Personalized Dashboard Snapshot" className="max-w-md mx-auto rounded-lg shadow-xl border dark:border-gray-700"/> */}
             <div className="bg-gray-200 dark:bg-gray-700 h-64 max-w-md mx-auto rounded-lg shadow-xl border dark:border-gray-600 flex items-center justify-center text-gray-500">
                (Dashboard Image Placeholder)
             </div>
         </div>
      </section>

      {/* --- Features Section --- */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100">Everything you need to navigate counseling</h2>
          <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">From rank predictions to mentorship, we bring it all together.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <BarChart className="h-10 w-10 text-primary-blue mx-auto mb-3" />
                <CardTitle>AI-Powered Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">Generate data-backed college shortlists tailored to your rank, category, and preferences.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-primary-blue mx-auto mb-3" />
                <CardTitle>Mentor Matchmaking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">Connect with verified seniors from IITs/NITs for one-to-one sessions and advice.</p>
              </CardContent>
            </Card>
             <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <Sparkles className="h-10 w-10 text-primary-blue mx-auto mb-3" />
                <CardTitle>AI Counsellor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">Get personalized guidance and answers to your counseling questions (Premium feature).</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      
      <section className="py-16 md:py-20 bg-blue-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
           <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">How College Predictor works</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
              <div>
                  <div className="bg-primary-blue text-white rounded-full h-12 w-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Tell us about you</h3>
                  <p className="text-gray-600 dark:text-gray-400">Share your exam details and rank during signup or in your profile.</p>
              </div>
              <div>
                  <div className="bg-primary-blue text-white rounded-full h-12 w-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">See your predictions</h3>
                  <p className="text-gray-600 dark:text-gray-400">Use the JEE Mains & Advanced predictors to see likely, target, and reach colleges.</p>
              </div>
              <div>
                  <div className="bg-primary-blue text-white rounded-full h-12 w-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Connect & Upgrade</h3>
                  <p className="text-gray-600 dark:text-gray-400">Book sessions with mentors or use the AI Counsellor by upgrading to premium.</p>
              </div>
           </div>
        </div>
      </section>

    
       <section className="py-16 md:py-20 bg-white dark:bg-gray-950">
         <div className="container mx-auto px-4">
             <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">Don't just take our word for it</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                
                 <Card className="bg-gray-800 text-white p-6 shadow-xl rounded-lg border border-gray-700">
                    <CardContent className="pt-6"> 
                       <p className="text-lg italic mb-4">"The predictions gave me clarity in the final counseling rounds and pairing with a mentor made all the difference."</p>
                       <p className="font-semibold">Aditi Sharma</p>
                       <p className="text-sm text-gray-400">B.Tech CSE, NIT Jaipur</p>
                    </CardContent>
                </Card>
                 <Card className="bg-gray-800 text-white p-6 shadow-xl rounded-lg border border-gray-700">
                     <CardContent className="pt-6">
                       <p className="text-lg italic mb-4">"Super accurate predictor! Helped me finalize my choices between NIT Trichy and Surathkal."</p>
                       <p className="font-semibold">Rahul Iyer</p>
                       <p className="text-sm text-gray-400">Incoming Freshman, IIIT Hyderabad</p>
                    </CardContent>
                </Card>
             </div>
         </div>
      </section>

       
      <section className="py-16 md:py-24 text-center bg-gradient-to-t from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
             Ready to map your best-fit colleges?
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Create your account in minutes and get access to powerful prediction tools.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-primary-blue text-white hover:bg-blue-700 font-semibold shadow-md px-6 py-3">
                Start your journey
              </Button>
            </Link>
             <Link to="/talk-to-senior">
              <Button size="lg" variant="outline" className="font-semibold shadow-md px-6 py-3">
                Browse Mentors
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
