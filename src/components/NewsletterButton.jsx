import React, { useEffect, useRef } from 'react';

export default function NewsletterButton({ parentDialogRef }) {
  const localDialogRef = useRef(null);
  const dialogRef = parentDialogRef || localDialogRef;

  // Add the Safari click-outside light-dismiss fallback when the modal is mounted
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleSafariLightDismiss = (event) => {
      // If the browser supports closedBy natively, let the browser handle it
      if ('closedBy' in HTMLDialogElement.prototype) return;
      
      // If the target is the dialog itself (the backdrop), check coordinates
      if (event.target !== dialog) return;

      const rect = dialog.getBoundingClientRect();
      const isDialogContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );

      if (!isDialogContent) {
        dialog.close();
      }
    };

    dialog.addEventListener('click', handleSafariLightDismiss);
    return () => {
      dialog.removeEventListener('click', handleSafariLightDismiss);
    };
  }, []);

  const handleOpen = () => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  };

  const handleClose = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
  };

  return (
    <>
      {/* Floating Pill Button for Newsletter */}
      <button 
        onClick={handleOpen} 
        className="floating-newsletter-btn"
        aria-label="Open newsletter signup dialog"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="newsletter-btn-icon">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
        <span>Newsletter</span>
      </button>

      {/* Newsletter Dialog */}
      <dialog 
        ref={dialogRef}
        id="newsletter-dialog"
        closedby="any" 
        aria-labelledby="newsletter-dialog-title"
        className="newsletter-dialog-container"
      >
        <div className="newsletter-dialog-inner">
          {/* Close button inside dialog */}
          <button 
            type="button" 
            onClick={handleClose} 
            className="newsletter-dialog-close-btn"
            aria-label="Close dialog"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <h2 id="newsletter-dialog-title" className="sr-only">Newsletter Signup</h2>
          
          <iframe
            src="https://confirmsubscription.com/h/r/EE3B5E043F77EA252540EF23F30FEDED"
            title="Subscribe to the New Mexico Beauty Collective Newsletter"
            className="newsletter-iframe"
            loading="lazy"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </dialog>

      {/* Embedded Component CSS for portability and absolute encapsulation */}
      <style>{`
        /* Floating Button Styling */
        .floating-newsletter-btn {
          position: fixed;
          bottom: 5.5rem; /* Stacked above feedback button */
          right: 2rem;
          z-index: 999;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, var(--primary-burgundy) 0%, #7d3f59 100%);
          color: var(--bg-cream);
          padding: 0.75rem 1.25rem;
          border-radius: 50px;
          font-family: var(--font-sans);
          font-size: 0.95rem;
          font-weight: 500;
          box-shadow: 0 4px 20px rgba(103, 49, 71, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .floating-newsletter-btn:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 8px 30px rgba(103, 49, 71, 0.4), 0 4px 12px rgba(0, 0, 0, 0.12);
          background: linear-gradient(135deg, var(--primary-burgundy-hover) 0%, var(--primary-burgundy) 100%);
        }

        .floating-newsletter-btn:active {
          transform: translateY(-1px) scale(0.98);
        }

        .newsletter-btn-icon {
          transition: transform 0.3s ease;
        }

        .floating-newsletter-btn:hover .newsletter-btn-icon {
          transform: translateY(-1px) scale(1.1);
        }

        /* Native Dialog Box styling */
        .newsletter-dialog-container {
          border: none;
          background: transparent;
          max-width: 600px;
          width: 90%;
          margin: auto;
          padding: 0;
          overflow: visible;
          border-radius: var(--radius-md);
        }

        /* Styling the ::backdrop */
        .newsletter-dialog-container::backdrop {
          background-color: rgba(44, 37, 35, 0.4);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          animation: fade-in 0.3s ease-out forwards;
        }

        /* Dialog inner content box */
        .newsletter-dialog-inner {
          background: #e8dde3; /* Match the Campaign Monitor form background color for unified styling */
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-md);
          padding: 0;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          position: relative;
          color: var(--text-charcoal);
          font-family: var(--font-sans);
          animation: slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          height: 650px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
        }

        /* Close Button styling */
        .newsletter-dialog-close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          color: #8b1a68; /* Burgundy matching CM theme */
          background-color: rgba(255, 255, 255, 0.75);
          border: 1px solid rgba(139, 26, 104, 0.25);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-smooth);
          z-index: 10;
        }

        .newsletter-dialog-close-btn:hover {
          background-color: #8b1a68;
          color: var(--bg-cream);
          transform: rotate(90deg);
        }

        /* Screen reader only utility class */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        /* Iframe styling */
        .newsletter-iframe {
          border: none;
          width: 100%;
          flex-grow: 1;
          height: 100%;
          display: block;
          background: transparent;
        }

        /* Animations */
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        /* Responsive */
        @media (max-width: 480px) {
          .floating-newsletter-btn {
            bottom: 4.75rem; /* Stacked above feedback button on mobile */
            right: 1.5rem;
            padding: 0.65rem 1.1rem;
            font-size: 0.9rem;
          }

          .newsletter-dialog-inner {
            border-radius: var(--radius-sm);
            height: 80vh;
          }
        }
      `}</style>
    </>
  );
}
