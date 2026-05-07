import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getContractById, getContractClauses } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import ClauseAnalysisResult from '../components/ClauseAnalysisResult';
import Loader from '../components/Loader';
import PageHeader from '../ui/PageHeader';
import { Card, CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';

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

  // Clause analysis state
  const [clauseData, setClauseData] = useState(null);
  const [clauseLoading, setClauseLoading] = useState(false);
  const [clauseError, setClauseError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'clauses'

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

  // Fetch clause analysis
  const handleClauseAnalysis = async () => {
    if (clauseData) {
      // Already loaded — just switch tab
      setActiveTab('clauses');
      return;
    }

    try {
      setClauseLoading(true);
      setClauseError(null);
      const res = await getContractClauses(id);
      setClauseData(res.data);
      setActiveTab('clauses');
    } catch (err) {
      setClauseError(
        err.response?.data?.detail || 'Failed to run clause analysis.'
      );
    } finally {
      setClauseLoading(false);
    }
  };

  if (loading) return <Loader text="Loading contract..." />;

  if (error) {
    return (
      <div className="max-w-3xl py-10">
        <Card>
          <CardBody className="py-10 text-center">
            <p className="text-rose-800 text-sm font-semibold mb-4">{error}</p>
            <Button as={Link} to="/" variant="outline">
              Back to dashboard
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const highlightedText = highlightRiskyWords(contract?.extracted_text || '');

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-3">
        <Button as={Link} to="/" variant="ghost" className="px-0 hover:bg-transparent text-slate-700">
          <span className="inline-flex items-center gap-2">
            <ArrowLeftIcon />
            Back
          </span>
        </Button>
      </div>

      <PageHeader
        title={`Contract #${contract.id}`}
        description={contract.file_name}
        right={<RiskBadge risk={contract.risk_score} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetaItem label="File name" value={contract.file_name} />
        <MetaItem label="Risk score" value={<RiskBadge risk={contract.risk_score} />} />
        <MetaItem label="Created" value={formatDate(contract.created_at)} />
      </div>

      {/* ─── Tab Navigation ─── */}
      <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
            activeTab === 'overview'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <DocumentIcon />
            Extracted Text
          </span>
        </button>

        <button
          onClick={handleClauseAnalysis}
          disabled={clauseLoading || !contract.extracted_text}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
            activeTab === 'clauses'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span className="flex items-center justify-center gap-2">
            {clauseLoading ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <ClauseIcon />
            )}
            {clauseLoading ? 'Analyzing...' : 'Clause Analysis'}
          </span>
        </button>
      </div>

      {/* ─── Clause Error ─── */}
      {clauseError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-xs font-medium text-rose-700">{clauseError}</p>
        </div>
      )}

      {/* ─── Tab Content ─── */}
      {activeTab === 'overview' ? (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <div className="text-sm font-extrabold text-slate-900">Extracted text</div>
              <div className="text-sm text-slate-600">
                {contract.extracted_text ? `${contract.extracted_text.length} characters` : 'No text extracted'}
              </div>
            </div>
            {contract.extracted_text ? (
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Highlights enabled
              </span>
            ) : null}
          </CardHeader>
          <CardBody>
            {contract.extracted_text ? (
              <div className="max-h-[560px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5">
                <div
                  className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: highlightedText }}
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-600">
                  No text was extracted from this document.
                </p>
              </div>
            )}

            {contract.extracted_text && (
              <div className="mt-4 flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded bg-rose-200 border border-rose-300" />
                <span className="text-sm text-slate-600">
                  Highlighted terms indicate potentially risky wording.
                </span>
              </div>
            )}
          </CardBody>
        </Card>
      ) : (
        /* ─── Clause Analysis Results ─── */
        clauseData && <ClauseAnalysisResult data={clauseData} />
      )}
    </div>
  );
};

function MetaItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      <div className="mt-1 text-sm text-slate-900 font-semibold">{value}</div>
    </div>
  );
}

function highlightRiskyWords(text) {
  if (!text) return '';
  const escaped = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const pattern = new RegExp(`\\b(${RISKY_KEYWORDS.join('|')})\\b`, 'gi');
  return escaped.replace(
    pattern,
    '<mark class="bg-rose-100 text-rose-900 px-1 rounded-md ring-1 ring-inset ring-rose-200">$1</mark>',
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return dateStr; }
}

function ArrowLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 19 8 12l7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ClauseIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

export default ContractDetail;
