import React, { useState, useRef, useEffect } from 'react';
import { Send, Calendar, Sparkles, Menu } from 'lucide-react';
import MessageBubble from './components/MessageBubble';
import ErrorModal from './components/ErrorModal';
import Sidebar from './components/Sidebar';

function App() {
  const [activeSession, setActiveSession] = useState(() => {
    return localStorage.getItem('activeSession') || "fernando_test_01";
  });
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [messages, setMessages] = useState([
    { text: "Hola Fernando, ¿qué agendamos hoy?", isUser: false }
  ]);
  const [messagesCache, setMessagesCache] = useState(() => {
    const saved = localStorage.getItem('messagesCache');
    return saved ? JSON.parse(saved) : {};
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [error, setError] = useState({ show: false, title: "", message: "" });

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Persist sessions and activeSession
  useEffect(() => {
    localStorage.setItem('sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('activeSession', activeSession);
  }, [activeSession]);

  useEffect(() => {
    localStorage.setItem('messagesCache', JSON.stringify(messagesCache));
  }, [messagesCache]);

  // Fetch Session List (History) on Mount - Disabled for now
  /*
  useEffect(() => {
    if (sessions.length === 0) {
      fetchHistory();
    }
  }, []);
  */

  // Handle Session Change
  useEffect(() => {
    if (activeSession) {
      loadSessionMessages(activeSession);
    }
  }, [activeSession]);

  const fetchHistory = async () => {
    if (isHistoryLoading) return;
    setIsHistoryLoading(true);
    try {
      // Endpoint: Listar Chats (obtener-mensajes)
      const response = await fetch('https://fjbs.app.n8n.cloud/webhook/obtener-mensajes');
      const text = await response.text();

      if (text) {
        const data = JSON.parse(text);
        // Filtro de unicidad para evitar el error de keys duplicadas
        setSessions(prev => {
          const combined = Array.isArray(data) ? [...data, ...prev] : prev;
          return Array.from(new Map(combined.map(s => [s.sessionId || s.session_id, s])).values());
        });
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.warn("Error en fetchHistory, usando caché o vacío");
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const loadSessionMessages = async (sessionId) => {
    if (sessionId.startsWith('new_')) {
      setMessages([{ text: "¡Hola! Soy tu asistente. ¿Qué actividad deseas registrar?", isUser: false }]);
      return;
    }

    if (messagesCache[sessionId]) {
      setMessages(messagesCache[sessionId]);
      return;
    }

    setIsLoading(true);
    try {
      // Endpoint: Ver Historial (usa sessionId)
      const response = await fetch(`https://fjbs.app.n8n.cloud/webhook/ver-historial?sessionId=${sessionId}`);
      const text = await response.text();

      if (text) {
        const data = JSON.parse(text);
        const records = Array.isArray(data) ? data : [data];

        const mappedMessages = records.map(msg => ({
          text: msg.title || msg.content || msg.text || "Mensaje sin contenido",
          isUser: msg.role === 'user'
        }));

        setMessages(mappedMessages);
        setMessagesCache(prev => ({ ...prev, [sessionId]: mappedMessages }));
      } else {
        setMessages([{ text: "No hay mensajes en esta sesión.", isUser: false }]);
      }
    } catch (err) {
      console.error("Error cargando mensajes:", err);
      setMessages([{ text: "Error al recuperar la conversación.", isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const newId = `new_${crypto.randomUUID()}`;
    setActiveSession(newId);
    setMessages([{ text: "¡Hola! Soy tu asistente. ¿Qué actividad deseas registrar?", isUser: false }]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    const isFirstMessageInSession = activeSession.startsWith('new_');
    const sessionIdToUse = activeSession;

    setInput("");
    const newMessages = [...messages, { text: userMessage, isUser: true }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      console.log("Enviando mensaje a n8n:", { sessionId: sessionIdToUse, message: userMessage });
      
      // Endpoint: Chat Agente
      const response = await fetch('https://fjbs.app.n8n.cloud/webhook/calendar-agent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          sessionId: sessionIdToUse,
          message: userMessage
        })
      });

      console.log("Status de respuesta:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error del servidor:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      console.log("Respuesta cruda de n8n:", text);
      
      if (!text) throw new Error("El servidor envió una respuesta vacía");

      const data = JSON.parse(text);

      if (data && data.output) {
        const updatedMessages = [...newMessages, { text: data.output, isUser: false }];
        setMessages(updatedMessages);

        // Update cache for this session
        setMessagesCache(prev => ({ ...prev, [sessionIdToUse]: updatedMessages }));

        if (isFirstMessageInSession) {
          const newSessionEntry = {
            sessionId: sessionIdToUse,
            title: userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : ''),
            date: new Date().toISOString().split('T')[0]
          };
          setSessions(prev => {
            const combined = [newSessionEntry, ...prev];
            const unique = Array.from(new Map(combined.map(s => [s.sessionId, s])).values());
            return unique;
          });
        }
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (err) {
      setError({
        show: true,
        title: "Error de Conexión",
        message: "No se pudo conectar con el agente. Los mensajes no se están guardando en la base de datos."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchHistory();
    // Optionally clear cache if we want a full refresh
    setMessagesCache({});
    localStorage.removeItem('messagesCache');
  };

  return (
    <div className="layout">
      <Sidebar
        sessions={sessions}
        activeSession={activeSession}
        onSessionSelect={setActiveSession}
        onNewChat={handleNewChat}
        onRefresh={handleRefresh}
        isLoading={isHistoryLoading}
      />

      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="brand">
            <div className="icon-container">
              <Calendar className="brand-icon" size={24} />
            </div>
            <div>
              <h1>Calendar AI Agent</h1>
              <p className="status">
                <span className="status-dot"></span>
                Sesión: <span className="session-id-display">{activeSession}</span>
              </p>
            </div>
          </div>
          <div className="header-actions">
            <Sparkles size={20} className="sparkle-icon" />
          </div>
        </header>

        {/* Chat Area */}
        <main className="chat-area">
          <div className="chat-content">
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} message={msg.text} isUser={msg.isUser} />
            ))}
            {isLoading && (
              <div className="loading-indicator">
                <span></span><span></span><span></span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </main>

        {/* Input Area */}
        <footer className="input-area">
          <div className="input-wrapper">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu mensaje para agendar..."
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={isLoading ? 'loading' : ''}
            >
              <Send size={20} />
            </button>
          </div>
        </footer>

        {/* Error Modal */}
        <ErrorModal
          isOpen={error.show}
          onClose={() => setError({ ...error, show: false })}
          title={error.title}
          message={error.message}
        />
      </div>

      <style jsx="true">{`
        .layout {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background-color: var(--bg-dark);
        }

        .app-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          background: radial-gradient(circle at top right, rgba(249, 115, 22, 0.03), transparent 40%);
        }

        .app-header {
          padding: 16px 24px;
          background: rgba(24, 24, 27, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 10;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .icon-container {
          background: rgba(249, 115, 22, 0.1);
          padding: 8px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-icon {
          color: var(--primary);
        }

        .session-id-display {
          color: var(--primary);
          font-family: var(--mono);
          font-weight: 500;
        }

        .app-header h1 {
          font-size: 1rem;
          font-weight: 700;
          margin: 0;
        }

        .status {
          font-size: 0.7rem;
          margin: 0;
          color: var(--text-muted);
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background-color: var(--success);
          border-radius: 50%;
          display: inline-block;
          margin-right: 6px;
        }

        .sparkle-icon {
          color: #fbbf24;
        }

        .chat-area {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .chat-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .input-area {
          padding: 24px;
          background: var(--bg-dark);
        }

        .input-wrapper {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          gap: 12px;
          background: var(--surface-dark);
          padding: 6px 6px 6px 20px;
          border-radius: 100px;
          border: 1px solid var(--glass-border);
        }

        .input-wrapper:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.1);
        }

        .input-wrapper input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-main);
          outline: none;
        }

        .input-wrapper button {
          background: var(--primary);
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .loading-indicator {
          display: flex;
          gap: 4px;
          padding: 12px 18px;
          background: var(--surface-dark);
          border-radius: 20px;
          border-bottom-left-radius: 4px;
          width: fit-content;
        }

        .loading-indicator span {
          width: 6px;
          height: 6px;
          background: var(--text-muted);
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .loading-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .loading-indicator span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}</style>
    </div>
  );
}

export default App;
