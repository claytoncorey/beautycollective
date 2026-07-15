import React, { useState, useEffect, useCallback, useRef } from 'react';
import { dbService, authService, analyticsService } from './firebase';
import DirectoryView from './components/DirectoryView';
import AuthPanel from './components/AuthPanel';
import MyProfile from './components/MyProfile';
import AdminPanel from './components/AdminPanel';
import EmailGenerator from './components/EmailGenerator';
import FeedbackButton from './components/FeedbackButton';
import NewsletterButton from './components/NewsletterButton';

const ADMIN_EMAILS = ['dpaterno@gmail.com', 'clayton.corey@icloud.com'];
const isAdminUser = (user) => {
  return user && user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
};

export default function App() {
  const [currentView, setCurrentView] = useState('directory'); // directory, profile, admin, campaign
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState(null);
  const newsletterDialogRef = useRef(null);
  const [adminEditingEmail, setAdminEditingEmail] = useState(null);

  // Helper for URL navigation
  const navigateTo = (path) => {
    window.history.pushState(null, '', path);
    handleRouting(path);
    window.scrollTo(0, 0);
    setAdminEditingEmail(null);
  };

  const handleRouting = useCallback((path = window.location.pathname) => {
    if (path === '/profile') {
      setCurrentView('profile');
      setSelectedTech(null);
    } else if (path === '/admin') {
      setCurrentView('admin');
      setSelectedTech(null);
    } else if (path === '/campaign') {
      setCurrentView('campaign');
      setSelectedTech(null);
    } else if (path.startsWith('/expert/')) {
      setCurrentView('directory');
      const expertId = path.split('/expert/')[1];
      if (professionals.length > 0) {
        const expert = professionals.find(p => p.id === expertId && p.status === 'active');
        setSelectedTech(expert || null);
      }
    } else {
      setCurrentView('directory');
      setSelectedTech(null);
    }
  }, [professionals]);

  // Sync state with URL routing on load and on popstate
  useEffect(() => {
    handleRouting();

    const onPopState = () => {
      handleRouting();
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [handleRouting]);

  // Sync selectedTech change to update the URL path
  const handleSelectTech = (tech) => {
    setSelectedTech(tech);
    if (tech) {
      if (window.location.pathname !== `/expert/${tech.id}`) {
        window.history.pushState(null, '', `/expert/${tech.id}`);
      }
    } else {
      if (window.location.pathname !== '/') {
        window.history.pushState(null, '', '/');
      }
    }
  };

  const handleAdminEditProfile = (email) => {
    setAdminEditingEmail(email);
    window.history.pushState(null, '', '/profile');
    setCurrentView('profile');
  };

  // Dynamic Title & Meta Tags for SEO
  useEffect(() => {
    let title = "New Mexico Beauty Collective";
    let description = "Discover Albuquerque's premier curated collection of independent wellness, fashion, photography, and beauty professionals.";

    if (currentView === 'profile') {
      title = "My Profile | New Mexico Beauty Collective";
      description = "Manage your professional beauty & wellness listing, update portfolio details, and connect with clients.";
    } else if (currentView === 'admin') {
      title = "Admin Panel | New Mexico Beauty Collective";
      description = "Moderation and administration panel for managing professional listings.";
    } else if (currentView === 'campaign') {
      title = "Campaign Builder | New Mexico Beauty Collective";
      description = "Build and generate marketing campaigns for beauty collective professionals.";
    } else if (currentView === 'directory') {
      if (selectedTech) {
        title = `${selectedTech.name} - ${selectedTech.specialty} at ${selectedTech.businessName} | New Mexico Beauty Collective`;
        description = selectedTech.bio 
          ? (selectedTech.bio.length > 155 ? selectedTech.bio.substring(0, 155) + '...' : selectedTech.bio)
          : `View ${selectedTech.name}'s professional profile, specialty offerings, and booking details.`;
      }
    }

    document.title = title;
    
    // Update description meta tag
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Update Open Graph tags dynamically
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);
    
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      const canonicalUrl = selectedTech 
        ? `https://newmexicobeautycollective.com/expert/${selectedTech.id}`
        : `https://newmexicobeautycollective.com${window.location.pathname}`;
      ogUrl.setAttribute('content', canonicalUrl);
    }
  }, [currentView, selectedTech]);

  // Subscribe to Auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  // Track page views on view navigation
  useEffect(() => {
    analyticsService.logPageView(currentView);
  }, [currentView]);

  // Handle sticky header visibility based on page scroll
  useEffect(() => {
    if (currentView !== 'directory') {
      setScrolled(true);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > 60) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);



  // Load professionals on mount
  useEffect(() => {
    async function loadData() {
      try {
        const data = await dbService.getProfessionals();
        setProfessionals(data);
      } catch (error) {
        console.error("Error loading professionals:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser, currentView]); // Reload when currentUser logs in/out, or tab switches to pick up updates

  // Admin approval (pending -> active)
  const handleApprove = async (id) => {
    try {
      await dbService.updateProfessional(id, { status: 'active' });
      setProfessionals(prev => 
        prev.map(t => t.id === id ? { ...t, status: 'active' } : t)
      );
    } catch (error) {
      console.error("Error approving professional:", error);
    }
  };

  // Toggle Featured status (true/false)
  const handleToggleFeatured = async (id) => {
    const tech = professionals.find(t => t.id === id);
    if (!tech) return;
    try {
      const nextFeatured = !tech.isFeatured;
      await dbService.updateProfessional(id, { isFeatured: nextFeatured });
      setProfessionals(prev => 
        prev.map(t => t.id === id ? { ...t, isFeatured: nextFeatured } : t)
      );
    } catch (error) {
      console.error("Error toggling featured status:", error);
    }
  };

  // Toggle general listing status (active/pending) - allows archiving/temporarily suspending techs
  const handleToggleStatus = async (id, nextStatus) => {
    try {
      await dbService.updateProfessional(id, { status: nextStatus });
      setProfessionals(prev => 
        prev.map(t => t.id === id ? { ...t, status: nextStatus } : t)
      );
    } catch (error) {
      console.error("Error toggling listing status:", error);
    }
  };

  // Delete professional
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this professional profile permanently?")) {
      return;
    }
    try {
      await dbService.deleteProfessional(id);
      setProfessionals(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Error removing professional:", error);
    }
  };

  // Render current view
  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border-muted)',
            borderTopColor: 'var(--primary-burgundy)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-charcoal-muted)' }}>Loading Albuquerque Collective Registry...</span>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      );
    }

    switch (currentView) {
      case 'directory':
        return <DirectoryView professionals={professionals} searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedTech={selectedTech} onSelectTech={handleSelectTech} />;
      case 'profile':
        return currentUser ? (
          <MyProfile 
            currentUser={currentUser} 
            adminEditingEmail={adminEditingEmail}
            onSignOut={() => setCurrentUser(null)} 
            onCancelEdit={() => {
              setAdminEditingEmail(null);
              window.history.pushState(null, '', '/admin');
              setCurrentView('admin');
            }}
          />
        ) : (
          <AuthPanel 
            onAuthSuccess={(user) => setCurrentUser(user)} 
          />
        );
      case 'admin':
        if (!isAdminUser(currentUser)) {
          return (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', minHeight: '40vh' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-burgundy)', marginBottom: '1rem' }}>Access Denied</h2>
              <p style={{ color: 'var(--text-charcoal-muted)', marginBottom: '2rem' }}>You do not have permission to access the admin moderation panel.</p>
              <button 
                onClick={() => navigateTo('/')}
                className="submit-btn"
                style={{ maxWidth: '200px', margin: '0 auto' }}
              >
                Return to Directory
              </button>
            </div>
          );
        }
        return (
          <AdminPanel 
            professionals={professionals} 
            onApprove={handleApprove}
            onToggleFeatured={handleToggleFeatured}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            onEditProfile={handleAdminEditProfile}
          />
        );
      case 'campaign':
        if (!isAdminUser(currentUser)) {
          return (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', minHeight: '40vh' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-burgundy)', marginBottom: '1rem' }}>Access Denied</h2>
              <p style={{ color: 'var(--text-charcoal-muted)', marginBottom: '2rem' }}>You do not have permission to access the campaign builder.</p>
              <button 
                onClick={() => navigateTo('/')}
                className="submit-btn"
                style={{ maxWidth: '200px', margin: '0 auto' }}
              >
                Return to Directory
              </button>
            </div>
          );
        }
        return <EmailGenerator professionals={professionals} />;
      default:
        return <DirectoryView professionals={professionals} searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedTech={selectedTech} onSelectTech={handleSelectTech} />;
    }
  };

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <header className={`main-header ${!scrolled ? 'header-hidden' : ''}`}>
        <div className="header-inner">
          <div className="brand" onClick={() => navigateTo('/')} style={{ cursor: 'pointer' }}>
            <img src="/logo.png" alt="New Mexico Beauty Collective" className="header-logo" />
          </div>
          {currentView === 'directory' && (
            <div className="header-search-container">
              <button 
                onClick={() => newsletterDialogRef.current?.showModal()}
                className="header-newsletter-btn"
                aria-label="Open newsletter signup dialog"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="header-newsletter-icon">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span>Newsletter</span>
              </button>

              <input 
                type="text" 
                placeholder="Search professional directory..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="header-search-input"
              />
              <div className="header-social-links">
                <a 
                  href="https://www.facebook.com/profile.php?id=61566309933979" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="header-social-link"
                  title="Facebook"
                  aria-label="Facebook"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a 
                  href="https://www.instagram.com/newmexicobeautycollective/?next=%2Fdaniel_paterno_hair%2F" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="header-social-link"
                  title="Instagram"
                  aria-label="Instagram"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Dynamic View Content */}
      <main style={{ flexGrow: 1, paddingBottom: '4rem' }}>
        {renderContent()}
      </main>

      {/* Shared Elevated Footer */}
      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-about">
            <h3>New Mexico Beauty Collective</h3>
            <p>
              An elevated circular of independent wellness, fashion, photography, and beauty specialists. We unite list builders and promote reciprocal exposure across the Duke City.
            </p>
          </div>
          
          <div className="footer-links">
            <h3>Professionals</h3>
            <ul>
              <li><button onClick={() => navigateTo('/')} style={{ color: 'var(--bg-cream)', opacity: 0.8, fontSize: '0.9rem', textAlign: 'left' }}>Web Registry</button></li>
              <li><button onClick={() => navigateTo('/profile')} style={{ color: 'var(--bg-cream)', opacity: 0.8, fontSize: '0.9rem', textAlign: 'left' }}>My Profile</button></li>
              <li>
                <a 
                  href="https://sites.google.com/view/newmexicobeautycollective" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ color: 'var(--bg-cream)', opacity: 0.8, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-block', padding: '1px 0' }}
                >
                  Plans and Programs
                </a>
              </li>
              {isAdminUser(currentUser) && (
                <li><button onClick={() => navigateTo('/admin')} style={{ color: 'var(--bg-cream)', opacity: 0.8, fontSize: '0.9rem', textAlign: 'left' }}>Listing Moderation (Admin)</button></li>
              )}
              {isAdminUser(currentUser) && (
                <li><button onClick={() => navigateTo('/campaign')} style={{ color: 'var(--bg-cream)', opacity: 0.8, fontSize: '0.9rem', textAlign: 'left' }}>Campaign Builder</button></li>
              )}
            </ul>
          </div>

          <div className="footer-promo">
            <h3>Grow Your Collective</h3>
            <p>
              Are you white-labeling, reselling, or managing custom list systems for other local service groups? This software integrates both elements seamlessly.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            &copy; 2026 New Mexico Beauty Collective. Curated for local independent professionals.
          </div>
          <div className="footer-meta-container">
            <div className="footer-social-links">
              <a 
                href="https://facebook.com/profile.php?id=61566309933979" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-social-link"
                title="Facebook"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/newmexicobeautycollective/?next=%2Fdaniel_paterno_hair%2F" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-social-link"
                title="Instagram"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
            <span className="footer-separator">&bull;</span>
            <span style={{ color: 'var(--accent-gold)' }}>Privacy & Compliance Certified</span>
          </div>
        </div>
      </footer>
      
      {/* Floating Anonymous Feedback Widget */}
      <FeedbackButton />

      {/* Floating Newsletter Widget */}
      <NewsletterButton parentDialogRef={newsletterDialogRef} />
    </div>
  );
}
