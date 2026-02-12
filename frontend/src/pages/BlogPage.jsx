import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/blog/posts`);
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

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
      <section className="pt-32 pb-16 px-4" data-testid="blog-hero">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-heading font-bold text-4xl sm:text-5xl mb-6" data-testid="blog-title">
            Trading <span className="gold-gradient-text">Insights & Education</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto" data-testid="blog-subtitle">
            Learn from expert analysis, market insights, and proven strategies to elevate your trading game.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 px-4 pb-24" data-testid="blog-posts">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12" data-testid="blog-loading">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link 
                  key={post.post_id} 
                  to={`/blog/${post.slug}`}
                  className="group"
                  data-testid={`blog-post-${post.slug}`}
                >
                  <article className="bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 rounded-xl overflow-hidden transition-all h-full">
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={post.image_url} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag) => (
                          <span 
                            key={tag}
                            className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h2 className="font-heading font-semibold text-xl mb-3 group-hover:text-blue-400 transition-colors" data-testid={`blog-post-${post.slug}-title`}>
                        {post.title}
                      </h2>
                      <p className="text-slate-400 mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <div className="flex items-center">
                          <User size={16} className="mr-2" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center text-blue-400 group-hover:translate-x-1 transition-transform">
                          <span className="mr-1">Read more</span>
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default BlogPage;