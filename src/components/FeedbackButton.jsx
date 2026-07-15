import React, { useState, useEffect, useRef } from 'react';
import { dbService } from '../firebase';

export default function FeedbackButton() {
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const dialogRef = useRef(null);

  // Character limit validation
  const maxChars = 1000;
  const isFeedbackValid = feedback.trim().length > 0 && feedback.length <= maxChars;

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

  // Listen to close events to reset form state
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      setFeedback('');
      setStatus('idle');
      setErrorMessage('');
    };

    dialog.addEventListener('close', handleClose);
    return () => {
      dialog.removeEventListener('close', handleClose);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFeedbackValid) return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      await dbService.addFeedback(feedback.trim());
      setStatus('success');
      // Auto close after 2.5 seconds on success
      setTimeout(() => {
        handleClose();
      }, 2500);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setStatus('error');
      setErrorMessage('We encountered an error saving your feedback. Please try again.');
    }
  };

  return (
    <>
      {/* Floating Pill Button */}
      <button 
        onClick={handleOpen} 
        className="floating-feedback-btn"
        aria-label="Open feedback dialog"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="feedback-btn-icon">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>Feedback</span>
      </button>

      {/* Feedback Dialog */}
      <dialog 
        ref={dialogRef}
        id="feedback-dialog"
        closedby="any" 
        aria-labelledby="feedback-dialog-title"
        className="feedback-dialog-container"
      >
        <div className="feedback-dialog-inner">
          {/* Close button inside dialog */}
          <button 
            type="button" 
            onClick={handleClose} 
            className="feedback-dialog-close-btn"
            aria-label="Close dialog"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {status !== 'success' ? (
            <>
              <h2 id="feedback-dialog-title" className="feedback-dialog-title">Share Your Feedback</h2>
              <p className="feedback-dialog-subtitle">
                Help us improve the New Mexico Beauty Collective. Your suggestions and feedback are completely anonymous.
              </p>

              <form onSubmit={handleSubmit} className="feedback-form">
                <div className="feedback-textarea-wrapper">
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us what's on your mind... (e.g. bug reports, feature requests, registry suggestions)"
                    maxLength={maxChars}
                    disabled={status === 'submitting'}
                    className="feedback-textarea"
                    rows="5"
                    required
                  />
                  <div className={`feedback-char-count ${feedback.length >= maxChars - 50 ? 'limit-warning' : ''}`}>
                    {feedback.length} / {maxChars}
                  </div>
                </div>

                {status === 'error' && (
                  <div className="feedback-error-msg">
                    {errorMessage}
                  </div>
                )}

                <div className="feedback-dialog-actions">
                  <button 
                    type="button" 
                    onClick={handleClose} 
                    className="btn-feedback-cancel"
                    disabled={status === 'submitting'}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-feedback-submit"
                    disabled={!isFeedbackValid || status === 'submitting'}
                  >
                    {status === 'submitting' ? (
                      <span className="feedback-loading-wrapper">
                        <span className="feedback-spinner"></span>
                        Submitting...
                      </span>
                    ) : (
                      'Submit'
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="feedback-success-state">
              <svg viewBox="0 0 24 24" width="64" height="64" stroke="var(--accent-gold)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="feedback-success-icon">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <h2 className="feedback-dialog-title success">Thank You!</h2>
              <p className="feedback-dialog-subtitle">
                Your feedback has been successfully submitted. We appreciate your time and help in making the registry better.
              </p>
            </div>
          )}
        </div>
      </dialog>

      {/* Embedded Component CSS for portability and absolute encapsulation */}
      <style>{`
        /* Floating Button Styling */
        .floating-feedback-btn {
          position: fixed;
          bottom: 2rem;
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

        .floating-feedback-btn:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 8px 30px rgba(103, 49, 71, 0.4), 0 4px 12px rgba(0, 0, 0, 0.12);
          background: linear-gradient(135deg, var(--primary-burgundy-hover) 0%, var(--primary-burgundy) 100%);
        }

        .floating-feedback-btn:active {
          transform: translateY(-1px) scale(0.98);
        }

        .feedback-btn-icon {
          transition: transform 0.3s ease;
        }

        .floating-feedback-btn:hover .feedback-btn-icon {
          transform: rotate(5deg) scale(1.1);
        }

        /* Native Dialog Box styling */
        .feedback-dialog-container {
          border: none;
          background: transparent;
          max-width: 500px;
          width: 90%;
          margin: auto;
          padding: 0;
          overflow: visible;
          border-radius: var(--radius-md);
        }

        /* Styling the ::backdrop */
        .feedback-dialog-container::backdrop {
          background-color: rgba(44, 37, 35, 0.4);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          animation: fade-in 0.3s ease-out forwards;
        }

        /* Dialog inner content box */
        .feedback-dialog-inner {
          background: var(--bg-white);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-md);
          padding: 2.25rem 2rem;
          box-shadow: var(--shadow-lg);
          position: relative;
          color: var(--text-charcoal);
          font-family: var(--font-sans);
          animation: slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        /* Close Button styling */
        .feedback-dialog-close-btn {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          color: var(--text-charcoal-muted);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .feedback-dialog-close-btn:hover {
          background-color: var(--accent-gold-light);
          color: var(--primary-burgundy);
          transform: rotate(90deg);
        }

        /* Dialog Content Typography */
        .feedback-dialog-title {
          font-family: var(--font-serif);
          font-size: 1.8rem;
          font-weight: 600;
          color: var(--primary-burgundy);
          margin-bottom: 0.5rem;
          padding-right: 1.5rem;
        }

        .feedback-dialog-title.success {
          margin-top: 1rem;
        }

        .feedback-dialog-subtitle {
          color: var(--text-charcoal-muted);
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }

        /* Form Styling */
        .feedback-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .feedback-textarea-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .feedback-textarea {
          width: 100%;
          background-color: var(--bg-cream);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-sm);
          padding: 1rem;
          color: var(--text-charcoal);
          font-family: var(--font-sans);
          font-size: 0.95rem;
          resize: vertical;
          min-height: 120px;
          transition: var(--transition-smooth);
          outline: none;
        }

        .feedback-textarea:focus {
          border-color: var(--primary-burgundy);
          background-color: var(--bg-white);
          box-shadow: 0 0 0 3px rgba(103, 49, 71, 0.1);
        }

        .feedback-textarea:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .feedback-char-count {
          align-self: flex-end;
          font-size: 0.8rem;
          color: var(--text-charcoal-muted);
          margin-top: 0.4rem;
        }

        .feedback-char-count.limit-warning {
          color: var(--color-danger);
          font-weight: 500;
        }

        .feedback-error-msg {
          background-color: var(--color-danger-bg);
          color: var(--color-danger);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          border-left: 3px solid var(--color-danger);
        }

        /* Actions buttons layout */
        .feedback-dialog-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .btn-feedback-cancel {
          padding: 0.7rem 1.25rem;
          border-radius: var(--radius-sm);
          color: var(--text-charcoal);
          font-weight: 500;
          font-size: 0.95rem;
          border: 1px solid var(--border-muted);
          background-color: var(--bg-white);
          transition: var(--transition-smooth);
        }

        .btn-feedback-cancel:hover:not(:disabled) {
          background-color: var(--bg-cream);
          border-color: var(--text-charcoal-muted);
        }

        .btn-feedback-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-feedback-submit {
          padding: 0.7rem 1.5rem;
          border-radius: var(--radius-sm);
          color: var(--bg-cream);
          font-weight: 500;
          font-size: 0.95rem;
          background-color: var(--primary-burgundy);
          border: 1px solid var(--primary-burgundy);
          box-shadow: var(--shadow-sm);
          transition: var(--transition-smooth);
        }

        .btn-feedback-submit:hover:not(:disabled) {
          background-color: var(--primary-burgundy-hover);
          border-color: var(--primary-burgundy-hover);
          box-shadow: 0 4px 12px rgba(103, 49, 71, 0.2);
        }

        .btn-feedback-submit:disabled {
          background-color: var(--accent-gold-light);
          border-color: var(--border-muted);
          color: var(--text-charcoal-muted);
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Success screen animations */
        .feedback-success-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1.5rem 0.5rem;
        }

        .feedback-success-icon {
          animation: scale-up-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          margin-bottom: 1rem;
        }

        /* Spinner for loading state */
        .feedback-loading-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .feedback-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: fb-spin 0.8s linear infinite;
        }

        /* Animations */
        @keyframes fb-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

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

        @keyframes scale-up-bounce {
          0% { 
            opacity: 0; 
            transform: scale(0.3); 
          }
          70% { 
            opacity: 0.8; 
            transform: scale(1.1); 
          }
          100% { 
            opacity: 1; 
            transform: scale(1); 
          }
        }

        /* Responsive */
        @media (max-width: 480px) {
          .floating-feedback-btn {
            bottom: 1.5rem;
            right: 1.5rem;
            padding: 0.65rem 1.1rem;
            font-size: 0.9rem;
          }

          .feedback-dialog-inner {
            padding: 1.75rem 1.25rem;
          }

          .feedback-dialog-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}
