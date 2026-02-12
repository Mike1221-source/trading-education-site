import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Shield, BookOpen, Users, Award, CheckCircle, Menu, X, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [menuOpen, setMenuOpen] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');
  const [leadName, setLeadName] = useState('');
  const [showLeadModal, setShowLeadModal] = useState(false);

  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const name = formData.get('name');

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const payload = authMode === 'login' 
        ? { email, password }
        : { email, password, name };

      const response = await axios.post(`${BACKEND_URL}${endpoint}`, payload, {
        withCredentials: true
      });

      if (response.data.user) {
        toast.success(authMode === 'login' ? 'Welcome back!' : 'Account created successfully!');
        window.location.href = '/dashboard';
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/api/leads`, {
        email: leadEmail,
        name: leadName
      });
      toast.success('Success! Check your email for the free guide.');
      setShowLeadModal(false);
      setLeadEmail('');
      setLeadName('');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background text-slate-100">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-nav border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="font-heading font-bold text-xl tracking-tight" data-testid="logo-link">
              <span className="gold-gradient-text">Trading</span> Academy
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/free-course" className="text-slate-300 hover:text-white transition-colors" data-testid="nav-free-course">Free Course</Link>
              <Link to="/blog" className="text-slate-300 hover:text-white transition-colors" data-testid="nav-blog">Blog</Link>
              <a href="#pricing" className="text-slate-300 hover:text-white transition-colors" data-testid="nav-pricing">Pricing</a>
              <Button 
                onClick={() => setShowAuthModal(true)} 
                variant="outline" 
                className="border-slate-700 text-slate-300 hover:text-white hover:border-slate-500"
                data-testid="nav-login-btn"
              >
                Sign In
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white" 
              onClick={() => setMenuOpen(!menuOpen)}
              data-testid="mobile-menu-btn"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-surface border-t border-white/10" data-testid="mobile-menu">
            <div className="px-4 py-4 space-y-3">
              <Link to="/free-course" className="block text-slate-300 hover:text-white" data-testid="mobile-nav-free-course">Free Course</Link>
              <Link to="/blog" className="block text-slate-300 hover:text-white" data-testid="mobile-nav-blog">Blog</Link>
              <a href="#pricing" className="block text-slate-300 hover:text-white" data-testid="mobile-nav-pricing">Pricing</a>
              <Button onClick={() => setShowAuthModal(true)} className="w-full" data-testid="mobile-nav-login-btn">Sign In</Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 hero-glow"></div>
        <div className="absolute inset-0 opacity-5">
          <img 
            src="https://images.unsplash.com/photo-1760978631959-87fa2724d6e9?w=1920&q=80" 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl mb-6 tracking-tight" data-testid="hero-title">
              Master the Art of Trading.
              <br />
              <span className="gold-gradient-text">Build Lasting Wealth.</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto" data-testid="hero-subtitle">
              Join thousands of traders who've transformed their financial future with our proven strategies and expert mentorship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-amber-200 to-yellow-500 text-slate-950 font-bold py-6 px-10 rounded-full shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:shadow-[0_0_50px_rgba(212,175,55,0.6)] transition-all hover:-translate-y-1"
                data-testid="hero-cta-btn"
              >
                Start Free Course <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button 
                onClick={() => setShowLeadModal(true)}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 py-6 px-8 rounded-lg"
                data-testid="hero-lead-magnet-btn"
              >
                <Mail className="mr-2" size={20} />
                Get Free PDF Guide
              </Button>
            </div>
          </motion.div>

          <motion.div 
            className="mt-16 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <img 
              src="https://images.pexels.com/photos/5831260/pexels-photo-5831260.jpeg?auto=compress&cs=tinysrgb&w=1200" 
              alt="Professional Trader" 
              className="rounded-xl shadow-2xl border border-slate-800"
              data-testid="hero-image"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-24 px-4 bg-surface/30" data-testid="features-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4" data-testid="features-title">Everything You Need to Succeed</h2>
            <p className="text-slate-400 text-lg" data-testid="features-subtitle">Professional-grade education designed for real results</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              className="bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 p-8 rounded-xl transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
              data-testid="feature-card-strategies"
            >
              <TrendingUp className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="font-heading font-semibold text-xl mb-3">Proven Strategies</h3>
              <p className="text-slate-400">Learn battle-tested trading strategies used by professionals to consistently profit in any market condition.</p>
            </motion.div>

            <motion.div 
              className="bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 p-8 rounded-xl transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
              data-testid="feature-card-risk"
            >
              <Shield className="text-accent-gold mb-4 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="font-heading font-semibold text-xl mb-3">Risk Management</h3>
              <p className="text-slate-400">Master the art of protecting your capital with comprehensive risk management frameworks.</p>
            </motion.div>

            <motion.div 
              className="bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 p-8 rounded-xl transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
              data-testid="feature-card-mentorship"
            >
              <Users className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="font-heading font-semibold text-xl mb-3">Expert Mentorship</h3>
              <p className="text-slate-400">Get guidance from experienced traders who've navigated every market cycle successfully.</p>
            </motion.div>

            <motion.div 
              className="bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 p-8 rounded-xl transition-all duration-300 group md:col-span-2"
              whileHover={{ scale: 1.02 }}
              data-testid="feature-card-course"
            >
              <BookOpen className="text-accent-gold mb-4 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="font-heading font-semibold text-xl mb-3">Structured Learning Path</h3>
              <p className="text-slate-400">Progress from beginner to advanced with our carefully crafted curriculum covering technical analysis, market psychology, and more.</p>
            </motion.div>

            <motion.div 
              className="bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 p-8 rounded-xl transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
              data-testid="feature-card-community"
            >
              <Award className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="font-heading font-semibold text-xl mb-3">Community</h3>
              <p className="text-slate-400">Join a thriving community of like-minded traders sharing insights and success stories.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-slate-900/30 border-y border-white/5" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4" data-testid="testimonials-title">Trusted by Traders Worldwide</h2>
            <p className="text-slate-400 text-lg" data-testid="testimonials-subtitle">Real results from real people</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface/50 p-8 rounded-xl border border-slate-800" data-testid="testimonial-1">
              <p className="text-slate-300 mb-6 italic">
                "This program completely changed my approach to trading. I went from consistent losses to profitable months within 3 months."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full mr-4"></div>
                <div>
                  <p className="font-semibold">Sarah Martinez</p>
                  <p className="text-sm text-slate-400">Day Trader</p>
                </div>
              </div>
            </div>

            <div className="bg-surface/50 p-8 rounded-xl border border-slate-800" data-testid="testimonial-2">
              <p className="text-slate-300 mb-6 italic">
                "The risk management techniques alone have saved me thousands. This is the most comprehensive trading education I've found."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-gold to-accent-gold-dim rounded-full mr-4"></div>
                <div>
                  <p className="font-semibold">Michael Chen</p>
                  <p className="text-sm text-slate-400">Swing Trader</p>
                </div>
              </div>
            </div>

            <div className="bg-surface/50 p-8 rounded-xl border border-slate-800" data-testid="testimonial-3">
              <p className="text-slate-300 mb-6 italic">
                "Finally, a trading course that focuses on psychology and discipline, not just strategies. Game changer for my consistency."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full mr-4"></div>
                <div>
                  <p className="font-semibold">James Wilson</p>
                  <p className="text-sm text-slate-400">Options Trader</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4" data-testid="pricing-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4" data-testid="pricing-title">Choose Your Path</h2>
            <p className="text-slate-400 text-lg" data-testid="pricing-subtitle">Start free, upgrade when you're ready</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-xl" data-testid="pricing-free-card">
              <h3 className="font-heading font-bold text-2xl mb-2">Free Course</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-slate-400">/forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
                  <span className="text-slate-300">Beginner trading fundamentals</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
                  <span className="text-slate-300">5 core lessons</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
                  <span className="text-slate-300">Community access</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
                  <span className="text-slate-300">Free PDF guide</span>
                </li>
              </ul>
              <Link to="/free-course">
                <Button className="w-full bg-blue-600 hover:bg-blue-500" data-testid="pricing-free-btn">
                  Start Free Course
                </Button>
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="bg-slate-900/50 border-2 border-accent-gold p-8 rounded-xl pricing-card-glow relative" data-testid="pricing-premium-card">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-200 to-yellow-500 text-slate-950 px-4 py-1 rounded-full text-sm font-bold">
                BEST VALUE
              </div>
              <h3 className="font-heading font-bold text-2xl mb-2">Premium Access</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold gold-gradient-text">$97</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="text-accent-gold mr-3 mt-0.5 flex-shrink-0" size={20} />
                  <span className="text-slate-300">Everything in Free</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-accent-gold mr-3 mt-0.5 flex-shrink-0" size={20} />
                  <span className="text-slate-300">Advanced trading strategies</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-accent-gold mr-3 mt-0.5 flex-shrink-0" size={20} />
                  <span className="text-slate-300">Live trading sessions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-accent-gold mr-3 mt-0.5 flex-shrink-0" size={20} />
                  <span className="text-slate-300">1-on-1 mentorship</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-accent-gold mr-3 mt-0.5 flex-shrink-0" size={20} />
                  <span className="text-slate-300">Exclusive market analysis</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-accent-gold mr-3 mt-0.5 flex-shrink-0" size={20} />
                  <span className="text-slate-300">Private Discord community</span>
                </li>
              </ul>
              <Button 
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-gradient-to-r from-amber-200 to-yellow-500 text-slate-950 font-bold hover:shadow-[0_0_30px_rgba(212,175,55,0.6)]"
                data-testid="pricing-premium-btn"
              >
                Get Premium Access
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface py-12 px-4 border-t border-white/10" data-testid="footer">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-400 mb-4">© 2024 Trading Academy. All rights reserved.</p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="bg-surface border-slate-800 text-white" data-testid="auth-modal">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl" data-testid="auth-modal-title">
              {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleEmailAuth} className="space-y-4" data-testid="auth-form">
            {authMode === 'signup' && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  type="text" 
                  required 
                  className="bg-slate-950 border-slate-800 text-white"
                  data-testid="auth-name-input"
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                required 
                className="bg-slate-950 border-slate-800 text-white"
                data-testid="auth-email-input"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="bg-slate-950 border-slate-800 text-white"
                data-testid="auth-password-input"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500" data-testid="auth-submit-btn">
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface text-slate-400">Or continue with</span>
            </div>
          </div>

          <Button 
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full border-slate-700 hover:border-slate-500"
            data-testid="auth-google-btn"
          >
            <svg className="mr-2" width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-sm text-slate-400 mt-4">
            {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-blue-500 hover:underline"
              data-testid="auth-toggle-btn"
            >
              {authMode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </DialogContent>
      </Dialog>

      {/* Lead Magnet Modal */}
      <Dialog open={showLeadModal} onOpenChange={setShowLeadModal}>
        <DialogContent className="bg-surface border-slate-800 text-white" data-testid="lead-modal">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl" data-testid="lead-modal-title">
              Get Your Free Trading Guide
            </DialogTitle>
          </DialogHeader>
          
          <p className="text-slate-400 mb-4" data-testid="lead-modal-description">
            Download our comprehensive PDF guide: "5 Essential Trading Strategies for Beginners"
          </p>

          <form onSubmit={handleLeadSubmit} className="space-y-4" data-testid="lead-form">
            <div>
              <Label htmlFor="lead-name">Name (Optional)</Label>
              <Input 
                id="lead-name"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white"
                data-testid="lead-name-input"
              />
            </div>
            <div>
              <Label htmlFor="lead-email">Email</Label>
              <Input 
                id="lead-email"
                type="email"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                required
                className="bg-slate-950 border-slate-800 text-white"
                data-testid="lead-email-input"
              />
            </div>
            <Button type="submit" className="w-full bg-accent-gold hover:bg-accent-gold-dim text-slate-950 font-bold" data-testid="lead-submit-btn">
              Download Free Guide
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LandingPage;