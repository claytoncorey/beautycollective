import React from 'react';

export default function AdminPanel({ professionals, onApprove, onToggleFeatured, onToggleStatus, onDelete, onEditProfile }) {
  const pendingTechs = professionals.filter(t => t.status === 'pending');
  const activeTechs = professionals.filter(t => t.status === 'active');
  const featuredCount = professionals.filter(t => t.isFeatured && t.status === 'active').length;

  const getCategoryLabel = (catId) => {
    const labels = {
      'hair': 'Hair',
      'face-skin': 'Face & Skin',
      'photography': 'Photography',
      'health-wellness': 'Health & Wellness',
      'lifestyle': 'Lifestyle',
      'fashion': 'Fashion'
    };
    return labels[catId] || catId;
  };

  return (
    <div className="admin-container">
      {/* Admin Header / KPI Grid */}
      <div className="admin-header-row">
        <div>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)' }}>Collective Management</h2>
          <p style={{ color: 'var(--text-charcoal-muted)' }}>Approve applications, toggle features, and manage active directories.</p>
        </div>
        
        {/* Statistics Cards */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{
            background: 'var(--bg-white)',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-muted)',
            textAlign: 'center',
            minWidth: '100px'
          }}>
            <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-charcoal-muted)' }}>Active</span>
            <strong style={{ fontSize: '1.75rem', color: 'var(--primary-burgundy)' }}>{activeTechs.length}</strong>
          </div>
          <div style={{
            background: 'var(--bg-white)',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-muted)',
            textAlign: 'center',
            minWidth: '100px'
          }}>
            <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-charcoal-muted)' }}>Pending</span>
            <strong style={{ fontSize: '1.75rem', color: 'var(--color-pending)' }}>{pendingTechs.length}</strong>
          </div>
          <div style={{
            background: 'var(--bg-white)',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-muted)',
            textAlign: 'center',
            minWidth: '100px'
          }}>
            <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-charcoal-muted)' }}>Featured</span>
            <strong style={{ fontSize: '1.75rem', color: 'var(--accent-gold)' }}>{featuredCount}</strong>
          </div>
        </div>
      </div>

      {/* 1. Approval Queue */}
      <div style={{ marginBottom: '3rem' }}>
        <h3 className="section-label">Pending Approval Queue ({pendingTechs.length})</h3>
        {pendingTechs.length === 0 ? (
          <div style={{
            background: 'var(--bg-white)',
            padding: '2rem',
            borderRadius: '8px',
            border: '1px dashed var(--border-muted)',
            textAlign: 'center',
            color: 'var(--text-charcoal-muted)'
          }}>
            No pending submissions at this time.
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Professional / Business</th>
                  <th>Specialty</th>
                  <th>Category</th>
                  <th>Contact Info</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingTechs.map(tech => (
                  <tr key={tech.id}>
                    <td className="tech-cell">
                      <img src={tech.imageUrl} alt={tech.name} className="tech-avatar" />
                      <div>
                        <strong>{tech.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-charcoal-muted)' }}>{tech.businessName}</div>
                      </div>
                    </td>
                    <td>{tech.specialty}</td>
                    <td>{getCategoryLabel(tech.category)}</td>
                    <td>
                      <div>{tech.phone}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-charcoal-muted)' }}>{tech.email}</div>
                    </td>
                    <td>
                      <button 
                        onClick={() => onApprove(tech.id)} 
                        className="admin-action-btn approve"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => onDelete(tech.id)} 
                        className="admin-action-btn delete"
                      >
                        Decline
                      </button>
                      <button 
                        onClick={() => onEditProfile(tech.email)} 
                        className="admin-action-btn edit"
                        style={{ backgroundColor: 'var(--accent-gold-light)', color: 'var(--primary-burgundy)', marginLeft: '6px' }}
                      >
                        Edit Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. Active Directory */}
      <div>
        <h3 className="section-label">Active Listing Directory ({activeTechs.length})</h3>
        {activeTechs.length === 0 ? (
          <div style={{
            background: 'var(--bg-white)',
            padding: '2rem',
            borderRadius: '8px',
            border: '1px dashed var(--border-muted)',
            textAlign: 'center',
            color: 'var(--text-charcoal-muted)'
          }}>
            No active listings. Approved professionals will appear here.
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Professional / Business</th>
                  <th>Specialty</th>
                  <th>Category</th>
                  <th>Status Controls</th>
                  <th>Premium Upgrades</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeTechs.map(tech => (
                  <tr key={tech.id}>
                    <td className="tech-cell">
                      <img src={tech.imageUrl} alt={tech.name} className="tech-avatar" />
                      <div>
                        <strong>{tech.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-charcoal-muted)' }}>{tech.businessName}</div>
                      </div>
                    </td>
                    <td>{tech.specialty}</td>
                    <td>{getCategoryLabel(tech.category)}</td>
                    <td>
                      <button 
                        onClick={() => onToggleStatus(tech.id, 'pending')}
                        className="admin-action-btn approve"
                        style={{ backgroundColor: 'var(--accent-gold-light)', color: 'var(--text-charcoal)' }}
                        title="Move back to pending/draft status to temporarily suspend directory listing"
                      >
                        Archive/Suspend
                      </button>
                    </td>
                    <td>
                      <button 
                        onClick={() => onToggleFeatured(tech.id)} 
                        className={`admin-action-btn feature ${tech.isFeatured ? 'active' : ''}`}
                      >
                        {tech.isFeatured ? '★ Featured Spotlight' : '☆ Promote to Featured'}
                      </button>
                    </td>
                    <td>
                      <button 
                        onClick={() => onEditProfile(tech.email)} 
                        className="admin-action-btn edit"
                        style={{ backgroundColor: 'var(--accent-gold-light)', color: 'var(--primary-burgundy)', marginRight: '6px' }}
                      >
                        Edit Details
                      </button>
                      <button 
                        onClick={() => onDelete(tech.id)} 
                        className="admin-action-btn delete"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
