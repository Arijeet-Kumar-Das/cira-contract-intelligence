import React, { useState } from 'react';
import { analyzeText } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import toast from 'react-hot-toast';

const sampleClauses = [
  {
    label: 'High Risk',
    text: 'The contractor shall be liable for all damages, penalties, and losses without limitation. The company retains the right to pursue litigation in any jurisdiction.',
  },
  {
    label: 'Medium Risk',
    text: 'The company shall indemnify and hold harmless the contractor from any and all claims, damages, and liabilities arising from negligence or breach of contract.',
  },
  {
    label: 'Low Risk',
    text: 'Both parties agree to resolve disputes through mediation before pursuing any legal action. The agreement may be terminated by either party with 30 days written notice.',
  },
];

const Analyze = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!text.trim()) { toast.error('Enter some text.'); return; }
    try {
      setLoading(true); setError(null); setResult(null);
      const res = await analyzeText(text);
      setResult(res.data);
      toast.success('Analysis complete!');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Analysis failed.';
      setError(msg); toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Analyze Text</h1>
        <p className="text-slate-400 text-sm mt-1">Paste a contract clause to analyze its risk level</p>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Contract Text</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your contract clause here..." rows={8}
          className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 resize-none transition-all" />
        <p className="text-xs text-slate-600 mt-1">{text.length} characters</p>

        <div className="my-4">
          <p className="text-xs text-slate-500 mb-2">Quick samples:</p>
          <div className="flex flex-wrap gap-2">
            {sampleClauses.map((s) => (
              <button key={s.label} onClick={() => { setText(s.text); setResult(null); }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 transition-colors">{s.label}</button>
            ))}
          </div>
        </div>

        {error && <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20"><p className="text-sm text-red-400">{error}</p></div>}

        {result && (
          <div className="mb-4 p-5 rounded-xl bg-slate-800/60 border border-slate-700">
            <p className="text-sm font-semibold text-indigo-400 mb-3">Analysis Result</p>
            <p className="text-xs text-slate-500 mb-2">Predicted Risk</p>
            <RiskBadge risk={result.predicted_risk} />
          </div>
        )}

        <div className="flex items-center gap-3">
          <button onClick={handleAnalyze} disabled={!text.trim() || loading}
            className="flex-1 py-3 px-6 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25">
            {loading ? 'Analyzing...' : 'Analyze Risk'}
          </button>
          {(text || result) && (
            <button onClick={() => { setText(''); setResult(null); setError(null); }}
              className="py-3 px-5 rounded-xl text-sm font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 transition-colors">Clear</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analyze;
