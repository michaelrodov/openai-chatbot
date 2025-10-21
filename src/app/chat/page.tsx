'use client';

import { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Keyframe animations
const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Styled Components
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  max-height: 100vh;
  background-color: #f3f4f6;
  padding: 1rem;
  font-size: 0.785rem; /* 14px */  
  
`;

const ChatBox = styled.div`
  width: 100%;  
  max-width: 1024px;
  height: 90vh;
  margin: 1rem  auto;
  max-height: 100%;
  background-color: #fdfafa;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  background-color: #059669;
  color: white;
  padding: 12px 16px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  background-color: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
`;

const HeaderTitle = styled.h1`
  font-weight: 600;
  font-size: 14px;
  margin: 0;
`;

const HeaderStatus = styled.p`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
`;

const HeaderRight = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 12px;
  user-select: none;
`;

const ToggleSwitch = styled.div<{ $checked: boolean }>`
  position: relative;
  width: 40px;
  height: 20px;
  background-color: ${props => props.$checked ? '#10b981' : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 10px;
  transition: background-color 0.2s;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.$checked ? '22px' : '2px'};
    width: 16px;
    height: 16px;
    background-color: white;
    border-radius: 50%;
    transition: left 0.2s;
  }
`;

const ToggleInput = styled.input`
  display: none;
`;

const Select = styled.select`
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  outline: none;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }

  option {
    background-color: #059669;
    color: white;
  }
`;

const SelectLabel = styled.span`
  font-size: 12px;
  margin-right: 4px;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageRow = styled.div<{ $isUser: boolean }>`
  display: flex;
  justify-content: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled.div<{ $isUser: boolean }>`
  max-width: 400px;
  padding: 8px 12px;
  border-radius: 16px;
  position: relative;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  background-color: ${props => props.$isUser ? '#059669' : 'white'};
  color: ${props => props.$isUser ? 'white' : '#374151'};
  border: ${props => props.$isUser ? 'none' : '1px solid #e5e7eb'};
  border-bottom-right-radius: ${props => props.$isUser ? '4px' : '16px'};
  border-bottom-left-radius: ${props => props.$isUser ? '16px' : '4px'};
`;

const MessageText = styled.div<{ $isUser: boolean }>`
  line-height: 1.5;
  word-break: break-word;
  margin: 0;

  /* Markdown styling */
  h1, h2, h3, h4, h5, h6 {
    margin: 0.5em 0 0.3em 0;
    font-weight: 600;
  }

  h1 { font-size: 1.5em; }
  h2 { font-size: 1.3em; }
  h3 { font-size: 1.1em; }
  h4, h5, h6 { font-size: 1em; }

  p {
    margin: 0.5em 0;
    &:first-child { margin-top: 0; }
    &:last-child { margin-bottom: 0; }
  }

  code {
    background-color: ${props => props.$isUser ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9em;
  }

  pre {
    background-color: ${props => props.$isUser ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
    padding: 0.8em;
    border-radius: 6px;
    overflow-x: auto;
    margin: 0.5em 0;

    code {
      background-color: transparent;
      padding: 0;
    }
  }

  ul, ol {
    margin: 0.5em 0;
    padding-left: 1.5em;
  }

  li {
    margin: 0.2em 0;
  }

  blockquote {
    border-left: 3px solid ${props => props.$isUser ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'};
    padding-left: 1em;
    margin: 0.5em 0;
    font-style: italic;
  }

  strong {
    font-weight: 600;
  }

  em {
    font-style: italic;
  }

  a {
    color: ${props => props.$isUser ? 'rgba(255, 255, 255, 0.9)' : '#059669'};
    text-decoration: underline;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 0.5em 0;
    font-size: 0.9em;
  }

  th, td {
    border: 1px solid ${props => props.$isUser ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'};
    padding: 0.3em 0.6em;
    text-align: left;
  }

  th {
    background-color: ${props => props.$isUser ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
    font-weight: 600;
  }
`;

const TimestampContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 4px;
  gap: 4px;
`;

const Timestamp = styled.span<{ $isUser: boolean }>`
  font-size: 12px;
  color: ${props => props.$isUser ? 'rgba(255, 255, 255, 0.7)' : '#6b7280'};
`;

const CheckmarkIcon = styled.svg`
  width: 12px;
  height: 12px;
  color: rgba(255, 255, 255, 0.7);
`;

const CheckmarkContainer = styled.div`
  display: flex;
  gap: 2px;
`;

const LoadingBubble = styled.div`
  max-width: 300px;
  padding: 8px 12px;
  border-radius: 16px;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;
`;

const LoadingDot = styled.div<{ $delay: number }>`
  width: 8px;
  height: 8px;
  background-color: #9ca3af;
  border-radius: 50%;
  animation: ${bounce} 1.4s ease-in-out ${props => props.$delay}s infinite both;
`;

const EmptyStateContainer = styled.div`
  text-align: center;
  color: #6b7280;
  margin-top: 32px;
`;

const EncryptionNotice = styled.div`
  background-color: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 12px;
  margin: 0 16px 16px;
  font-size: 12px;
  color: #92400e;
`;

const InputContainer = styled.div`
  background-color: white;
  border-top: 1px solid #e5e7eb;
  padding: 12px 16px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const InputForm = styled.form`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
`;

const InputWrapper = styled.div`
  flex: 1;
  background-color: #f3f4f6;
  border-radius: 20px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
`;

const MessageInput = styled.input`
  flex: 1;
  outline: none;
  background-color: transparent;
  font-size: 14px;
  border: none;
`;

const SendButton = styled.button<{ $disabled: boolean }>`
  width: 40px;
  height: 40px;
  background-color: ${props => props.$disabled ? '#9ca3af' : '#059669'};
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.$disabled ? '#9ca3af' : '#047857'};
  }
`;

const SendIcon = styled.svg`
  width: 20px;
  height: 20px;
  transform: rotate(90deg);
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFirewalled, setIsFirewalled] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [llmProvider, setLlmProvider] = useState<'openai' | 'azure-openai'>('openai');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputText;
    setInputText('');
    setIsLoading(true);

    // TODO navigate to /api/azure_openai
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'text/plain',
        'X-llm-provider': llmProvider,
      };

      if (isFirewalled) {
        headers['X-is-firewalled'] = 'true';
      }

      if (isStreaming) {
        headers['X-Stream'] = 'true';
      }
      // TODO do something more robust here
      const response = await fetch(llmProvider === 'azure-openai' ? '/api/azure_openai' : '/api/question', {
        method: 'POST',
        headers,
        body: messageText,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText || 'No response received',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, there was an error processing your message. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Container>
      <ChatBox>
        {/* Header */}
        <Header>
          <Avatar>
            <span>AI</span>
          </Avatar>
          <div>
            <HeaderTitle>Chat Assistant</HeaderTitle>
            <HeaderStatus>Online</HeaderStatus>
          </div>
          <HeaderRight>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SelectLabel>Provider:</SelectLabel>
              <Select
                value={llmProvider}
                onChange={(e) => setLlmProvider(e.target.value as 'openai' | 'azure-openai')}
              >
                <option value="openai">OpenAI</option>
                <option value="azure-openai">Azure (OpenAI)</option>
              </Select>
            </div>
            <ToggleLabel>
              <span>Streaming</span>
              <ToggleInput
                type="checkbox"
                checked={isStreaming}
                onChange={(e) => setIsStreaming(e.target.checked)}
              />
              <ToggleSwitch $checked={isStreaming} />
            </ToggleLabel>
            <ToggleLabel>
              <span>Firewalled</span>
              <ToggleInput
                type="checkbox"
                checked={isFirewalled}
                onChange={(e) => setIsFirewalled(e.target.checked)}
              />
              <ToggleSwitch $checked={isFirewalled} />
            </ToggleLabel>
          </HeaderRight>
        </Header>

        {/* Messages Container */}
        <MessagesContainer>
          {messages.length === 0 && (
            <EmptyStateContainer>
              <EncryptionNotice>
                🔒 Messages are end-to-end encrypted. Start a conversation by typing below.
              </EncryptionNotice>
            </EmptyStateContainer>
          )}
          
          {messages.map((message) => (
            <MessageRow key={message.id} $isUser={message.sender === 'user'}>
              <MessageBubble $isUser={message.sender === 'user'}>
                <MessageText $isUser={message.sender === 'user'}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.text}
                  </ReactMarkdown>
                </MessageText>
                <TimestampContainer>
                  <Timestamp $isUser={message.sender === 'user'}>
                    {formatTime(message.timestamp)}
                  </Timestamp>
                  {message.sender === 'user' && (
                    <CheckmarkContainer>
                      <CheckmarkIcon fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </CheckmarkIcon>
                      <CheckmarkIcon fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </CheckmarkIcon>
                    </CheckmarkContainer>
                  )}
                </TimestampContainer>
              </MessageBubble>
            </MessageRow>
          ))}
          
          {isLoading && (
            <MessageRow $isUser={false}>
              <LoadingBubble>
                <LoadingDots>
                  <LoadingDot $delay={0} />
                  <LoadingDot $delay={0.1} />
                  <LoadingDot $delay={0.2} />
                </LoadingDots>
              </LoadingBubble>
            </MessageRow>
          )}
          
          <div ref={messagesEndRef} />
        </MessagesContainer>

        {/* Input Form */}
        <InputContainer>
          <InputForm onSubmit={handleSubmit}>
            <InputWrapper>
              <MessageInput
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message here..."
                disabled={isLoading}
              />
            </InputWrapper>
            
            <SendButton
              type="submit"
              $disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <Spinner />
              ) : (
                <SendIcon fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </SendIcon>
              )}
            </SendButton>
          </InputForm>
        </InputContainer>
      </ChatBox>
    </Container>
  );
}