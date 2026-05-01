import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getContractById } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import Loader from '../components/Loader';

const RISKY_KEYWORDS = [
  'liable', 'liability', 'damages', 'penalty', 'penalties', 'termination',
  'terminate', 'indemnify', 'indemnification', 'litigation', 'arbitration',
  'breach', 'negligence', 'without limitation', 'hold harmless', 'waive',
  'forfeit', 'non-compete', 'liquidated damages', 'binding', 'irrevocable',
];

const ContractDetail = () => {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        const res = await getContractById(id);
        setContract(res.data);
      } catch (err) {
        setError(err.response?.status === 404
          ? `Contract #${id} not found.`
          : 'Failed to load contract details.');
      } finally { setLoading(false); }
    };
    fetchContract();
  }, [id]);

  if (loading) return <Loader text="Loading contract..." />;

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-red-400 text-sm mb-4">{error}</p>
        <Link to="/" className="text-indigo-400 text-sm hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const highlightedText = highlightRiskyWords(contract?.extracted_text || '');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Contract #{contract.id}</h1>
          <p className="text-slate-400 text-sm mt-1">{contract.file_name}</p>
        </div>
        <RiskBadge risk={contract.risk_score} />
      </div>

      {/* Metadata Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <MetaItem label="File Name" value={contract.file_name} />
        <MetaItem label="Risk Score" value={<RiskBadge risk={contract.risk_score} />} />
        <MetaItem label="Created At" value={formatDate(contract.created_at)} />
      </div>

      {/* Extracted Text */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Extracted Text</h2>
          <span className="text-xs text-slate-500">
            {contract.extracted_text ? `${contract.extracted_text.length} chars` : 'N/A'}
          </span>
        </div>
        <div className="p-6 max-h-[500px] overflow-y-auto">
          {contract.extracted_text ? (
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: highlightedText }} />
          ) : (
            <p className="text-sm text-slate-500 italic">No text was extracted from this document.</p>
          )}
        </div>
      </div>

      {/* Legend */}
      {contract.extracted_text && (
        <div className="mt-4 flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded bg-red-500/30 border border-red-500/40" />
          <span className="text-xs text-slate-500">Highlighted words indicate potentially risky terms</span>
        </div>
      )}
    </div>
  );
};

function MetaItem({ label, value }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <div className="text-sm text-white font-medium">{value}</div>
    </div>
  );
}

function highlightRiskyWords(text) {
  if (!text) return '';
  const escaped = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const pattern = new RegExp(`\\b(${RISKY_KEYWORDS.join('|')})\\b`, 'gi');
  return escaped.replace(pattern, '<mark class="bg-red-500/20 text-red-400 px-0.5 rounded">$1</mark>');
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return dateStr; }
}

export default ContractDetail;
