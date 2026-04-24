import React from 'react';
import { motion } from 'framer-motion';

const MessageBubble = ({ message, isUser }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`message-wrapper ${isUser ? 'user' : 'bot'}`}
    >
      <div className="message-bubble">
        {message}
      </div>

      <style jsx="true">{`
        .message-wrapper {
          display: flex;
          width: 100%;
          margin-bottom: 16px;
        }
        .message-wrapper.user {
          justify-content: flex-end;
        }
        .message-wrapper.bot {
          justify-content: flex-start;
        }
        .message-bubble {
          max-width: 80%;
          padding: 12px 18px;
          border-radius: 20px;
          font-size: 0.95rem;
          line-height: 1.4;
          position: relative;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        .user .message-bubble {
          background: linear-gradient(135deg, var(--primary), var(--primary-hover));
          color: white;
          border-bottom-right-radius: 4px;
        }
        .bot .message-bubble {
          background: var(--surface-dark);
          color: var(--text-main);
          border: 1px solid var(--glass-border);
          border-bottom-left-radius: 4px;
        }
      `}</style>
    </motion.div>
  );
};

export default MessageBubble;
