import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, BookOpen, TrendingUp, Award, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
          withCredentials: true
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, {
        withCredentials: true
      });
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="dashboard-loading">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-slate-100" data-testid="dashboard">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-nav border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-heading font-bold text-xl tracking-tight" data-testid="dashboard-logo">
              <span className="gold-gradient-text">Trading</span> Academy
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 bg-surface px-4 py-2 rounded-lg border border-slate-800">
                <Avatar className="h-8 w-8" data-testid="user-avatar">
                  <AvatarImage src={user?.picture} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium" data-testid="user-name">{user?.name}</p>
                  <p className="text-xs text-slate-400" data-testid="user-email">{user?.email}</p>
                </div>
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="border-slate-700"
                data-testid="logout-btn"
              >
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12" data-testid="welcome-section">
            <h1 className="font-heading font-bold text-3xl sm:text-4xl mb-4">
              Welcome back, <span className="gold-gradient-text">{user?.name?.split(' ')[0]}</span>!
            </h1>
            <p className="text-slate-400 text-lg">Continue your trading education journey</p>
          </div>

          {/* Membership Status */}
          <div className="mb-12">
            {user?.is_premium ? (
              <div className="bg-gradient-to-r from-amber-200/10 to-yellow-500/10 border border-accent-gold/30 p-8 rounded-xl" data-testid="premium-status">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Crown className="text-accent-gold" size={28} />
                      <h2 className="font-heading font-bold text-2xl gold-gradient-text">Premium Member</h2>
                    </div>
                    <p className="text-slate-300">You have full access to all premium content and features.</p>
                  </div>
                  <Award className="text-accent-gold" size={48} />
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-xl" data-testid="free-status">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <h2 className="font-heading font-bold text-2xl mb-3">Upgrade to Premium</h2>
                    <p className="text-slate-400 mb-4">
                      Unlock advanced strategies, live sessions, and 1-on-1 mentorship for just $97/month.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-center">
                        <TrendingUp size={16} className="text-accent-gold mr-2" />
                        Advanced trading strategies
                      </li>
                      <li className="flex items-center">
                        <TrendingUp size={16} className="text-accent-gold mr-2" />
                        Live trading sessions
                      </li>
                      <li className="flex items-center">
                        <TrendingUp size={16} className="text-accent-gold mr-2" />
                        Private Discord community
                      </li>
                    </ul>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-amber-200 to-yellow-500 text-slate-950 font-bold px-8 hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] flex-shrink-0"
                    data-testid="upgrade-btn"
                  >
                    <Crown className="mr-2" size={18} />
                    Upgrade Now
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 p-6 rounded-xl transition-all cursor-pointer group" data-testid="action-continue-course">
              <BookOpen className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h3 className="font-heading font-semibold text-xl mb-2">Continue Course</h3>
              <p className="text-slate-400 text-sm mb-4">Pick up where you left off in your learning journey</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-500" data-testid="continue-course-btn">
                Resume Learning
              </Button>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 p-6 rounded-xl transition-all cursor-pointer group" data-testid="action-market-analysis">
              <TrendingUp className="text-accent-gold mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h3 className="font-heading font-semibold text-xl mb-2">Market Analysis</h3>
              <p className="text-slate-400 text-sm mb-4">View today's market insights and trading opportunities</p>
              <Button 
                className="w-full border-slate-700" 
                variant="outline"
                data-testid="market-analysis-btn"
              >
                View Analysis
              </Button>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 p-6 rounded-xl transition-all cursor-pointer group" data-testid="action-community">
              <Award className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h3 className="font-heading font-semibold text-xl mb-2">Community</h3>
              <p className="text-slate-400 text-sm mb-4">Connect with fellow traders and share insights</p>
              <Button 
                className="w-full border-slate-700" 
                variant="outline"
                data-testid="community-btn"
              >
                Join Discussion
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-xl" data-testid="recent-activity">
            <h2 className="font-heading font-bold text-2xl mb-6">Your Progress</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <p className="font-medium">Free Course Progress</p>
                  <p className="text-sm text-slate-400">0 of 5 lessons completed</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-500">0%</p>
                </div>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <p className="font-medium">Total Learning Time</p>
                  <p className="text-sm text-slate-400">Time spent in courses</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-accent-gold">0h</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Achievements</p>
                  <p className="text-sm text-slate-400">Badges and milestones earned</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-500">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
