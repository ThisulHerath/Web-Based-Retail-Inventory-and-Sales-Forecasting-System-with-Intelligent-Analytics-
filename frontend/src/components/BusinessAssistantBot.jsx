import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const BusinessAssistantBot = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am the 7 Super City AI Assistant. How can I help you with our business, sales, or inventory strategy today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    
    const messagesEndRef = useRef(null);
    const botRef = useRef(null);

    // Only render for admin and manager roles
    if (!user || user.role === 'cashier') {
        return null;
    }

    // Auto-scroll to latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Handle click outside to close (popdown)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (botRef.current && !botRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const { data } = await axios.post(
                'http://localhost:5000/api/ai-assistant',
                { prompt: userMessage },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );

            setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
        } catch (error) {
            console.error('AI Error:', error);
            const errorMessage = error.response?.data?.message || 'Sorry, I am having trouble connecting right now.';
            setMessages(prev => [...prev, { role: 'assistant', content: `[Error]: ${errorMessage}` }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div ref={botRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
            {/* Chat Window */}
            <div 
                className={`transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] origin-bottom-right mb-6 bg-white/70 backdrop-blur-2xl rounded-[28px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/60 overflow-hidden w-[340px] sm:w-[400px] flex flex-col ${
                    isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-[0.92] translate-y-8 pointer-events-none'
                }`}
                style={{ height: '560px' }}
            >
                {/* Header */}
                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 shrink-0 flex items-center justify-between overflow-hidden border-b border-slate-700">
                    {/* Decorative glowing orb in background */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500 rounded-full blur-[40px] opacity-30"></div>
                    
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="relative bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-2.5 rounded-2xl backdrop-blur-md shadow-inner border border-white/10 group">
                            <div className="absolute inset-0 bg-indigo-400/20 rounded-2xl blur-md group-hover:bg-indigo-400/40 transition-colors"></div>
                            <Sparkles className="w-5 h-5 text-indigo-300 relative z-10" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white tracking-wide text-[16px] drop-shadow-sm flex items-center gap-2">
                                AI Assistant 
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                            </h3>
                            <p className="text-indigo-200/80 font-medium text-[11px] uppercase tracking-widest mt-0.5">7 Super City Advisor</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 text-slate-400 hover:text-white hover:rotate-90 relative z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-5 overflow-y-auto bg-gradient-to-b from-slate-50/50 to-slate-100/50 flex flex-col gap-5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {messages.map((msg, idx) => (
                        <div 
                            key={idx} 
                            className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                                msg.role === 'user' 
                                ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' 
                                : 'bg-gradient-to-br from-slate-700 to-slate-800'
                            }`}>
                                {msg.role === 'user' ? 
                                    <User className="w-4 h-4 text-white" /> : 
                                    <Bot className="w-4 h-4 text-indigo-200" />
                                }
                            </div>
                            <div className={`px-4 py-3 min-w-[60px] max-w-[85%] text-[14px] leading-relaxed shadow-sm ${
                                msg.role === 'user' 
                                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-[20px] rounded-br-sm font-medium shadow-indigo-500/20' 
                                    : 'bg-white/95 backdrop-blur-sm text-slate-700 border border-slate-100 rounded-[20px] rounded-bl-sm shadow-slate-200/50 hover:shadow-md transition-shadow'
                            }`}>
                                {msg.content.split('\n').map((line, i) => (
                                    <span key={i} className="block whitespace-pre-wrap">
                                        {line === '' ? <br/> : line}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                    
                    {loading && (
                        <div className="flex items-end gap-3 flex-row animate-pulse">
                            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 shadow-md">
                                <Sparkles className="w-4 h-4 text-indigo-200" />
                            </div>
                            <div className="px-5 py-3.5 bg-white/95 backdrop-blur-sm border border-slate-100 rounded-[20px] rounded-bl-sm shadow-sm flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                                <span className="text-slate-500 text-[13px] font-medium tracking-wide ml-1">Analyzing data...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white/70 backdrop-blur-xl border-t border-slate-200/50 shrink-0">
                    <form 
                        onSubmit={handleSend}
                        className="relative flex items-center"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about inventory, sales..."
                            className="flex-1 pl-5 pr-14 py-3.5 bg-white/80 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 text-[14px] text-slate-700 placeholder-slate-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="absolute right-2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:scale-95 shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/40 hover:-translate-y-0.5 group"
                        >
                            <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative p-4 rounded-full shadow-2xl transition-all duration-500 hover:scale-110 flex items-center justify-center overflow-hidden border ${
                    isOpen 
                        ? 'bg-slate-800 text-white hover:bg-slate-700 border-slate-700 shadow-slate-800/30' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 border-indigo-500 shadow-indigo-600/40'
                }`}
            >
                {/* Decorative glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {isOpen ? (
                    <X className="w-7 h-7 relative z-10 transition-transform duration-300 rotate-90 group-hover:rotate-180" />
                ) : (
                    <Sparkles className="w-7 h-7 relative z-10 transition-transform duration-300 group-hover:animate-pulse" />
                )}
            </button>
        </div>
    );
};

export default BusinessAssistantBot;

