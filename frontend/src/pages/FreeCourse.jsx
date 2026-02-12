import { Link } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

function FreeCourse() {
  const lessons = [
    {
      id: 1,
      title: 'Introduction to Trading Markets',
      duration: '15 min',
      topics: ['Market basics', 'Different asset classes', 'Trading vs Investing']
    },
    {
      id: 2,
      title: 'Understanding Charts and Timeframes',
      duration: '20 min',
      topics: ['Candlestick patterns', 'Support and resistance', 'Trend identification']
    },
    {
      id: 3,
      title: 'Risk Management Fundamentals',
      duration: '18 min',
      topics: ['Position sizing', 'Stop losses', 'Risk/reward ratios']
    },
    {
      id: 4,
      title: 'Trading Psychology Basics',
      duration: '12 min',
      topics: ['Emotional control', 'Discipline', 'Common beginner mistakes']
    },
    {
      id: 5,
      title: 'Creating Your First Trading Plan',
      duration: '25 min',
      topics: ['Setting goals', 'Strategy development', 'Journaling']
    }
  ];

  return (
    <div className="min-h-screen bg-background text-slate-100">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-nav border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="font-heading font-bold text-xl tracking-tight" data-testid="logo-link">
              <span className="gold-gradient-text">Trading</span> Academy
            </Link>
            <Link to="/">
              <Button variant="outline" className="border-slate-700" data-testid="back-home-btn">Back to Home</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4" data-testid="course-hero">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading font-bold text-4xl sm:text-5xl mb-6" data-testid="course-title">
            Free <span className="gold-gradient-text">Beginner Trading Course</span>
          </h1>
          <p className="text-lg text-slate-400 mb-8" data-testid="course-subtitle">
            Start your trading journey with our comprehensive 5-lesson course designed for complete beginners.
          </p>
          <div className="flex justify-center gap-8 text-sm">
            <div className="flex items-center">
              <BookOpen className="text-blue-500 mr-2" size={20} />
              <span>5 Lessons</span>
            </div>
            <div className="flex items-center">
              <Clock className="text-accent-gold mr-2" size={20} />
              <span>90 Minutes Total</span>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-16 px-4" data-testid="course-content">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <div 
                key={lesson.id}
                className="bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 p-6 rounded-xl transition-all group cursor-pointer"
                data-testid={`lesson-${lesson.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="font-bold">{lesson.id}</span>
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-xl mb-2 group-hover:text-blue-400 transition-colors" data-testid={`lesson-${lesson.id}-title`}>
                        {lesson.title}
                      </h3>
                      <div className="flex items-center text-sm text-slate-400">
                        <Clock size={16} className="mr-1" />
                        <span>{lesson.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ul className="ml-14 space-y-2">
                  {lesson.topics.map((topic, idx) => (
                    <li key={idx} className="flex items-start text-slate-300">
                      <CheckCircle size={16} className="text-accent-gold mr-2 mt-0.5 flex-shrink-0" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-surface/50 border border-slate-800 p-8 rounded-xl" data-testid="course-cta">
            <h3 className="font-heading font-bold text-2xl mb-4">Ready to Start Learning?</h3>
            <p className="text-slate-400 mb-6">Sign up now to access all lessons and start your trading journey.</p>
            <Link to="/">
              <Button className="bg-gradient-to-r from-amber-200 to-yellow-500 text-slate-950 font-bold px-8" data-testid="course-signup-btn">
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default FreeCourse;