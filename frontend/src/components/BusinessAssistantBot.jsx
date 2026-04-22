import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, Sparkles } from 'lucide-react';
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

    // Handle click outside to close
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
        <div ref={botRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans pointer-events-none">

            {/* Chat Window */}
            <div
                className={`transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] origin-bottom-right mb-6 bg-white rounded-[28px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] border border-gray-200 overflow-hidden w-[340px] sm:w-[400px] flex flex-col ${
                    isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-[0.92] translate-y-8 pointer-events-none'
                }`}
                style={{ height: '560px' }}
            >
                {/* Header */}
                <div
                    className="relative p-5 shrink-0 flex items-center justify-between overflow-hidden border-b border-green-900"
                    style={{ background: 'linear-gradient(135deg, #1e7a34 0%, #155c27 100%)' }}
                >
                    {/* Decorative glow */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[40px] opacity-20" style={{ background: '#f5d800' }}></div>

                    <div className="flex items-center gap-4 relative z-10">
                        <div
                            className="relative p-2.5 rounded-2xl shadow-inner border border-white/20"
                            style={{ background: 'rgba(245,216,0,0.15)' }}
                        >
                            <Sparkles className="w-5 h-5 relative z-10" style={{ color: '#f5d800' }} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white tracking-wide text-[16px] drop-shadow-sm flex items-center gap-2">
                                AI Assistant
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                                </span>
                            </h3>
                            <p
                                className="font-medium text-[11px] uppercase tracking-widest mt-0.5"
                                style={{ color: 'rgba(245,216,0,0.85)' }}
                            >
                                7 Super City Advisor
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-full transition-all duration-300 hover:rotate-90 relative z-10 text-white/70 hover:text-white hover:bg-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-5 overflow-y-auto bg-gray-50 flex flex-col gap-5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            {/* Avatar */}
                            <div
                                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                                style={msg.role === 'user'
                                    ? { background: 'linear-gradient(135deg, #f5d800, #e6c700)' }
                                    : { background: 'linear-gradient(135deg, #1e7a34, #155c27)' }
                                }
                            >
                                {msg.role === 'user'
                                    ? <User className="w-4 h-4" style={{ color: '#155c27' }} />
                                    : <Bot className="w-4 h-4 text-white" />
                                }
                            </div>

                            {/* Bubble */}
                            <div
                                className={`px-4 py-3 min-w-[60px] max-w-[85%] text-[14px] leading-relaxed shadow-sm ${
                                    msg.role === 'user'
                                        ? 'text-gray-800 rounded-[20px] rounded-br-sm font-medium border border-yellow-300'
                                        : 'bg-white text-gray-700 border border-gray-200 rounded-[20px] rounded-bl-sm hover:shadow-md transition-shadow'
                                }`}
                                style={msg.role === 'user' ? { background: '#fef9c3' } : {}}
                            >
                                {msg.content.split('\n').map((line, i) => (
                                    <span key={i} className="block whitespace-pre-wrap">
                                        {line === '' ? <br /> : line}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {loading && (
                        <div className="flex items-end gap-3 flex-row animate-pulse">
                            <div
                                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                                style={{ background: 'linear-gradient(135deg, #1e7a34, #155c27)' }}
                            >
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div className="px-5 py-3.5 bg-white border border-gray-200 rounded-[20px] rounded-bl-sm shadow-sm flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#1e7a34', animationDelay: '0ms' }}></div>
                                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#1e7a34', animationDelay: '150ms' }}></div>
                                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#1e7a34', animationDelay: '300ms' }}></div>
                                </div>
                                <span className="text-gray-400 text-[13px] font-medium tracking-wide ml-1">Analyzing data...</span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                    <form onSubmit={handleSend} className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about inventory, sales..."
                            className="flex-1 pl-5 pr-14 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none text-[14px] text-gray-800 placeholder-gray-400 shadow-inner transition-all"
                            onFocus={e => e.target.style.borderColor = '#1e7a34'}
                            onBlur={e => e.target.style.borderColor = ''}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="absolute right-2 p-2.5 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:scale-95 shadow-md hover:shadow-lg hover:-translate-y-0.5 group"
                            style={{ background: '#1e7a34' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#155c27'}
                            onMouseLeave={e => e.currentTarget.style.background = '#1e7a34'}
                        >
                            <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative p-4 rounded-full shadow-2xl transition-all duration-500 hover:scale-110 flex items-center justify-center overflow-hidden border pointer-events-auto text-white"
                style={{ background: '#1e7a34', borderColor: '#1e7a34' }}
                onMouseEnter={e => e.currentTarget.style.background = '#155c27'}
                onMouseLeave={e => e.currentTarget.style.background = '#1e7a34'}
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {isOpen ? (
                    <X className="w-7 h-7 relative z-10 transition-transform duration-300 rotate-90 group-hover:rotate-180" />
                ) : (
                    <Bot className="w-7 h-7 relative z-10 transition-transform duration-300 group-hover:animate-pulse" />
                )}
            </button>
        </div>
    );
};

export default BusinessAssistantBot;
