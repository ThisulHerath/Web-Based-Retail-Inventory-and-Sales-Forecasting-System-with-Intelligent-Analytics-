import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, Loader2, MessageSquare } from 'lucide-react';
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
            const errorMessage = error.response?.data?.message || 'Sorry, I am having trouble connecting to the network right now. Check if the AI Assistant API key is configured.';
            setMessages(prev => [...prev, { role: 'assistant', content: `[Error]: ${errorMessage}` }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            <div 
                className={`transition-all duration-300 ease-in-out origin-bottom-right mb-4 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-80 sm:w-96 flex flex-col ${
                    isOpen ? 'opacity-100 scale-100 max-h-[500px]' : 'opacity-0 scale-95 max-h-0 pointer-events-none'
                }`}
                style={{ height: '500px' }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-700 to-primary-600 p-4 shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-md">AI Business Assistant</h3>
                            <p className="text-primary-100 text-xs text-opacity-80">7 Super City Advisor</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
                    {messages.map((msg, idx) => (
                        <div 
                            key={idx} 
                            className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                                msg.role === 'user' ? 'bg-[#f5d800]' : 'bg-primary-600'
                            }`}>
                                {msg.role === 'user' ? 
                                    <User className="w-4 h-4 text-[#155c27]" /> : 
                                    <Bot className="w-4 h-4 text-white" />
                                }
                            </div>
                            <div className={`px-4 py-3 rounded-2xl max-w-[75%] text-sm leading-relaxed shadow-sm ${
                                msg.role === 'user' 
                                    ? 'bg-[#f5d800] text-gray-900 rounded-br-none font-medium' 
                                    : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
                            }`}>
                                {/* Quick Markdown formatting for newlines and basic list */}
                                {msg.content.split('\n').map((line, i) => (
                                    <span key={i}>
                                        {line}
                                        {i !== msg.content.split('\n').length - 1 && <br />}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                    
                    {loading && (
                        <div className="flex items-end gap-2 flex-row">
                            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary-600 shadow-sm">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="px-4 py-3 bg-white border border-gray-100 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                                <span className="text-gray-500 text-xs font-medium">Analyzing business data...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                    <form 
                        onSubmit={handleSend}
                        className="flex items-center gap-2"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about inventory, sales..."
                            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center ${
                    isOpen 
                        ? 'bg-gray-800 text-white hover:bg-gray-900' 
                        : 'bg-[#f5d800] text-[#155c27] hover:bg-[#ffe200]'
                }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </button>
        </div>
    );
};

export default BusinessAssistantBot;
