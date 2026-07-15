import React, { useState, useEffect } from 'react';

export default function EmailGenerator({ professionals }) {
  const [campaignTitle, setCampaignTitle] = useState('SUMMER 2026');
  const [introText, setIntroText] = useState(
    'As the season of warmth and vitality begins, we’re thrilled to introduce our curated circle of local independent beauty, wellness, and style experts dedicated to helping you look, feel, and live your best life here in the Land of Enchantment!'
  );
  const [copied, setCopied] = useState(false);
  const [includeResellerBadge, setIncludeResellerBadge] = useState(true);
  const [resellerName, setResellerName] = useState('Clayton Corey Consulting, LLC.');
  const [resellerUrl, setResellerUrl] = useState('https://ClaytonCorey.com');

  const activeTechs = professionals.filter(t => t.status === 'active');
  const featuredTechs = activeTechs.filter(t => t.isFeatured);
  const standardTechs = activeTechs.filter(t => !t.isFeatured);

  // Clean HTML Email Template Generator
  const generateEmailHtml = () => {
    // Generate Featured Techs HTML
    const featuredHtml = featuredTechs.map(tech => `
      <!-- Featured Expert Block -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px; background-color: #ffffff; border: 1px solid #e4dec6; border-radius: 8px; overflow: hidden;">
        <tr>
          <td style="padding: 0;">
            <img src="${tech.imageUrl}" width="600" alt="${tech.name}" style="display: block; width: 100%; max-width: 600px; height: auto; border-bottom: 3px solid #c5a880;" />
          </td>
        </tr>
        <tr>
          <td style="padding: 25px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 11px; text-transform: uppercase; color: #a37285; letter-spacing: 2px; font-weight: bold; padding-bottom: 5px;">
                  ${tech.specialty}
                </td>
              </tr>
              <tr>
                <td style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: bold; color: #673147; padding-bottom: 5px;">
                  ${tech.name}
                </td>
              </tr>
              <tr>
                <td style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 500; color: #6b5f5c; padding-bottom: 15px;">
                  ${tech.businessName}
                </td>
              </tr>
              <tr>
                <td style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #2c2523; padding-bottom: 20px;">
                  ${tech.bio}
                </td>
              </tr>
              ${tech.specialOffer ? `
              <tr>
                <td style="background-color: #f2ede4; border-left: 3px solid #c5a880; padding: 12px 15px; border-radius: 0 4px 4px 0; margin-bottom: 20px; font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 13px; color: #673147;">
                  <strong>Exclusive Offer:</strong> ${tech.specialOffer}
                </td>
              </tr>
              <tr><td height="15"></td></tr>
              ` : ''}
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 15px;">
                    <tr>
                      <td style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 13px; color: #6b5f5c; padding-right: 15px;">
                        <strong>Phone:</strong> ${tech.phone}
                      </td>
                      <td style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 13px; color: #6b5f5c;">
                        <strong>Socials:</strong> ${[
                          tech.instagram ? `Instagram: ${tech.instagram}` : '',
                          tech.facebook ? `Facebook: ${tech.facebook}` : '',
                          tech.tiktok ? `TikTok: ${tech.tiktok}` : '',
                          tech.twitter ? `Twitter: ${tech.twitter}` : '',
                          tech.linkedin ? `LinkedIn: ${tech.linkedin}` : ''
                        ].filter(Boolean).join(', ') || 'N/A'}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-top: 10px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td align="center" bgcolor="#673147" style="border-radius: 4px;">
                        <a href="${tech.website}" target="_blank" style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: bold; color: #ffffff; text-decoration: none; display: block; padding: 12px 20px; border-radius: 4px;">
                          VISIT WEBSITE & BOOK NOW
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `).join('\n');

    // Generate Standard Techs HTML (Structured in clean 2-column layout cells)
    let standardHtml = '';
    for (let i = 0; i < standardTechs.length; i += 2) {
      const tech1 = standardTechs[i];
      const tech2 = standardTechs[i + 1];

      standardHtml += `
      <!-- Standard Directory Row -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 25px;">
        <tr>
          <!-- Column 1 -->
          <td width="285" valign="top" style="background-color: #ffffff; border: 1px solid #e4dec6; border-radius: 6px; overflow: hidden;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <img src="${tech1.imageUrl}" width="285" height="170" alt="${tech1.name}" style="display: block; width: 100%; height: 170px; object-fit: cover;" />
                </td>
              </tr>
              <tr>
                <td style="padding: 15px;">
                  <span style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 10px; text-transform: uppercase; color: #a37285; letter-spacing: 1.5px; font-weight: bold; display: block; padding-bottom: 4px;">
                    ${tech1.specialty}
                  </span>
                  <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: bold; color: #673147; display: block; padding-bottom: 2px;">
                    ${tech1.name}
                  </span>
                  <span style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 12px; color: #6b5f5c; display: block; padding-bottom: 10px;">
                    ${tech1.businessName}
                  </span>
                  <p style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.5; color: #2c2523; height: 75px; overflow: hidden; margin: 0 0 10px 0;">
                    ${tech1.bio}
                  </p>
                  ${tech1.specialOffer ? `
                  <div style="background-color: #f2ede4; border-left: 2px solid #c5a880; padding: 6px 10px; font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 11px; color: #673147; margin-bottom: 12px; font-weight: 500;">
                    ${tech1.specialOffer}
                  </div>
                  ` : ''}
                  <div style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 12px; color: #6b5f5c; padding-bottom: 12px;">
                    <strong>Phone:</strong> ${tech1.phone}
                  </div>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td align="center" bgcolor="#a37285" style="border-radius: 4px;">
                        <a href="${tech1.website}" target="_blank" style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 12px; font-weight: bold; color: #ffffff; text-decoration: none; display: block; padding: 8px 15px; border-radius: 4px;">
                          VISIT SITE
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
          
          <!-- Column Spacer -->
          <td width="30">&nbsp;</td>
          
          <!-- Column 2 (or empty space if odd count) -->
          ${tech2 ? `
          <td width="285" valign="top" style="background-color: #ffffff; border: 1px solid #e4dec6; border-radius: 6px; overflow: hidden;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <img src="${tech2.imageUrl}" width="285" height="170" alt="${tech2.name}" style="display: block; width: 100%; height: 170px; object-fit: cover;" />
                </td>
              </tr>
              <tr>
                <td style="padding: 15px;">
                  <span style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 10px; text-transform: uppercase; color: #a37285; letter-spacing: 1.5px; font-weight: bold; display: block; padding-bottom: 4px;">
                    ${tech2.specialty}
                  </span>
                  <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: bold; color: #673147; display: block; padding-bottom: 2px;">
                    ${tech2.name}
                  </span>
                  <span style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 12px; color: #6b5f5c; display: block; padding-bottom: 10px;">
                    ${tech2.businessName}
                  </span>
                  <p style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.5; color: #2c2523; height: 75px; overflow: hidden; margin: 0 0 10px 0;">
                    ${tech2.bio}
                  </p>
                  ${tech2.specialOffer ? `
                  <div style="background-color: #f2ede4; border-left: 2px solid #c5a880; padding: 6px 10px; font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 11px; color: #673147; margin-bottom: 12px; font-weight: 500;">
                    ${tech2.specialOffer}
                  </div>
                  ` : ''}
                  <div style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 12px; color: #6b5f5c; padding-bottom: 12px;">
                    <strong>Phone:</strong> ${tech2.phone}
                  </div>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td align="center" bgcolor="#a37285" style="border-radius: 4px;">
                        <a href="${tech2.website}" target="_blank" style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 12px; font-weight: bold; color: #ffffff; text-decoration: none; display: block; padding: 8px 15px; border-radius: 4px;">
                          VISIT SITE
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
          ` : `
          <td width="285" valign="top" style="border: none;">&nbsp;</td>
          `}
        </tr>
      </table>
      `;
    }

    // Combine sections into the master template
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Mexico Beauty Collective - ${campaignTitle}</title>
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
    
    /* Global Styles */
    body {
      margin: 0;
      padding: 0;
      min-width: 100%;
      background-color: #f6f4f0;
      font-family: 'Outfit', Helvetica, Arial, sans-serif;
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    table {
      border-collapse: collapse !important;
    }
    
    /* Responsive Styling */
    @media only screen and (max-width: 620px) {
      .email-wrapper {
        width: 100% !important;
        padding: 10px !important;
      }
      .featured-card, .standard-grid-item {
        width: 100% !important;
        display: block !important;
      }
      .two-col-row td {
        display: block !important;
        width: 100% !important;
      }
      .spacer-cell {
        display: none !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f4f0;">
  
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f6f4f0" style="padding: 20px 0;">
    <tr>
      <td align="center">
        
        <!-- Main Email Container (600px Max) -->
        <table class="email-wrapper" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 600px; margin: 0 auto; background-color: #f6f4f0;">
          
          <!-- 1. HEADER SECTION -->
          <tr>
            <td align="center" bgcolor="#673147" style="padding: 35px 20px; border-radius: 8px 8px 0 0; background-image: url('https://i1.createsend1.com/ei/r/23/046/C81/002230/csfinal/BeautyCollectiveheader1.jpg'); background-size: cover; background-position: center;">
              <!-- Logo Image -->
              <img src="https://i1.createsend1.com/ei/r/23/046/C81/002230/csfinal/NMBeautyCollectiveLogoV2White2-990000028a05143c.png" width="380" alt="New Mexico Beauty Collective" style="display: block; width: 100%; max-width: 380px; height: auto; margin-bottom: 20px;" />
              <!-- Subtitle -->
              <div style="font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-size: 16px; color: #f6f4f0; letter-spacing: 0.5px;">
                A Health, Beauty & Lifestyle Resource for Discerning Burques
              </div>
            </td>
          </tr>

          <!-- 2. CAMPAIGN TITLE BAR -->
          <tr>
            <td align="center" bgcolor="#a37285" style="padding: 8px 20px; text-align: center;">
              <span style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 12px; font-weight: bold; color: #f6f4f0; letter-spacing: 3px;">
                * * &nbsp; ${campaignTitle} &nbsp; * *
              </span>
            </td>
          </tr>

          <!-- 3. WELCOME INTRODUCTION -->
          <tr>
            <td bgcolor="#673147" style="padding: 30px 40px; text-align: center; color: #f6f4f0;">
              <h1 style="font-family: 'Playfair Display', Georgia, serif; font-weight: normal; font-size: 24px; color: #f6f4f0; margin: 0 0 12px 0;">
                Support Local, Live Beautifully
              </h1>
              <p style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #f6f4f0; opacity: 0.95; margin: 0;">
                ${introText}
              </p>
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td height="30"></td></tr>

          <!-- 4. FEATURED SPOTLIGHT SECTION (Single, Full Width) -->
          ${featuredTechs.length > 0 ? `
          <tr>
            <td align="left" style="font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: bold; color: #673147; padding-bottom: 15px; border-bottom: 1px solid #e4dec6; margin-bottom: 20px;">
              Featured Spotlights
            </td>
          </tr>
          <tr><td height="15"></td></tr>
          <tr>
            <td>
              ${featuredHtml}
            </td>
          </tr>
          ` : ''}

          <!-- 5. STANDARD DIRECTORY GRID (2-Columns) -->
          ${standardTechs.length > 0 ? `
          <tr><td height="20"></td></tr>
          <tr>
            <td align="left" style="font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: bold; color: #673147; padding-bottom: 15px; border-bottom: 1px solid #e4dec6; margin-bottom: 20px;">
              Local Collective Directory
            </td>
          </tr>
          <tr><td height="15"></td></tr>
          <tr>
            <td>
              ${standardHtml}
            </td>
          </tr>
          ` : ''}

          <!-- Spacer -->
          <tr><td height="30"></td></tr>

          <!-- 6. RESELLER & PROMOTION BANNER -->
          ${includeResellerBadge ? `
          <tr>
            <td style="padding: 0 0 30px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f2ede4; border: 1px dashed #c5a880; border-radius: 8px; text-align: center;">
                <tr>
                  <td style="padding: 20px 30px;">
                    <span style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; color: #673147; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">
                      Looking to grow your client reach?
                    </span>
                    <p style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.5; color: #6b5f5c; margin: 0 0 10px 0;">
                      This shared email collective system and directory was designed and built by <strong>${resellerName}</strong> in partnership with <strong>Paterno Group</strong>. Reach out to get your own branded client circular or custom directory website.
                    </p>
                    <a href="${resellerUrl}" target="_blank" style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 12px; font-weight: bold; color: #673147; text-decoration: underline; padding-right: 15px;">
                      Clayton Corey Consulting &rarr;
                    </a>
                    <a href="https://www.paternogroup.com/" target="_blank" style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 12px; font-weight: bold; color: #673147; text-decoration: underline;">
                      Paterno Group &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- 7. FOOTER SECTION (Anti-Spam & Branding) -->
          <tr>
            <td align="center" bgcolor="#673147" style="padding: 35px 30px; border-radius: 0 0 8px 8px; text-align: center; color: #f6f4f0;">
              <span style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; color: #c5a880; display: block; margin-bottom: 8px;">
                NEW MEXICO BEAUTY COLLECTIVE
              </span>
              <p style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 11px; line-height: 1.5; color: #f6f4f0; opacity: 0.75; margin: 0 0 15px 0;">
                You are receiving this because you are a valued client of one of our registered collective experts who nominated you to discover Albuquerque's leading independent professionals. We respect your privacy and never spam.
              </p>
              
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom: 20px;">
                <tr>
                  <td style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 12px;">
                    <a href="https://newmexicobeautycollective.com" target="_blank" style="color: #f6f4f0; text-decoration: underline; font-weight: 500;">
                      View Live Web Directory
                    </a>
                  </td>
                  <td style="color: #f6f4f0; opacity: 0.5; padding: 0 10px;">|</td>
                  <td style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 12px;">
                    <a href="[unsubscribe]" style="color: #f6f4f0; text-decoration: underline; font-weight: 500;">
                      Unsubscribe Instantly
                    </a>
                  </td>
                </tr>
              </table>
              
              <div style="font-family: 'Outfit', Helvetica, Arial, sans-serif; font-size: 10px; color: #f6f4f0; opacity: 0.5;">
                &copy; 2026 New Mexico Beauty Collective. All Rights Reserved.
              </div>
            </td>
          </tr>

        </table>
        
      </td>
    </tr>
  </table>

</body>
</html>`;
  };

  const [emailHtml, setEmailHtml] = useState('');

  useEffect(() => {
    setEmailHtml(generateEmailHtml());
  }, [campaignTitle, introText, includeResellerBadge, resellerName, resellerUrl, professionals]);

  const handleCopy = () => {
    navigator.clipboard.writeText(emailHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)' }}>Campaign HTML Builder</h2>
          <p style={{ color: 'var(--text-charcoal-muted)' }}>Generate responsive, Campaign Monitor-compatible templates instantly.</p>
        </div>
      </div>

      <div className="generator-split">
        {/* Controls Column */}
        <div className="generator-controls">
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-muted)', paddingBottom: '0.5rem' }}>
            Campaign Configuration
          </h3>

          <div className="form-row">
            <label htmlFor="campaignTitle">Issue/Campaign Title</label>
            <input 
              type="text" 
              id="campaignTitle"
              value={campaignTitle}
              onChange={(e) => setCampaignTitle(e.target.value.toUpperCase())}
              placeholder="e.g. SPRING 2025"
            />
          </div>

          <div className="form-row">
            <label htmlFor="introText">Welcome Message Copy</label>
            <textarea 
              id="introText"
              rows="4"
              value={introText}
              onChange={(e) => setIntroText(e.target.value)}
              placeholder="Write the introduction paragraph of the email..."
            />
          </div>

          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-muted)', paddingBottom: '0.5rem', marginTop: '2.5rem' }}>
            White-Label Reseller Settings
          </h3>

          <div className="control-item">
            <div>
              <strong>Include Design Business Promotion</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-charcoal-muted)' }}>Promote your design agency in the email footer</div>
            </div>
            <label className="badge-toggle">
              <input 
                type="checkbox" 
                checked={includeResellerBadge} 
                onChange={(e) => setIncludeResellerBadge(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {includeResellerBadge && (
            <>
              <div className="form-row" style={{ marginTop: '1rem' }}>
                <label htmlFor="resellerName">Design Business Name</label>
                <input 
                  type="text" 
                  id="resellerName"
                  value={resellerName}
                  onChange={(e) => setResellerName(e.target.value)}
                />
              </div>
              <div className="form-row">
                <label htmlFor="resellerUrl">Portfolio URL</label>
                <input 
                  type="url" 
                  id="resellerUrl"
                  value={resellerUrl}
                  onChange={(e) => setResellerUrl(e.target.value)}
                />
              </div>
            </>
          )}

          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-muted)', paddingBottom: '0.5rem', marginTop: '2.5rem' }}>
            Layout Distribution
          </h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-charcoal-muted)', lineHeight: '1.5' }}>
            <p style={{ marginBottom: '0.5rem' }}>Based on your active directory, the layout will render as:</p>
            <ul style={{ paddingLeft: '1.25rem' }}>
              <li><strong>Featured Spotlight Cards (Large banner, top):</strong> <span style={{ color: 'var(--primary-burgundy)', fontWeight: 'bold' }}>{featuredTechs.length} tech(s)</span></li>
              <li><strong>Directory Grid Items (2-column, below):</strong> <span style={{ color: 'var(--secondary-rose)', fontWeight: 'bold' }}>{standardTechs.length} tech(s)</span></li>
            </ul>
            <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>Modify these roles in the "Collective Management" tab by toggling the "Promote to Featured" button.</p>
          </div>
        </div>

        {/* Preview / Code Column */}
        <div className="generator-preview">
          <div className="preview-header-row">
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }}>Compiled Campaign</h3>
            <button 
              onClick={handleCopy} 
              className="action-btn primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', width: 'fit-content' }}
            >
              {copied ? '✓ Copied to Clipboard!' : 'Copy Raw HTML'}
            </button>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem' }}>HTML Code Output (Paste into Campaign Monitor)</label>
            <textarea 
              className="code-textarea"
              readOnly
              value={emailHtml}
              onClick={(e) => e.target.select()}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem' }}>Visual Email Preview</label>
            <iframe 
              className="iframe-preview"
              title="Campaign Monitor Template Preview"
              srcDoc={emailHtml}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
