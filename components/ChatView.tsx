import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Bot, User } from 'lucide-react';
import { ChatMessage } from '../types';
import { getChatHistory, saveChatMessage, clearChatHistory } from '../services/storageService';
import { getCounselorResponse } from '../services/geminiService';
import { TRANSLATIONS, THEME } from '../constants';

interface ChatViewProps {
  language: 'EN' | 'BN';
}

export const ChatView: React.FC<ChatViewProps> = ({ language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[language];
  const fontClass = language === 'BN' ? 'font-bengali' : 'font-sans';

  // Load history on mount
  useEffect(() => {
    setMessages(getChatHistory());
  }, []);

  // Helper function to scroll to bottom
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Scroll on message change or typing status change
  useEffect(() => {
    // Immediate scroll to bottom
    scrollToBottom();
    // Short delay scroll for layout shifts
    const timeoutId = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      text: inputText,
      sender: 'user',
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    saveChatMessage(userMsg);
    setInputText('');
    setIsTyping(true);

    try {
      const responseText = await getCounselorResponse(userMsg.text, messages, language);
      
      const aiMsg: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        text: responseText,
        sender: 'ai',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMsg]);
      saveChatMessage(aiMsg);
    } catch (error) {
      console.error("Chat Failed:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = () => {
    if (window.confirm(language === 'BN' ? 'আপনি কি পুরো চ্যাট ইতিহাস মুছে ফেলতে চান?' : 'Clear all chat history?')) {
      clearChatHistory();
      setMessages([]);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[#F3F4F6] ${fontClass}`}>
      {/* Header */}
      <div className="bg-white px-6 py-3 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0F5132]/10 flex items-center justify-center text-[#0F5132]">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">{t.chatHeader}</h2>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-gray-400">Online Counselor</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleClear}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          title={t.clearChat}
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Message List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="text-center py-10 px-6 opacity-50">
            <Bot size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-sm leading-relaxed">
              {language === 'BN' 
                ? 'আসসালামু আলাইকুম! আপনার মনে কি কোনো দ্বিধা বা দুঃখ আছে? আমি এখানে আপনাকে সাহায্য করতে আছি।' 
                : 'Assalamu Alaikum! I am here to provide spiritual guidance and support. How are you feeling today?'}
            </p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex items-end gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
               <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-[#0F5132] text-white' : 'bg-white text-gray-400 border'}`}>
                 {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
               </div>
               <div className={`
                 px-4 py-3 rounded-2xl shadow-sm text-sm
                 ${msg.sender === 'user' 
                   ? 'bg-[#0F5132] text-white rounded-br-none' 
                   : 'bg-white text-gray-800 rounded-bl-none'}
               `}>
                 <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                 <span className={`text-[9px] mt-1.5 block opacity-50 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </span>
               </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="flex items-end gap-2 max-w-[85%]">
              <div className="w-6 h-6 rounded-full bg-white text-gray-400 border flex items-center justify-center">
                <Bot size={14} />
              </div>
              <div className="bg-white px-5 py-3.5 rounded-2xl rounded-bl-none shadow-sm flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        {/* Invisible anchor for scroll logic if ref doesn't work perfectly */}
        <div className="h-4 w-full"></div>
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border-t shrink-0">
        <div className="relative flex items-center gap-2">
          <textarea 
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={t.chatPlaceholder}
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-[#0F5132]/50 transition-all resize-none max-h-32"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className={`
              p-3 rounded-xl transition-all
              ${!inputText.trim() || isTyping ? 'bg-gray-100 text-gray-300' : 'bg-[#0F5132] text-white shadow-lg active:scale-95'}
            `}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};