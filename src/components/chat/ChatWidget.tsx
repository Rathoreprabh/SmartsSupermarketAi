'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, X, Send, Loader, Plus, Mic, MicOff, Volume2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  action?: any;
}

export default function ChatWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          console.log('🎤 Voice recognition started');
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          console.log('📝 Transcript:', transcript);
          setInput(transcript);
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error('❌ Recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          console.log('🎤 Voice recognition ended');
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }

      // Initialize speech synthesis
      if (window.speechSynthesis) {
        synthRef.current = window.speechSynthesis;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Start voice recognition
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };

  // Stop voice recognition
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  // Speak text
  const speak = (text: string) => {
    if (synthRef.current && voiceEnabled) {
      // Cancel any ongoing speech
      synthRef.current.cancel();

      // Remove action tags from text
      const cleanText = text.replace(/<ACTION>.*?<\/ACTION>/g, '').trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        console.error('Speech error:', event);
        setIsSpeaking(false);
      };

      synthRef.current.speak(utterance);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle actions from AI
  const handleAction = (action: any) => {
    console.log('🎯 Executing action:', action);

    switch (action.type) {
      case 'navigate':
        console.log('📍 Navigating to:', action.page);
        if (voiceEnabled) {
          speak(`Opening ${action.page} page`);
        }
        setTimeout(() => {
          router.push(`/${action.page}`);
          setIsOpen(false);
        }, 1000);
        break;

      case 'search':
        console.log('🔍 Searching for:', action.query);
        if (voiceEnabled) {
          speak(`Searching for ${action.query}`);
        }
        setTimeout(() => {
          router.push(`/products?search=${encodeURIComponent(action.query)}`);
          setIsOpen(false);
        }, 1000);
        break;

      case 'addToCart':
        console.log('🛒 Adding to cart:', action);
        addToCart(action.productId, action.quantity, action.productName);
        break;

      case 'viewProduct':
        console.log('👀 Viewing product:', action.productId);
        setTimeout(() => {
          router.push(`/products/${action.productId}`);
          setIsOpen(false);
        }, 1000);
        break;

      default:
        console.log('❓ Unknown action type:', action.type);
    }
  };

  // Add product to cart
  const addToCart = async (productId: string, quantity: number, productName: string) => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (data.success) {
        const product = data.products.find((p: any) => p.id === productId);
        
        if (product) {
          const existingCart = localStorage.getItem('cart');
          const cart = existingCart ? JSON.parse(existingCart) : [];

          const existingIndex = cart.findIndex((item: any) => item.id === productId);

          if (existingIndex > -1) {
            cart[existingIndex].quantity += quantity;
          } else {
            cart.push({
              ...product,
              quantity: quantity,
            });
          }

          localStorage.setItem('cart', JSON.stringify(cart));

          const successMsg: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `✅ Added ${quantity}x ${productName} to your cart! Your cart now has ${cart.length} item(s).`,
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, successMsg]);

          if (voiceEnabled) {
            speak(`Added ${quantity} ${productName} to your cart`);
          }

          console.log('✅ Cart updated:', cart);
        } else {
          throw new Error('Product not found');
        }
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Sorry, I couldn't add that to your cart. Please try again.",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage || isLoading) return;

    setInput('');

    // Add user message immediately
    const tempUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.sessionId && !sessionId) {
          setSessionId(data.sessionId);
        }

        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          created_at: new Date().toISOString(),
          action: data.action,
        };
        setMessages((prev) => [...prev, aiMsg]);

        // Speak response if voice enabled
        if (voiceEnabled) {
          speak(data.message);
        }

        // Execute action if present
        if (data.action) {
          handleAction(data.action);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
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

  const startNewChat = () => {
    setMessages([]);
    setSessionId(null);
    stopSpeaking();
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled) {
      stopSpeaking();
    }
  };

  const quickPrompts = [
    "Take me to my cart 🛒",
    "I need organic apples 🍎",
    "Add 2 milk to cart 🥛",
    "Show me all products",
  ];

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition flex items-center justify-center z-50 group"
        >
          <MessageCircle className="w-7 h-7 group-hover:scale-110 transition" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                🤖
              </div>
              <div>
                <h3 className="font-bold">ShopBot AI</h3>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready to help!'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Voice Toggle */}
              <button
                onClick={toggleVoice}
                className={`p-2 rounded-lg transition ${
                  voiceEnabled ? 'bg-green-500/20' : 'hover:bg-white/20'
                }`}
                title={voiceEnabled ? 'Voice Enabled' : 'Voice Disabled'}
              >
                <Volume2 className={`w-5 h-5 ${voiceEnabled ? 'text-green-300' : ''}`} />
              </button>

              {messages.length > 0 && (
                <button
                  onClick={startNewChat}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                  title="New Chat"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  stopSpeaking();
                  stopListening();
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🛒✨🎤</div>
                <h4 className="font-bold text-gray-900 mb-2">
                  Hi! I'm your AI shopping assistant
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Type or speak to me! I can help with shopping, navigation, and more.
                </p>
                <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900 mb-2">
                    🎤 Voice Commands:
                  </p>
                  <p className="text-xs text-blue-700">
                    Click the microphone and say things like "take me to cart" or "add apples"!
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Try saying or typing:
                  </p>
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(prompt);
                        setTimeout(() => sendMessage(prompt), 100);
                      }}
                      className="block w-full text-left px-4 py-2 bg-white rounded-lg hover:bg-blue-50 text-sm text-gray-700 transition border border-gray-200"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.action && (
                      <div className="mt-2 text-xs opacity-75 flex items-center gap-1">
                        {msg.action.type === 'navigate' && '📍 Navigating...'}
                        {msg.action.type === 'search' && '🔍 Searching...'}
                        {msg.action.type === 'addToCart' && '🛒 Adding to cart...'}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200">
                  <Loader className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "Listening..." : "Type or speak..."}
                disabled={isLoading || isListening}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50"
              />
              
              {/* Microphone Button */}
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading}
                className={`px-4 py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Send Button */}
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading || isListening}
                className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            {isListening && (
              <div className="mt-2 flex items-center justify-center gap-2 text-xs text-red-600">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                Recording... Speak now!
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

