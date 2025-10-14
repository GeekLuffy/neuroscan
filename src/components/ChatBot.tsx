import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Send, Bot, User, Loader2, Settings } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to validate Gemini API key format
const isValidApiKey = (apiKey: string): boolean => {
  return apiKey.length > 20 && apiKey.startsWith('AIza');
};

export const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose }) => {
  const { settings } = useSettings();
  
  // Use settings API key first, then fall back to environment variable
  const apiKey = settings.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your NeuroScan assistant. I can help you understand the lab tests, interpret results, and answer questions about neurological screening. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Check if API key is configured and valid
    if (!apiKey || apiKey.trim() === '') {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Please configure your Gemini API key in Settings before using the chatbot. You can get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    if (!isValidApiKey(apiKey)) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'The configured API key appears to be invalid. Gemini API keys should start with "AIza" and be longer than 20 characters. Please check your API key in Settings.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Use combined API key (settings or environment)
      const GEMINI_API_KEY = apiKey;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful assistant for NeuroScan, a neurological screening platform. The user asked: "${inputValue}". Please provide a helpful, accurate response about neurological screening, voice analysis, motor function tests, or eye/cognitive assessments. Keep responses concise but informative.`
            }]
          }]
        })
      });

      const data = await response.json();
      const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I encountered an error. Please try again.';

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      let errorContent = 'I apologize, but I\'m having trouble connecting right now. ';
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('403')) {
          errorContent += 'Please check that your Gemini API key is valid and has the necessary permissions.';
        } else if (error.message.includes('429')) {
          errorContent += 'The API rate limit has been exceeded. Please try again in a moment.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorContent += 'Please check your internet connection and try again.';
        } else {
          errorContent += 'Please check your API configuration and try again.';
        }
      } else {
        errorContent += 'Please check your API configuration and try again.';
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorContent,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="glass-card w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2 text-white">
              <Bot className="w-6 h-6 text-purple-400" />
              NeuroScan Assistant
            </CardTitle>
            {!apiKey || apiKey.trim() === '' ? (
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-md">
                <Settings className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-yellow-400">API Key Required</span>
              </div>
            ) : !isValidApiKey(apiKey) ? (
              <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-md">
                <Settings className="w-3 h-3 text-red-400" />
                <span className="text-xs text-red-400">Invalid API Key</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-md">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-400">
                  {settings.geminiApiKey ? 'Connected' : 'Connected (Env)'}
                </span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-purple-400" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-purple-500/20 text-white ml-auto'
                      : 'bg-gray-800/50 text-gray-100'
                  }`}
                >
                  <div className="text-sm leading-relaxed prose prose-invert">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                {message.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>
                <div className="bg-gray-800/50 p-3 rounded-2xl">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                !apiKey || apiKey.trim() === '' 
                  ? "Configure API key in Settings to chat..." 
                  : "Ask me about neurological screening..."
              }
              className="flex-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
              disabled={isLoading || !apiKey || apiKey.trim() === '' || !isValidApiKey(apiKey)}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading || !apiKey || apiKey.trim() === '' || !isValidApiKey(apiKey)}
              className="bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};