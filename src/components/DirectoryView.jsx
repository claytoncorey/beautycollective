import React, { useState, useRef } from 'react';

const getSocialUrl = (platform, value) => {
  if (!value) return '';
  const cleanVal = value.trim();
  if (cleanVal.startsWith('http://') || cleanVal.startsWith('https://')) {
    return cleanVal;
  }
  const username = cleanVal.startsWith('@') ? cleanVal.substring(1) : cleanVal;
  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${username}`;
    case 'facebook':
      return `https://facebook.com/${username}`;
    case 'tiktok':
      return `https://tiktok.com/@${username}`;
    case 'twitter':
      return `https://x.com/${username}`;
    case 'linkedin':
      return `https://linkedin.com/in/${username}`;
    default:
      return '';
  }
};

const CATEGORIES = [
  { id: 'all', label: 'All Experts' },
  { id: 'hair', label: 'Hair' },
  { id: 'face-skin', label: 'Face & Skin' },
  { id: 'photography', label: 'Photography' },
  { id: 'health-wellness', label: 'Health & Wellness' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'fashion', label: 'Fashion' }
];

export default function DirectoryView({ professionals, searchQuery, setSearchQuery, selectedTech, onSelectTech }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const carouselRef = useRef(null);

  const handleScrollLeft = () => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.querySelector('.spotlight-card')?.offsetWidth || 400;
      carouselRef.current.scrollBy({ left: -cardWidth - 24, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.querySelector('.spotlight-card')?.offsetWidth || 400;
      carouselRef.current.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
    }
  };

  // Filter logic
  const filteredTechs = professionals.filter(tech => {
    if (tech.status !== 'active') return false;
    
    const matchesCategory = selectedCategory === 'all' || tech.category === selectedCategory;
    const matchesSearch = 
      tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.specialty.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesCategory && matchesSearch;
  });

  // Separate featured spotlights (slider) from the standard directory listing
  const featuredTechs = filteredTechs.filter(t => t.isFeatured);

  return (
    <div>
      {/* Top Banner Section with Primary Background (Burgundy) */}
      <div className="top-featured-section">
        {/* Hero Section */}
        <section className="directory-hero">
          <div className="hero-logo-wrapper">
            <img src="/logo-white.png" alt="New Mexico Beauty Collective" className="hero-logo" />
          </div>
          <h2>Better Living Through Beauty & Lifestyle</h2>
          <p>Discover Albuquerque's premier curated collection of independent wellness, fashion, and beauty professionals.</p>
        </section>

        {/* Featured Spotlights (Horizontal Slider) */}
        {featuredTechs.length > 0 && (
          <section className="spotlight-section">
            <div className="spotlight-header">
              <h3 className="section-label">Featured Spotlights</h3>
              <div className="carousel-controls">
                <button onClick={handleScrollLeft} className="carousel-arrow prev" aria-label="Previous Featured Profile">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </button>
                <button onClick={handleScrollRight} className="carousel-arrow next" aria-label="Next Featured Profile">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
            <div className="spotlight-carousel-wrapper">
              <div ref={carouselRef} className="spotlight-carousel">
                {featuredTechs.map(tech => (
                  <div key={tech.id} className="spotlight-card scroll-item featured-profile-card">
                    <div className="spotlight-badge">FEATURED</div>
                    
                    {/* Structured 3-Image Collage (Workspace is the largest) */}
                    <div className="tech-img-collage">
                      <div className="collage-main">
                        <img src={tech.businessUrl || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600"} alt="Business workspace" className="collage-img" />
                      </div>
                      <div className="collage-side">
                        <div className="collage-side-top">
                          <img src={tech.imageUrl} alt={tech.name} className="collage-img" />
                        </div>
                        <div className="collage-side-bottom">
                          <img src={tech.logoUrl || "https://i3.createsend1.com/ei/r/23/046/C81/002230/csfinal/thehonestimage-logos-rgb_primary-kliegel_stulips-99000003cf01453c.png"} alt="Business logo" className="collage-img logo-img" />
                        </div>
                      </div>
                    </div>

                    {/* Spotlight Info (Decluttered) */}
                    <div className="spotlight-info">
                      <span className="tech-specialty">{tech.specialty}</span>
                      <h4 className="tech-title">{tech.name}</h4>
                      <span className="tech-business">{tech.businessName}</span>

                      <div className="action-row card-action-row">
                        <button 
                          onClick={() => onSelectTech(tech)} 
                          className="action-btn primary view-profile-btn full-width-btn"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Main Content Area (Cream Background starts here) */}
      <div className="main-content">
        {/* Category Navigation */}
        <div className="category-nav">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Standard Listings (Includes featured profiles as requested) */}
        <section className="listings-section">
          <h3 className="section-label">Professional Directory</h3>
          {filteredTechs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-charcoal-muted)' }}>
              <p style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>No beauty professionals found matching your search.</p>
            </div>
          ) : (
            <div className="standard-grid">
              {filteredTechs.map(tech => (
                <div key={tech.id} className={`tech-card ${tech.isFeatured ? 'featured-spotlight-item' : ''}`}>
                  
                  {/* Structured 3-Image Collage (Workspace is the largest) */}
                  <div className="tech-img-collage">
                    <div className="collage-main">
                      <img src={tech.businessUrl || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600"} alt="Business workspace" className="collage-img" />
                    </div>
                    <div className="collage-side">
                      <div className="collage-side-top">
                        <img src={tech.imageUrl} alt={tech.name} className="collage-img" />
                      </div>
                      <div className="collage-side-bottom">
                        <img src={tech.logoUrl || "https://i3.createsend1.com/ei/r/23/046/C81/002230/csfinal/thehonestimage-logos-rgb_primary-kliegel_stulips-99000003cf01453c.png"} alt="Business logo" className="collage-img logo-img" />
                      </div>
                    </div>
                  </div>

                  {/* Decluttered Card Info */}
                  <div className="tech-info">
                    <span className="tech-specialty">{tech.specialty}</span>
                    <h4 className="tech-title">{tech.name}</h4>
                    <span className="tech-business">{tech.businessName}</span>

                    <div className="action-row card-action-row">
                      <button 
                        onClick={() => onSelectTech(tech)} 
                        className="action-btn primary directory-action-btn"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Responsive Square Details Modal */}
      {selectedTech && (
        <div className="profile-modal-overlay" onClick={() => onSelectTech(null)}>
          <div className="profile-modal-container" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => onSelectTech(null)}
              className="profile-modal-close"
              aria-label="Close modal"
            >
              &times;
            </button>
            <div className="profile-modal-grid">
              {/* Left Column: Square Collage */}
              <div className="profile-modal-image-column">
                <div className="tech-img-collage modal-collage">
                  <div className="collage-main">
                    <img src={selectedTech.businessUrl || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600"} alt="Business workspace" className="collage-img" />
                  </div>
                  <div className="collage-side">
                    <div className="collage-side-top">
                      <img src={selectedTech.imageUrl} alt={selectedTech.name} className="collage-img" />
                    </div>
                    <div className="collage-side-bottom">
                      <img src={selectedTech.logoUrl || "https://i3.createsend1.com/ei/r/23/046/C81/002230/csfinal/thehonestimage-logos-rgb_primary-kliegel_stulips-99000003cf01453c.png"} alt="Business logo" className="collage-img logo-img" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column: Complete Details */}
              <div className="profile-modal-info-column">
                <div className="modal-header-info">
                  <span className="tech-specialty">{selectedTech.specialty}</span>
                  <h3 className="modal-title">{selectedTech.name}</h3>
                  <span className="tech-business">{selectedTech.businessName}</span>
                </div>
                
                <div className="modal-details-scrollable">
                  <h4 className="modal-section-title">About the Expert</h4>
                  <p className="modal-bio">{selectedTech.bio}</p>
                  
                  {selectedTech.specialOffer && (
                    <div className="modal-offer-banner">
                      <strong>Exclusive Offer: </strong>
                      {selectedTech.specialOffer}
                    </div>
                  )}
                  
                  <div className="modal-meta-grid">
                    <div className="modal-meta-item">
                      <span className="meta-label">Phone</span>
                      <strong className="meta-value">{selectedTech.phone}</strong>
                    </div>
                    <div className="modal-meta-item">
                      <span className="meta-label">Email</span>
                      <strong className="meta-value">{selectedTech.email}</strong>
                    </div>
                    <div className="modal-meta-item">
                      <span className="meta-label">Socials</span>
                      <div className="modal-socials-row">
                        {selectedTech.instagram && (
                          <a href={getSocialUrl('instagram', selectedTech.instagram)} target="_blank" rel="noopener noreferrer" className="profile-social-link-icon" title={`Instagram: ${selectedTech.instagram}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                          </a>
                        )}
                        {selectedTech.facebook && (
                          <a href={getSocialUrl('facebook', selectedTech.facebook)} target="_blank" rel="noopener noreferrer" className="profile-social-link-icon" title={`Facebook: ${selectedTech.facebook}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                          </a>
                        )}
                        {selectedTech.tiktok && (
                          <a href={getSocialUrl('tiktok', selectedTech.tiktok)} target="_blank" rel="noopener noreferrer" className="profile-social-link-icon" title={`TikTok: ${selectedTech.tiktok}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                          </a>
                        )}
                        {selectedTech.twitter && (
                          <a href={getSocialUrl('twitter', selectedTech.twitter)} target="_blank" rel="noopener noreferrer" className="profile-social-link-icon" title={`Twitter/X: ${selectedTech.twitter}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                          </a>
                        )}
                        {selectedTech.linkedin && (
                          <a href={getSocialUrl('linkedin', selectedTech.linkedin)} target="_blank" rel="noopener noreferrer" className="profile-social-link-icon" title={`LinkedIn: ${selectedTech.linkedin}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                          </a>
                        )}
                        {!selectedTech.instagram && !selectedTech.facebook && !selectedTech.tiktok && !selectedTech.twitter && !selectedTech.linkedin && (
                          <span className="no-socials">N/A</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <a 
                    href={selectedTech.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="action-btn primary modal-book-btn"
                  >
                    Visit Official Website / Book Now
                  </a>
                  <button 
                    onClick={() => onSelectTech(null)} 
                    className="action-btn secondary modal-close-btn"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
