import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, X, ChevronDown } from 'lucide-react';
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
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: MessageRole.USER, text: userMsg }]);
    setIsLoading(true);

    try {
      // Serialize context with loads to give AI actual data capability
      // Limit to first 20 panels to avoid excessive tokens if filters are open, 
      // but usually filtering reduces this list significantly.
      const contextSummary = contextData.slice(0, 20).map(p => {
        const loadsStr = Object.entries(p.loads)
          .filter(([_, val]) => val !== null && val !== undefined)
          .map(([span, val]) => `${span}cm: ${val}kg`)
          .join(', ');
        
        return `[ID: ${p.id}, Spess: ${p.thickness}mm, Acciaio Est: ${p.steelExt}mm, Acciaio Int: ${p.steelInt}mm, Peso: ${p.weight}kg/m2, Trasm: ${p.transmittance || 'N/A'}, Carichi(kg/m2): ${loadsStr}]`;
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
      setMessages(prev => [...prev, { role: MessageRole.MODEL, text: "Errore di connessione. Riprova più tardi.", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-full sm:w-[400px] h-[600px] max-h-[85vh] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 flex flex-col z-50 overflow-hidden font-sans ring-1 ring-black/50">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-4 flex justify-between items-center text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
             <Sparkles className="w-4 h-4 text-yellow-300" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Assistente Tecnico</h3>
            <p className="text-[10px] text-blue-200 font-medium opacity-90">Powered by Gemini AI</p>
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors relative z-10">
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-950/50 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start gap-3 ${msg.role === MessageRole.USER ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
              msg.role === MessageRole.USER 
                ? 'bg-blue-600 ring-2 ring-blue-500/30' 
                : 'bg-emerald-600 ring-2 ring-emerald-500/30'
            }`}>
              {msg.role === MessageRole.USER ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
            </div>
            <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-md ${
              msg.role === MessageRole.USER 
                ? 'bg-blue-600 text-white rounded-tr-sm' 
                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
            } ${msg.isError ? 'bg-red-900/50 text-red-200 border-red-800' : ''}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs ml-12">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Elaborazione risposta...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Scrivi qui la tua domanda..."
            className="w-full pl-4 pr-12 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none h-14 scrollbar-hide shadow-inner transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2 text-center">
            <p className="text-[10px] text-slate-600">L'IA può commettere errori. Verificare i dati ufficiali.</p>
        </div>
      </div>
    </div>
  );
};