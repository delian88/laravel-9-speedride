import React, { useState } from 'react';
import { generateSupportResponse } from '../services/geminiService';

interface GeminiAssistantProps {
  contextStr: string;
}

export const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ contextStr }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const ans = await generateSupportResponse(query, contextStr);
    setResponse(ans);
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-xl hover:scale-105 transition-transform z-50"
      >
        <i className="fas fa-robot text-xl"></i>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col animate-fade-in-up">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white">
        <h3 className="font-bold"><i className="fas fa-sparkles mr-2"></i>AI Assistant</h3>
        <button onClick={() => setIsOpen(false)} className="hover:text-slate-200">
            <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="p-4 h-64 overflow-y-auto bg-slate-50 space-y-3">
        {response ? (
             <div className="flex items-start space-x-2">
                <div className="bg-purple-100 p-2 rounded-lg rounded-tl-none text-sm text-purple-900 max-w-[90%]">
                    {response}
                </div>
             </div>
        ) : (
            <p className="text-slate-400 text-center text-sm mt-10">Ask me anything about your ride or the app!</p>
        )}
      </div>

      <div className="p-3 border-t border-slate-100 bg-white flex space-x-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
        />
        <button 
            onClick={handleAsk} 
            disabled={loading}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
        </button>
      </div>
    </div>
  );
};
