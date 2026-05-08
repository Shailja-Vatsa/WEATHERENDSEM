import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';

export const AiChatbot = ({ issData, nearestCity, newsData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    const saved = localStorage.getItem('chatbot_history');
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([
        { role: 'assistant', content: 'Hello! I am your dashboard assistant. Ask me anything about the ISS or the latest space news!' }
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatbot_history', JSON.stringify(messages.slice(-30)));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    const token = import.meta.env.VITE_AI_TOKEN;
    if (!token) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Please configure your Hugging Face API token in .env to enable the AI.' }]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    try {
      const newsSnippet = newsData.slice(0, 3).map(n => `- ${n.title}`).join('\n');
      const issInfo = issData ? `Lat: ${issData.lat.toFixed(4)}, Lon: ${issData.lon.toFixed(4)}, Speed: ${Math.round(issData.speed)} km/h, Nearest City: ${nearestCity}` : "Acquiring...";

      const systemPrompt = `You are a dashboard assistant. Use ONLY the provided ISS and News data. If asked anything else, reply: 'I only have access to current dashboard data.'\n\nISS: ${issInfo}\nNews:\n${newsSnippet}`;
      const formattedPrompt = `<s>[INST] ${systemPrompt}\n\nUser: ${userMsg} [/INST]`;

      const res = await fetch('/api/hf/models/mistralai/Mistral-7B-Instruct-v0.2', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: formattedPrompt, parameters: { max_new_tokens: 150, temperature: 0.1, return_full_text: false } })
      });

      if (!res.ok) throw new Error(`HF error: ${res.status}`);
      const data = await res.json();
      const reply = data[0]?.generated_text?.trim() || 'No response received.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the AI.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-all hover:scale-105 z-50 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <div 
        className={`fixed bottom-6 right-6 w-80 sm:w-96 bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right z-50 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
        style={{ height: '500px', maxHeight: '80vh' }}
      >
        <div className="bg-primary text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <h3 className="font-bold">Dashboard AI</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-blue-600 p-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-sm'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2 justify-start">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm p-3 flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full pl-4 pr-12 py-3 rounded-full bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-1 top-1 bottom-1 w-10 flex items-center justify-center bg-primary text-white rounded-full disabled:opacity-50 hover:bg-blue-600 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
