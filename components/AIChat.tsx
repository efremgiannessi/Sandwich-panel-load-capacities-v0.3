import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { streamTechnicalAnswer } from '../services/geminiService';
import { ChatMessage, MessageRole, PanelSpec } from '../types';
import { GenerateContentResponse } from '@google/genai';

interface AIChatProps {
  contextData: PanelSpec[];
  isOpen: boolean;
  onClose: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({ contextData, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: MessageRole.MODEL, text: "Ciao! Sono il tuo assistente tecnico. Hai domande sulle portate o sulla scelta del pannello?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: MessageRole.USER, text: userMsg }]);
    setIsLoading(true);

    try {
      const contextSummary = contextData.slice(0, 15).map(p => {
        const loadsStr = Object.entries(p.loads)
          .filter(([_, val]) => val !== null && val !== undefined)
          .map(([span, val]) => `${span}cm:${val}kg`)
          .join(', ');
        
        return `[T${p.thickness}mm, Est:${p.steelExt}mm, Int:${p.steelInt}mm, Loads: ${loadsStr}]`;
      }).join('\n');

      const streamResponse = await streamTechnicalAnswer(userMsg, contextSummary);
      
      let fullResponseText = "";
      setMessages(prev => [...prev, { role: MessageRole.MODEL, text: "" }]);

      for await (const chunk of streamResponse) {
        const c = chunk as GenerateContentResponse;
        const text = c.text || "";
        fullResponseText += text;
        
        setMessages(prev => {
           const newHistory = [...prev];
           newHistory[newHistory.length - 1].text = fullResponseText;
           return newHistory;
        });
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: MessageRole.MODEL, text: "Errore. Riprova tra poco.", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 w-full sm:w-[420px] h-full sm:h-[650px] sm:max-h-[85vh] bg-slate-900 sm:rounded-3xl shadow-2xl border-t sm:border border-slate-800 flex flex-col z-50 overflow-hidden ring-1 ring-white/5 animate-in slide-in-from-bottom duration-300">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 flex justify-between items-center text-white relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
             <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h3 className="font-bold text-base">Engineering Assistant</h3>
            <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest opacity-80">AI Technical Support</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2.5 bg-black/20 hover:bg-black/40 rounded-full transition-all active:scale-90">
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-950/30 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start gap-3 ${msg.role === MessageRole.USER ? 'flex-row-reverse' : ''}`}>
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl ${
              msg.role === MessageRole.USER 
                ? 'bg-blue-600' 
                : 'bg-emerald-600'
            }`}>
              {msg.role === MessageRole.USER ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
              msg.role === MessageRole.USER 
                ? 'bg-blue-600 text-white font-medium rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-none'
            } ${msg.isError ? 'bg-red-900/30 border-red-900/50 text-red-200' : ''}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold ml-12 uppercase tracking-tighter">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>AI is analyzing data...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-5 bg-slate-900 border-t border-slate-800/50 pb-8 sm:pb-5">
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey)