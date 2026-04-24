import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

const ErrorModal = ({ isOpen, onClose, title, message }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="modal-content"
          >
            <div className="modal-header">
              <div className="error-icon-bg">
                <AlertCircle className="error-icon" size={24} />
              </div>
              <button onClick={onClose} className="close-btn">
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <h3>{title || 'Error Detectado'}</h3>
              <p>{message || 'Hubo un problema al procesar tu solicitud. Por favor intenta de nuevo.'}</p>
            </div>
            
            <div className="modal-footer">
              <button onClick={onClose} className="retry-btn">
                Entendido
              </button>
            </div>
          </motion.div>

          <style jsx="true">{`
            .modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.7);
              backdrop-filter: blur(8px);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
              padding: 20px;
            }
            .modal-content {
              background: var(--surface-dark);
              border: 1px solid var(--glass-border);
              border-radius: 20px;
              width: 100%;
              max-width: 400px;
              overflow: hidden;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
            .modal-header {
              padding: 20px 20px 10px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .error-icon-bg {
              background: rgba(239, 68, 68, 0.1);
              padding: 12px;
              border-radius: 12px;
            }
            .error-icon {
              color: var(--error);
            }
            .close-btn {
              background: transparent;
              border: none;
              color: var(--text-muted);
              cursor: pointer;
              padding: 5px;
              border-radius: 50%;
              transition: all 0.2s;
            }
            .close-btn:hover {
              background: var(--glass);
              color: var(--text-main);
            }
            .modal-body {
              padding: 0 24px 24px;
            }
            .modal-body h3 {
              font-size: 1.25rem;
              font-weight: 600;
              margin-bottom: 8px;
              color: var(--text-main);
            }
            .modal-body p {
              color: var(--text-muted);
              font-size: 0.95rem;
            }
            .modal-footer {
              padding: 0 24px 24px;
            }
            .retry-btn {
              width: 100%;
              background: var(--surface-light);
              border: 1px solid var(--glass-border);
              color: var(--text-main);
              padding: 12px;
              border-radius: 12px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
            }
            .retry-btn:hover {
              background: var(--surface-light);
              border-color: var(--primary);
              transform: translateY(-1px);
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ErrorModal;
