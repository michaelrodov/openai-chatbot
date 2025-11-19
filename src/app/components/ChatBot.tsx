"use client";

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

export default function ChatBot() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! 👋",
      sender: 'bot',
      timestamp: new Date()
    },
    {
      id: '2',
      text: "I'm here to help make travelling with 12Go a great experience! 😊",
      sender: 'bot',
      timestamp: new Date()
    },
    {
      id: '3',
      text: "Feel free to ask any questions about your trip!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const sendMessage = async () => {
    if (!messageInput.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageInput,
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const messageText = messageInput;
    setMessageInput('');
    setIsLoading(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'text/plain',
        'X-llm-provider': 'openai',
        'X-is-firewalled': 'true',
        'X-Stream': 'true'
      };

      const response = await fetch('/api/question', {
        method: 'POST',
        headers,
        body: messageText,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';
        const botMessageId = (Date.now() + 1).toString();

        // Create initial empty bot message
        const initialBotMessage: Message = {
          id: botMessageId,
          text: '',
          sender: 'bot',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, initialBotMessage]);

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  break;
                }
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.text) {
                    accumulatedText += parsed.text;
                    // Update the message incrementally
                    setChatMessages(prev =>
                      prev.map(msg =>
                        msg.id === botMessageId
                          ? { ...msg, text: accumulatedText }
                          : msg
                      )
                    );
                  }
                } catch {
                  // Skip malformed JSON
                }
              }
            }
          }
        } catch (streamError) {
          console.error('Error reading stream:', streamError);
          throw streamError;
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, there was an error processing your message. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    sendMessage();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.3;
          }
          40% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
      `}</style>

      {/* Floating Chat Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            backgroundColor: '#7cb342',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          💬 Need help?
        </button>
      )}

      {/* Chat Window */}
      {chatOpen && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '50ch',
          height: '50vh',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* Chat Header */}
          <div style={{
            backgroundColor: '#7cb342',
            color: 'white',
            padding: '1rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%234a5f4a'/%3E%3Ctext x='50' y='70' font-size='60' text-anchor='middle' fill='white' font-family='Arial'%3E🤖%3C/text%3E%3C/svg%3E"
                  alt="Support"
                  style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.1rem' }}>
                  Gedera Rails
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                  Customer Service
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '0.25rem'
              }}>⊝</button>
              <button style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '0.25rem'
              }}>⊗</button>
              <button
                onClick={() => setChatOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  padding: '0.25rem',
                  lineHeight: 1
                }}
              >×</button>
            </div>
          </div>

          {/* Date Badge */}
          <div style={{
            textAlign: 'center',
            padding: '0.75rem',
            backgroundColor: '#f5f5f5'
          }}>
            <span style={{
              backgroundColor: '#e0e0e0',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.75rem',
              color: '#666'
            }}>
              WED, 21:00
            </span>
          </div>

          {/* Chat Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            backgroundColor: '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {chatMessages.map((message) => (
              <div key={message.id} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.sender === 'bot' ? 'flex-start' : 'flex-end'
              }}>
                {message.sender === 'bot' && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#4a5f4a',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem'
                    }}>🤖</div>
                    <div style={{
                      backgroundColor: '#7cb342',
                      color: 'white',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      borderTopLeftRadius: '4px',
                      maxWidth: '80%',
                      fontSize: '0.9rem',
                      lineHeight: 1.4
                    }}>
                      {message.text}
                    </div>
                  </div>
                )}
                {message.sender === 'user' && (
                  <div style={{
                    backgroundColor: '#e8f5e9',
                    color: '#333',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    borderTopRightRadius: '4px',
                    maxWidth: '80%',
                    fontSize: '0.9rem',
                    lineHeight: 1.4
                  }}>
                    {message.text}
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#4a5f4a',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem'
                }}>🤖</div>
                <div style={{
                  backgroundColor: '#7cb342',
                  color: 'white',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  borderTopLeftRadius: '4px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  gap: '0.25rem'
                }}>
                  <span style={{ animation: 'bounce 1.4s ease-in-out 0s infinite both' }}>.</span>
                  <span style={{ animation: 'bounce 1.4s ease-in-out 0.1s infinite both' }}>.</span>
                  <span style={{ animation: 'bounce 1.4s ease-in-out 0.2s infinite both' }}>.</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />

            {chatMessages.length > 0 && (
              <>
                <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '-0.5rem' }}>
                  Sent {formatTime(chatMessages[chatMessages.length - 1]?.timestamp)}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <button style={{
                    background: 'none',
                    border: '1px solid #ddd',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem'
                  }}>👍</button>
                  <button style={{
                    background: 'none',
                    border: '1px solid #ddd',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem'
                  }}>👎</button>
                </div>
              </>
            )}
          </div>

          {/* Chat Input */}
          <div style={{
            padding: '1rem',
            borderTop: '1px solid #e0e0e0',
            backgroundColor: 'white',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            <button style={{
              background: 'none',
              border: 'none',
              color: '#999',
              cursor: 'pointer',
              fontSize: '1.5rem',
              padding: '0.25rem'
            }}>+</button>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Write your message..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #e0e0e0',
                borderRadius: '20px',
                fontSize: '0.9rem',
                outline: 'none'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || isLoading}
              style={{
                backgroundColor: (!messageInput.trim() || isLoading) ? '#9ca3af' : '#7cb342',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                color: 'white',
                cursor: (!messageInput.trim() || isLoading) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}
            >
              {isLoading ? '...' : '➤'}
            </button>
            <button style={{
              background: 'none',
              border: '1px solid #e0e0e0',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: '#999',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>⋯</button>
          </div>
        </div>
      )}
    </>
  );
}
