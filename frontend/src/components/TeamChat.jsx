import React, { useEffect, useState, useRef } from 'react';
import { Send, ArrowLeft } from 'lucide-react';

export const TeamChat = ({ teamRequest, currentUser, authFetch, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const fetchMessages = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await authFetch(`/api/team-requests/${teamRequest.id}/chat`);
      if (res.ok) {
        const d = await res.json();
        setMessages(d.messages || []);
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchMessages(true);

    // Setup polling every 3 seconds
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [teamRequest.id]);

  useEffect(() => {
    // Auto-scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageTextToSend = newMessage;
    setNewMessage('');

    // Optimistically add message to UI
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      teamRequestId: teamRequest.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderEmail: currentUser.email,
      senderAvatar: currentUser.avatar,
      messageText: messageTextToSend,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await authFetch(`/api/team-requests/${teamRequest.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageText: messageTextToSend })
      });
      if (!res.ok) {
        console.error('Failed to send message');
        // Rollback optimistic message on failure
        setMessages((prev) => prev.filter(m => m.id !== optimisticMsg.id));
      } else {
        // Fetch to sync with server ids
        fetchMessages(false);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages((prev) => prev.filter(m => m.id !== optimisticMsg.id));
    }
  };

  return (
    <div 
      className="glass-card" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'calc(100vh - 220px)', 
        minHeight: '450px',
        maxHeight: '650px',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Sticky Header */}
      <div 
        style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid var(--border-color)', 
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          zIndex: 10
        }}
      >
        <button 
          onClick={onBack} 
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Hub</span>
        </button>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>
            💬 Team Chat: {teamRequest.title}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Category: {teamRequest.category} • Team Members Only
          </span>
        </div>
      </div>

      {/* Messages View Area */}
      <div 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '20px', 
          background: 'var(--bg-page)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {loading && messages.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
            No messages yet. Send a message to start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.senderId === currentUser.id;
            return (
              <div 
                key={msg.id} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: isSelf ? 'flex-end' : 'flex-start',
                  maxWidth: '70%',
                  alignSelf: isSelf ? 'flex-end' : 'flex-start'
                }}
              >
                {/* Sender details */}
                <span 
                  style={{ 
                    fontSize: '0.7rem', 
                    color: 'var(--text-muted)', 
                    marginBottom: '4px',
                    marginLeft: isSelf ? 0 : '4px',
                    marginRight: isSelf ? '4px' : 0
                  }}
                >
                  {isSelf ? 'You' : msg.senderName} ({msg.senderEmail})
                </span>
                
                {/* Bubble */}
                <div 
                  style={{ 
                    padding: '10px 14px', 
                    borderRadius: '16px', 
                    borderBottomRightRadius: isSelf ? '4px' : '16px',
                    borderBottomLeftRadius: isSelf ? '16px' : '4px',
                    background: isSelf ? 'var(--srm-blue)' : '#e2e8f0', 
                    color: isSelf ? '#ffffff' : 'var(--text-main)',
                    fontSize: '0.875rem',
                    lineHeight: '1.4',
                    boxShadow: 'var(--shadow-sm)',
                    wordBreak: 'break-word'
                  }}
                >
                  {msg.messageText}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <form 
        onSubmit={handleSendMessage}
        style={{ 
          padding: '16px 20px', 
          borderTop: '1px solid var(--border-color)', 
          background: '#ffffff',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}
      >
        <input 
          type="text" 
          placeholder="Type your message here..." 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="form-input"
          style={{ flex: 1, padding: '10px 14px' }}
        />
        <button 
          type="submit" 
          className="btn btn-primary"
          style={{ background: 'var(--primary)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
