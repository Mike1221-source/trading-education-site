import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/blog/posts/${slug}`);
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="post-loading">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="post-not-found">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Post not found</h2>
          <Link to="/blog">
            <Button data-testid="back-to-blog-btn">Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-slate-100">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-nav border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="font-heading font-bold text-xl tracking-tight" data-testid="logo-link">
              <span className="gold-gradient-text">Trading</span> Academy
            </Link>
            <Link to="/blog">
              <Button variant="outline" className="border-slate-700" data-testid="back-to-blog-btn">
                <ArrowLeft className="mr-2" size={16} />
                All Posts
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Article */}
      <article className="pt-32 pb-24 px-4" data-testid="blog-post-article">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span 
                  key={tag}
                  className="text-sm bg-blue-600/20 text-blue-400 px-3 py-1 rounded"
                  data-testid={`post-tag-${tag}`}
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl mb-6" data-testid="post-title">
              {post.title}
            </h1>
            <div className="flex items-center gap-6 text-slate-400">
              <div className="flex items-center">
                <User size={18} className="mr-2" />
                <span data-testid="post-author">{post.author}</span>
              </div>
              <div className="flex items-center">
                <Calendar size={18} className="mr-2" />
                <span data-testid="post-date">
                  {new Date(post.published_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-12 rounded-xl overflow-hidden">
            <img 
              src={post.image_url} 
              alt={post.title}
              className="w-full h-auto"
              data-testid="post-featured-image"
            />
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none" data-testid="post-content">
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">{post.excerpt}</p>
            <div className="text-slate-300 leading-relaxed whitespace-pre-line">
              {post.content}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 bg-gradient-to-r from-blue-600/20 to-accent-gold/20 border border-slate-800 p-8 rounded-xl text-center" data-testid="post-cta">
            <h3 className="font-heading font-bold text-2xl mb-4">Ready to Level Up Your Trading?</h3>
            <p className="text-slate-400 mb-6">Join our premium community and get access to exclusive strategies and mentorship.</p>
            <Link to="/">
              <Button className="bg-gradient-to-r from-amber-200 to-yellow-500 text-slate-950 font-bold px-8" data-testid="post-cta-btn">
                Get Premium Access
              </Button>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}

export default BlogPostPage;