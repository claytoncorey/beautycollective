import React, { useState, useEffect } from 'react';
import { dbService, authService, storageService } from '../firebase';

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
  { id: 'hair', label: 'Hair' },
  { id: 'face-skin', label: 'Face & Skin' },
  { id: 'photography', label: 'Photography' },
  { id: 'health-wellness', label: 'Health & Wellness' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'fashion', label: 'Fashion' }
];

export default function MyProfile({ currentUser, onSignOut, adminEditingEmail, onCancelEdit }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBusinessPhoto, setUploadingBusinessPhoto] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const ADMIN_EMAILS = ['dpaterno@gmail.com', 'clayton.corey@icloud.com'];
  const isAdmin = currentUser && currentUser.email && ADMIN_EMAILS.includes(currentUser.email.toLowerCase());
  const targetEmail = (isAdmin && adminEditingEmail) ? adminEditingEmail : (currentUser ? currentUser.email : '');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    specialty: '',
    category: 'hair',
    phone: '',
    email: targetEmail,
    website: '',
    bio: '',
    imageUrl: '',
    businessUrl: '',
    logoUrl: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    twitter: '',
    linkedin: '',
    specialOffer: '',
    consentChecked: false,
    listConsentChecked: false
  });

  useEffect(() => {
    async function fetchProfile() {
      if (!currentUser) return;
      try {
        setLoading(true);
        const userProfile = await dbService.getProfessionalByEmail(targetEmail);
        if (userProfile) {
          setProfile(userProfile);
          setFormData({
            name: userProfile.name || '',
            businessName: userProfile.businessName || '',
            specialty: userProfile.specialty || '',
            category: userProfile.category || 'hair',
            phone: userProfile.phone || '',
            email: userProfile.email || targetEmail,
            website: userProfile.website || '',
            bio: userProfile.bio || '',
            imageUrl: userProfile.imageUrl || '',
            businessUrl: userProfile.businessUrl || '',
            logoUrl: userProfile.logoUrl || '',
            instagram: userProfile.instagram || '',
            facebook: userProfile.facebook || '',
            tiktok: userProfile.tiktok || '',
            twitter: userProfile.twitter || '',
            linkedin: userProfile.linkedin || '',
            specialOffer: userProfile.specialOffer || '',
            consentChecked: true, // Already consented since they exist
            listConsentChecked: true
          });
        } else {
          setProfile(null);
          setFormData({
            name: '',
            businessName: '',
            specialty: '',
            category: 'hair',
            phone: '',
            email: targetEmail,
            website: '',
            bio: '',
            imageUrl: '',
            businessUrl: '',
            logoUrl: '',
            instagram: '',
            facebook: '',
            tiktok: '',
            twitter: '',
            linkedin: '',
            specialOffer: '',
            consentChecked: false,
            listConsentChecked: false
          });
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [currentUser, targetEmail]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMsg('');
    setSuccessMsg('');

    const MAX_SIZE = 1024 * 1024; // 1 MB
    if (file.size > MAX_SIZE) {
      setErrorMsg('Portrait image size exceeds the 1 MB limit. Please compress it or select a smaller image.');
      return;
    }

    setUploadingImage(true);
    try {
      const downloadUrl = await storageService.uploadProfessionalFile(targetEmail, 'portraits', file);
      setFormData(prev => ({
        ...prev,
        imageUrl: downloadUrl
      }));
      setSuccessMsg('Portrait image uploaded successfully.');
    } catch (err) {
      console.error("Portrait upload failed:", err);
      setErrorMsg(err.message || 'Portrait upload failed. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMsg('');
    setSuccessMsg('');

    const MAX_SIZE = 1024 * 1024; // 1 MB
    if (file.size > MAX_SIZE) {
      setErrorMsg('Logo badge image size exceeds the 1 MB limit. Please compress it or select a smaller image.');
      return;
    }

    setUploadingLogo(true);
    try {
      const downloadUrl = await storageService.uploadProfessionalFile(targetEmail, 'logos', file);
      setFormData(prev => ({
        ...prev,
        logoUrl: downloadUrl
      }));
      setSuccessMsg('Logo badge uploaded successfully.');
    } catch (err) {
      console.error("Logo upload failed:", err);
      setErrorMsg(err.message || 'Logo upload failed. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBusinessPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMsg('');
    setSuccessMsg('');

    const MAX_SIZE = 1024 * 1024; // 1 MB
    if (file.size > MAX_SIZE) {
      setErrorMsg('Business photo image size exceeds the 1 MB limit. Please compress it or select a smaller image.');
      return;
    }

    setUploadingBusinessPhoto(true);
    try {
      const downloadUrl = await storageService.uploadProfessionalFile(targetEmail, 'businesses', file);
      setFormData(prev => ({
        ...prev,
        businessUrl: downloadUrl
      }));
      setSuccessMsg('Business photo uploaded successfully.');
    } catch (err) {
      console.error("Business photo upload failed:", err);
      setErrorMsg(err.message || 'Business photo upload failed. Please try again.');
    } finally {
      setUploadingBusinessPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.consentChecked) {
      alert("You must agree to the Terms of Service to publish your business profile.");
      return;
    }
    if (!formData.listConsentChecked) {
      alert("You must certify the client list opt-in consent compliance.");
      return;
    }

    setSubmitLoading(true);

    const submissionData = {
      ...formData,
      email: targetEmail,
      imageUrl: formData.imageUrl || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600",
      businessUrl: formData.businessUrl || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600",
      logoUrl: formData.logoUrl || "https://i3.createsend1.com/ei/r/23/046/C81/002230/csfinal/thehonestimage-logos-rgb_primary-kliegel_stulips-99000003cf01453c.png",
      ownerUid: (profile && profile.ownerUid) ? profile.ownerUid : (adminEditingEmail ? 'admin-created' : currentUser.uid)
    };

    try {
      if (profile) {
        // Updating existing profile
        // Keep existing status and isFeatured to maintain integrity
        await dbService.updateProfessional(profile.id, {
          ...submissionData,
          status: profile.status,
          isFeatured: profile.isFeatured
        });
        
        // Refresh local state
        setProfile(prev => ({
          ...prev,
          ...submissionData
        }));
        setSuccessMsg('Your professional listing has been updated successfully!');
        setIsEditing(false);
      } else {
        // Creating new profile (starts as pending)
        const newProfile = await dbService.addProfessional({
          ...submissionData,
          status: 'pending',
          isFeatured: false
        });
        setProfile(newProfile);
        setSuccessMsg('Your profile has been created successfully and is now pending admin review.');
      }
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setErrorMsg('An error occurred while saving your profile: ' + err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      if (onSignOut) onSignOut();
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid var(--border-muted)',
          borderTopColor: 'var(--primary-burgundy)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <span style={{ color: 'var(--text-charcoal-muted)', fontSize: '0.9rem' }}>Fetching Profile Details...</span>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="profile-dashboard-container">
      {adminEditingEmail && (
        <div className="admin-editing-banner" style={{
          background: 'var(--accent-gold-light)',
          border: '1px solid var(--accent-gold)',
          padding: '1.25rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'var(--primary-burgundy)',
          boxSizing: 'border-box'
        }}>
          <div>
            <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>Administrative Edit Mode</h4>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-charcoal)' }}>
              You are currently editing the profile details for: <strong>{adminEditingEmail}</strong>
            </p>
          </div>
          <button 
            type="button" 
            onClick={onCancelEdit} 
            className="admin-action-btn approve"
            style={{ margin: 0, padding: '0.5rem 1rem', fontSize: '0.8rem', backgroundColor: 'var(--primary-burgundy)', color: '#ffffff' }}
          >
            Cancel & Back to Admin
          </button>
        </div>
      )}
      {/* Upper Dashboard Banner */}
      <div className="dashboard-banner">
        <div className="banner-details">
          <h2>Professional Registry Portal</h2>
          <p>Logged in as: <strong style={{ color: 'var(--accent-gold)' }}>{currentUser.email}</strong></p>
        </div>
        <button onClick={handleSignOut} className="dashboard-signout-btn">
          Sign Out
        </button>
      </div>

      {successMsg && <div className="auth-alert alert-success" style={{ margin: '1rem 0' }}>{successMsg}</div>}
      {errorMsg && <div className="auth-alert alert-error" style={{ margin: '1rem 0' }}>{errorMsg}</div>}

      {profile && !isEditing ? (
        /* Profile Summary View */
        <div className="dashboard-profile-card">
          <div className="profile-card-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '1.5rem' }}>
            <div className="profile-card-header-inner" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <img src={profile.businessUrl || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600"} alt="Business Photo" style={{ width: '85px', height: '85px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-muted)' }} />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-charcoal-muted)', marginTop: '4px', fontWeight: '500' }}>Business</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <img src={profile.imageUrl} alt={profile.name} style={{ width: '85px', height: '85px', objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--border-muted)' }} />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-charcoal-muted)', marginTop: '4px', fontWeight: '500' }}>Profile</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <img src={profile.logoUrl} alt="Logo" style={{ width: '85px', height: '85px', objectFit: 'contain', borderRadius: '50%', border: '1px solid var(--border-muted)', backgroundColor: '#ffffff', padding: '4px' }} />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-charcoal-muted)', marginTop: '4px', fontWeight: '500' }}>Logo</div>
                </div>
              </div>
              <div style={{ flex: '1 1 250px' }}>
                <span className="tech-specialty">{profile.specialty}</span>
                <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-burgundy)' }}>{profile.name}</h3>
                <span className="tech-business" style={{ display: 'block', margin: '0.2rem 0' }}>{profile.businessName}</span>
                
                {/* Status Badge */}
                <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {profile.status === 'active' ? (
                    <span className="profile-badge badge-active">✓ Active Registry Listing</span>
                  ) : (
                    <span className="profile-badge badge-pending">⚡ Pending Moderation Approval</span>
                  )}
                  {profile.isFeatured && (
                    <span className="profile-badge badge-featured">★ Featured Spotlight</span>
                  )}
                </div>
              </div>
            </div>
            
            <button onClick={() => setIsEditing(true)} className="action-btn secondary edit-profile-toggle-btn" style={{ alignSelf: 'flex-start' }}>
              Edit Profile Details
            </button>
          </div>

          <div className="profile-card-body">
            <div className="dashboard-bio-section">
              <h4>Bio & Description</h4>
              <p>{profile.bio}</p>
            </div>

            <div className="dashboard-details-grid">
              <div>
                <strong>Category:</strong>
                <span>{CATEGORIES.find(c => c.id === profile.category)?.label || profile.category}</span>
              </div>
              <div>
                <strong>Phone:</strong>
                <span>{profile.phone}</span>
              </div>
              <div>
                <strong>Social Media:</strong>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                  {profile.instagram && (
                    <a href={getSocialUrl('instagram', profile.instagram)} target="_blank" rel="noopener noreferrer" className="profile-social-link-icon" title={`Instagram: ${profile.instagram}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    </a>
                  )}
                  {profile.facebook && (
                    <a href={getSocialUrl('facebook', profile.facebook)} target="_blank" rel="noopener noreferrer" className="profile-social-link-icon" title={`Facebook: ${profile.facebook}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    </a>
                  )}
                  {profile.tiktok && (
                    <a href={getSocialUrl('tiktok', profile.tiktok)} target="_blank" rel="noopener noreferrer" className="profile-social-link-icon" title={`TikTok: ${profile.tiktok}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                    </a>
                  )}
                  {profile.twitter && (
                    <a href={getSocialUrl('twitter', profile.twitter)} target="_blank" rel="noopener noreferrer" className="profile-social-link-icon" title={`Twitter/X: ${profile.twitter}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={getSocialUrl('linkedin', profile.linkedin)} target="_blank" rel="noopener noreferrer" className="profile-social-link-icon" title={`LinkedIn: ${profile.linkedin}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    </a>
                  )}
                  {!profile.instagram && !profile.facebook && !profile.tiktok && !profile.twitter && !profile.linkedin && 'Not linked'}
                </div>
              </div>
              <div>
                <strong>Website / Booking:</strong>
                <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
                  {profile.website}
                </a>
              </div>
              {profile.specialOffer && (
                <div style={{ gridColumn: 'span 2' }} className="offer-banner">
                  <strong>Exclusive Offer:</strong> {profile.specialOffer}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Profile Create / Edit Form */
        <div className="form-card" style={{ marginTop: '1.5rem' }}>
          <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>{profile ? 'Edit Business Details' : 'Create Business Profile'}</h2>
              <p>
                {profile 
                  ? 'Update your salon branding, biography, contact coordinates, and bookings links.'
                  : 'Please build your professional card to show Albuquerque customers what you do.'}
              </p>
            </div>
            {profile && (
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setErrorMsg('');
                  setSuccessMsg('');
                }} 
                className="action-btn secondary"
                style={{ height: 'fit-content', padding: '0.5rem 1rem' }}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="form-body">
            
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-muted)', paddingBottom: '0.5rem' }}>
              1. Basic Details
            </h3>
            
            <div className="form-grid-2">
              <div className="form-row">
                <label htmlFor="name">Full Name *</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Nikki Roiz"
                />
              </div>
              <div className="form-row">
                <label htmlFor="businessName">Salon / Business Name *</label>
                <input 
                  type="text" 
                  id="businessName" 
                  name="businessName" 
                  value={formData.businessName} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Zior Skin & Body"
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-row">
                <label htmlFor="specialty">Specialty *</label>
                <input 
                  type="text" 
                  id="specialty" 
                  name="specialty" 
                  value={formData.specialty} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Aesthetic Skin & Body Therapy"
                />
              </div>
              <div className="form-row">
                <label htmlFor="category">Category *</label>
                <select 
                  id="category" 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-muted)', paddingBottom: '0.5rem', marginTop: '2rem' }}>
              2. Bio & Branding
            </h3>

            <div className="form-row">
              <label htmlFor="bio">Professional Bio *</label>
              <textarea 
                id="bio" 
                name="bio" 
                rows="4" 
                value={formData.bio} 
                onChange={handleChange} 
                required 
                placeholder="Introduce yourself to Albuquerque clients. Mention your background, style, and what makes your salon experience special..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-row">
                <label htmlFor="businessFile">Business Photo (Workspace/Salon) *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
                  <input 
                    type="file" 
                    id="businessFile" 
                    accept="image/*"
                    onChange={handleBusinessPhotoUpload}
                    style={{ padding: '0.6rem', flexGrow: 1 }}
                    disabled={uploadingBusinessPhoto}
                  />
                  {uploadingBusinessPhoto && <div className="spinner-small" style={{ borderTopColor: 'var(--primary-burgundy)' }}></div>}
                </div>
                {formData.businessUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <img src={formData.businessUrl} alt="Business Preview" style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-muted)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-charcoal-muted)' }}>Active Business Photo</span>
                  </div>
                )}
                <p style={{ fontSize: '0.75rem', color: 'var(--text-charcoal-muted)', marginTop: '0.25rem' }}>
                  Upload workspace or interior photo.
                </p>
              </div>

              <div className="form-row">
                <label htmlFor="imageFile">Profile Photo (Headshot) *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
                  <input 
                    type="file" 
                    id="imageFile" 
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ padding: '0.6rem', flexGrow: 1 }}
                    disabled={uploadingImage}
                  />
                  {uploadingImage && <div className="spinner-small" style={{ borderTopColor: 'var(--primary-burgundy)' }}></div>}
                </div>
                {formData.imageUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <img src={formData.imageUrl} alt="Portrait Preview" style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--border-muted)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-charcoal-muted)' }}>Active Profile Photo</span>
                  </div>
                )}
                <p style={{ fontSize: '0.75rem', color: 'var(--text-charcoal-muted)', marginTop: '0.25rem' }}>
                  Upload a headshot portrait.
                </p>
              </div>

              <div className="form-row">
                <label htmlFor="logoFile">Logo Image (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
                  <input 
                    type="file" 
                    id="logoFile" 
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ padding: '0.6rem', flexGrow: 1 }}
                    disabled={uploadingLogo}
                  />
                  {uploadingLogo && <div className="spinner-small" style={{ borderTopColor: 'var(--primary-burgundy)' }}></div>}
                </div>
                {formData.logoUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <img src={formData.logoUrl} alt="Logo Preview" style={{ width: '42px', height: '42px', objectFit: 'contain', borderRadius: '4px', border: '1px solid var(--border-muted)', backgroundColor: '#ffffff', padding: '2px' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-charcoal-muted)' }}>Active Logo</span>
                  </div>
                )}
                <p style={{ fontSize: '0.75rem', color: 'var(--text-charcoal-muted)', marginTop: '0.25rem' }}>
                  Upload a business logo badge.
                </p>
              </div>
            </div>

            {/* URL input fallback */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-row">
                <label htmlFor="businessUrl">Or Business Photo URL (Optional)</label>
                <input 
                  type="text" 
                  id="businessUrl" 
                  name="businessUrl" 
                  value={formData.businessUrl} 
                  onChange={handleChange} 
                  placeholder="https://example.com/business.jpg"
                />
              </div>
              <div className="form-row">
                <label htmlFor="imageUrl">Or Profile Photo URL (Optional)</label>
                <input 
                  type="text" 
                  id="imageUrl" 
                  name="imageUrl" 
                  value={formData.imageUrl} 
                  onChange={handleChange} 
                  placeholder="https://example.com/profile.jpg"
                />
              </div>
              <div className="form-row">
                <label htmlFor="logoUrl">Or Logo URL (Optional)</label>
                <input 
                  type="text" 
                  id="logoUrl" 
                  name="logoUrl" 
                  value={formData.logoUrl} 
                  onChange={handleChange} 
                  />
              </div>
            </div>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-muted)', paddingBottom: '0.5rem', marginTop: '2rem' }}>
              3. Contact & Booking
            </h3>

            <div className="form-grid-2">
              <div className="form-row">
                <label htmlFor="phone">Phone Number *</label>
                <input 
                  type="text" 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  required 
                  placeholder="(505) 555-5555"
                />
              </div>
              <div className="form-row">
                <label htmlFor="email">Business Email (Locked)</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email} 
                  disabled
                  style={{ backgroundColor: '#eae6d8', cursor: 'not-allowed', color: 'var(--text-charcoal-muted)' }}
                />
                <p style={{ fontSize: '0.7rem', color: 'var(--text-charcoal-muted)', marginTop: '0.25rem' }}>
                  Locked to your verified authentication email address.
                </p>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-row">
                <label htmlFor="website">Website / Booking URL *</label>
                <input 
                  type="url" 
                  id="website" 
                  name="website" 
                  value={formData.website} 
                  onChange={handleChange} 
                  required 
                  placeholder="https://yourwebsite.com or Vagaro booking link"
                />
              </div>
              <div className="form-row">
                <label htmlFor="instagram">Instagram Handle</label>
                <input 
                  type="text" 
                  id="instagram" 
                  name="instagram" 
                  value={formData.instagram} 
                  onChange={handleChange} 
                  placeholder="@yourhandle"
                />
              </div>
            </div>

            <div className="form-grid-2" style={{ marginTop: '1rem' }}>
              <div className="form-row">
                <label htmlFor="facebook">Facebook Handle / URL</label>
                <input 
                  type="text" 
                  id="facebook" 
                  name="facebook" 
                  value={formData.facebook || ''} 
                  onChange={handleChange} 
                  placeholder="@yourhandle or profile URL"
                />
              </div>
              <div className="form-row">
                <label htmlFor="tiktok">TikTok Handle</label>
                <input 
                  type="text" 
                  id="tiktok" 
                  name="tiktok" 
                  value={formData.tiktok || ''} 
                  onChange={handleChange} 
                  placeholder="@yourhandle"
                />
              </div>
            </div>

            <div className="form-grid-2" style={{ marginTop: '1rem' }}>
              <div className="form-row">
                <label htmlFor="twitter">Twitter / X Handle</label>
                <input 
                  type="text" 
                  id="twitter" 
                  name="twitter" 
                  value={formData.twitter || ''} 
                  onChange={handleChange} 
                  placeholder="@yourhandle"
                />
              </div>
              <div className="form-row">
                <label htmlFor="linkedin">LinkedIn Profile Handle / URL</label>
                <input 
                  type="text" 
                  id="linkedin" 
                  name="linkedin" 
                  value={formData.linkedin || ''} 
                  onChange={handleChange} 
                  placeholder="yourname or profile URL"
                />
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="specialOffer">Collective Special Offer (Optional)</label>
              <input 
                type="text" 
                id="specialOffer" 
                name="specialOffer" 
                value={formData.specialOffer} 
                onChange={handleChange} 
                placeholder="e.g. $15 off first appointment or free consultation"
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-charcoal-muted)', marginTop: '0.25rem' }}>
                We recommend including a deal to track bookings originating from the collective directory.
              </p>
            </div>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-muted)', paddingBottom: '0.5rem', marginTop: '2rem' }}>
              4. Compliance & Consent (Legal Spam Prevention)
            </h3>

            <div className="checkbox-row">
              <input 
                type="checkbox" 
                id="listConsentChecked" 
                name="listConsentChecked" 
                checked={formData.listConsentChecked} 
                onChange={handleChange}
                required
              />
              <label htmlFor="listConsentChecked">
                <strong>Client List Consent Verification:</strong> I certify that all client emails submitted to this collective for seasonal campaigns have explicitly opted-in to receive promotional updates, or I will use the double-opt-in welcome email sequence. I understand that importing unsolicited lists is strictly prohibited.
              </label>
            </div>

            <div className="checkbox-row" style={{ backgroundColor: 'transparent', borderLeft: 'none', padding: 0 }}>
              <input 
                type="checkbox" 
                id="consentChecked" 
                name="consentChecked" 
                checked={formData.consentChecked} 
                onChange={handleChange}
                required
                style={{ width: '18px', height: '18px', marginTop: '0.15rem' }}
              />
              <label htmlFor="consentChecked" style={{ color: 'var(--text-charcoal)', fontSize: '0.9rem' }}>
                I agree to the New Mexico Beauty Collective Terms of Service and Directory Listing Policies. *
              </label>
            </div>

            <button 
              type="submit" 
              className="submit-btn" 
              disabled={submitLoading || uploadingImage || uploadingLogo || uploadingBusinessPhoto}
            >
              {submitLoading ? 'Saving Profile...' : 
               uploadingImage || uploadingLogo || uploadingBusinessPhoto ? 'Uploading media...' :
               (profile ? 'Update Listing Profile' : 'Apply for Directory Listing')}
            </button>

          </form>
        </div>
      )}
    </div>
  );
}
