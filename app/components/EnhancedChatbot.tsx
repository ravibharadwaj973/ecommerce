'use client';
import { useState, useRef, useEffect, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

// 1. Define the Message interface
interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const QUICK_SUGGESTIONS: string[] = [
  "What products do you have?",
  "How can I track my order?",
  "What's your return policy?",
  "How do I reset my password?",
];

export default function EnhancedChatbot() {
  const { user } = useAuth();
  
  // 2. Add Type Generics to useState
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);

  // 3. FIX: Type the ref as HTMLDivElement to enable scrollIntoView
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Welcome message initialization
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: `Hello${user ? `, ${user.name}` : ''}! I'm your AI assistant. How can I help you today?`,
          isUser: false,
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, user, messages.length]);

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    // Optionally auto-submit here, but setting input is safer for the user
  };

  // 4. Type the event as FormEvent
  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const currentText = inputMessage; // Store locally for the API call
    const userMessage: Message = {
      id: Date.now(),
      text: currentText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setShowSuggestions(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentText }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: Date.now() + 1,
        text: data.reply || "I'm sorry, I couldn't process that.",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble responding right now.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // ... (Header logic)

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all z-50"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
        <h3 className="font-semibold">Support Assistant</h3>
        <button onClick={() => setIsOpen(false)}>×</button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${message.isUser ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 rounded-tl-none'}`}>
                {message.text}
              </div>
            </div>
          ))}
          
          {/* Quick Suggestions UI */}
          {showSuggestions && messages.length <= 1 && (
            <div className="space-y-2 animate-fade-in">
              <p className="text-[10px] uppercase font-bold text-gray-400 text-center tracking-wider">Common Questions</p>
              <div className="grid grid-cols-1 gap-2">
                {QUICK_SUGGESTIONS.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-left p-2 bg-white border border-indigo-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all text-xs text-indigo-700 font-medium"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {isLoading && <div className="text-xs text-gray-400 animate-pulse">Assistant is typing...</div>}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 text-sm border-none bg-gray-100 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            placeholder="Type a message..."
          />
          <button type="submit" className="bg-indigo-600 text-white p-2 rounded-xl">
            Go
          </button>
        </div>
      </form>
    </div>
  );
}