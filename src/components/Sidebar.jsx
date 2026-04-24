import { Plus, MessageSquare, Clock, RotateCcw } from 'lucide-react';

const Sidebar = ({ sessions, activeSession, onSessionSelect, onNewChat, onRefresh, isLoading }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={onNewChat}>
          <Plus size={20} />
          <span>Nuevo Chat</span>
        </button>
      </div>

      <div className="sidebar-content">
        <div className="sidebar-section-title">
          <Clock size={14} />
          <span>Recientes</span>
        </div>
        
        <div className="sessions-list">
          <div className="sidebar-placeholder">
            <Clock size={24} className="placeholder-icon" />
            <p>Próximamente se mostrarán las conversaciones anteriores</p>
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-badge">
          <div className="user-avatar">F</div>
          <span>Fernando</span>
        </div>
      </div>

      <style jsx="true">{`
        .sidebar {
          width: 300px;
          height: 100vh;
          background: var(--bg-dark);
          border-right: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          z-index: 20;
          transition: all 0.3s ease;
        }

        .sidebar-header {
          padding: 24px 16px;
        }

        .new-chat-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: var(--surface-dark);
          color: var(--text-main);
          border: 1px solid var(--glass-border);
          padding: 12px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .new-chat-btn:hover {
          background: var(--surface-light);
          border-color: var(--primary);
        }

        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding: 0 12px;
        }

        .sidebar-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px 12px;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sidebar-placeholder {
          padding: 32px 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          color: var(--text-muted);
          background: rgba(24, 24, 27, 0.4);
          border-radius: 16px;
          border: 1px dashed var(--glass-border);
          margin-top: 8px;
        }

        .placeholder-icon {
          opacity: 0.3;
          color: var(--primary);
        }

        .sidebar-placeholder p {
          font-size: 0.8rem;
          line-height: 1.5;
          margin: 0;
        }

        .sessions-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--glass-border);
        }

        .user-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          border-radius: 8px;
          background: var(--glass);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8rem;
        }

        .user-badge span {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-main);
        }

        @media (max-width: 768px) {
          .sidebar {
            position: absolute;
            left: -300px;
          }
          /* Podríamos añadir lógica para togglear el sidebar aquí */
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
