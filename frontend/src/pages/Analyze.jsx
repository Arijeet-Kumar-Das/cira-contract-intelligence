import React, { useState } from 'react';
import { analyzeText, analyzeClausesText } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import ClauseAnalysisResult from '../components/ClauseAnalysisResult';
import toast from 'react-hot-toast';
import PageHeader from '../ui/PageHeader';
import Button from '../ui/Button';
import { HelpText, Label, Textarea } from '../ui/Field';

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
  {
    label: 'Multi-Clause Contract',
    text: `This Agreement is entered into by and between the parties as of the date set forth below.

The Vendor shall not be held liable for any indirect, incidental, or consequential damages arising from the performance or failure to perform under this Agreement. The total aggregate liability shall not exceed the amount paid under this Agreement in the twelve months preceding the claim.

Payment must be completed within 30 days of invoice receipt. Late payments shall incur a penalty of 1.5% per month on the outstanding balance. Failure to pay within 60 days shall constitute a material breach of this Agreement.

Either party may terminate this Agreement immediately without prior notice if the other party commits a material breach. Upon termination, the Vendor shall be entitled to payment for all services rendered up to the date of termination.

The Contractor agrees to a non-compete restriction for a period of 24 months following termination, covering all jurisdictions where the Company operates. The Contractor shall not solicit any clients or employees of the Company during this period.

All disputes arising under this Agreement shall be resolved through binding arbitration in accordance with the rules of the applicable arbitration association. The decision of the arbitrator shall be final and binding upon both parties.

Both parties agree to maintain the confidentiality of all proprietary information shared under this Agreement. This confidentiality obligation shall survive termination of the Agreement indefinitely.`,
  },
];

const Analyze = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [clauseResult, setClauseResult] = useState(null);
  const [error, setError] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('clause'); // 'simple' or 'clause'

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error('Enter some text.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setClauseResult(null);

      if (analysisMode === 'clause') {
        const res = await analyzeClausesText(text);
        setClauseResult(res.data);
        toast.success(`Analysis complete — ${res.data.totalClauses} clauses analyzed`);
      } else {
        const res = await analyzeText(text);
        setResult(res.data);
        toast.success('Analysis complete');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Analysis failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f4] px-4 py-5">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="Analyze Contract"
          description="Deep clause-level risk analysis with AI-powered explanations."
        />

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
          {/* MAIN SECTION */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-black/[0.04] bg-white">
              {/* TOP */}
              <div className="border-b border-black/[0.04] px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Contract Input
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Paste a clause, paragraph, or full contract for analysis.
                    </p>
                  </div>

                  {/* Analysis Mode Toggle */}
                  <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                    <button
                      onClick={() => setAnalysisMode('clause')}
                      className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition ${
                        analysisMode === 'clause'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Clause Analysis
                    </button>
                    <button
                      onClick={() => setAnalysisMode('simple')}
                      className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition ${
                        analysisMode === 'simple'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Quick Scan
                    </button>
                  </div>
                </div>
              </div>

              {/* BODY */}
              <div className="p-5">
                {/* TEXTAREA */}
                <div>
                  <Label>Contract Text</Label>

                  <div className="mt-2">
                    <Textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={
                        analysisMode === 'clause'
                          ? 'Paste your full contract or multiple clauses here for deep analysis...'
                          : 'Paste your contract clause here...'
                      }
                      rows={analysisMode === 'clause' ? 14 : 10}
                      className="
                        resize-none rounded-xl border-slate-200
                        bg-[#fafafa]
                        text-sm
                        shadow-none
                        focus:border-slate-400
                        focus:ring-0
                      "
                    />
                  </div>

                  <HelpText className="mt-2 text-xs text-slate-500">
                    {text.length} characters
                    {analysisMode === 'clause' && text.length > 0 && (
                      <span className="ml-2 text-orange-600 font-medium">
                        • Clause-level analysis enabled
                      </span>
                    )}
                  </HelpText>
                </div>

                {/* SAMPLE BUTTONS */}
                <div className="mt-5 rounded-xl border border-slate-200 bg-[#fafafa] p-4">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    Quick Samples
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {sampleClauses.map((s) => (
                      <button
                        key={s.label}
                        onClick={() => {
                          setText(s.text);
                          setResult(null);
                          setClauseResult(null);
                          setError(null);
                        }}
                        className="
                          rounded-lg border border-slate-200
                          bg-white px-3 py-2
                          text-xs font-medium text-slate-700
                          transition hover:bg-slate-50
                        "
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ERROR */}
                {error && (
                  <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                    <p className="text-xs font-medium text-rose-700">
                      {error}
                    </p>
                  </div>
                )}

                {/* SIMPLE RESULT */}
                {result && (
                  <div className="mt-5 rounded-xl border border-slate-200 bg-[#fafafa] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-slate-400">
                          Result
                        </p>

                        <h3 className="mt-1 text-sm font-semibold text-slate-900">
                          Predicted Risk Level
                        </h3>
                      </div>

                      <RiskBadge risk={result.predicted_risk} />
                    </div>
                  </div>
                )}

                {/* BUTTONS */}
                <div className="mt-5 flex gap-3">
                  <Button
                    onClick={handleAnalyze}
                    disabled={!text.trim() || loading}
                    className="
                      h-11 flex-1 rounded-xl
                      bg-slate-900 text-sm font-medium
                      hover:bg-slate-800
                    "
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <LoadingSpinner />
                        {analysisMode === 'clause' ? 'Analyzing Clauses...' : 'Analyzing...'}
                      </span>
                    ) : (
                      analysisMode === 'clause' ? 'Analyze Clauses' : 'Quick Scan'
                    )}
                  </Button>

                  {(text || result || clauseResult) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setText('');
                        setResult(null);
                        setClauseResult(null);
                        setError(null);
                      }}
                      className="
                        h-11 rounded-xl
                        border-slate-300 px-5
                        text-sm
                      "
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* CLAUSE ANALYSIS RESULTS (below main card) */}
            {clauseResult && (
              <ClauseAnalysisResult data={clauseResult} />
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-5">
            {/* INFO CARD */}
            <div className="rounded-2xl bg-slate-900 p-5 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-orange-300">
                    {analysisMode === 'clause' ? 'Deep Analysis' : 'Clause Analysis'}
                  </p>

                  <h3 className="mt-2 text-lg font-semibold leading-snug">
                    {analysisMode === 'clause'
                      ? 'Clause-Level Intelligence'
                      : 'Risk Classification'}
                  </h3>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  {analysisMode === 'clause' ? (
                    <svg className="h-5 w-5 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" />
                    </svg>
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">
                    {analysisMode === 'clause' ? 'Capabilities' : 'Purpose'}
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {analysisMode === 'clause'
                      ? 'Split → Classify → Explain → Score'
                      : 'Detect legal and financial risks'}
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">
                    Input
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {analysisMode === 'clause'
                      ? 'Full contracts or multi-clause text'
                      : 'Any contract clause or paragraph'}
                  </p>
                </div>

                {analysisMode === 'clause' && (
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-[11px] uppercase tracking-wider text-slate-400">
                      Output
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      Per-clause risk + overall score + explanations
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* MINI GUIDE */}
            <div className="rounded-2xl border border-black/[0.04] bg-white p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Tips
              </p>

              <div className="mt-4 space-y-3">
                <div className="rounded-xl bg-[#f8f8f7] p-4">
                  <p className="text-sm font-medium text-slate-800">
                    {analysisMode === 'clause'
                      ? 'Paste full contracts for comprehensive clause-by-clause analysis.'
                      : 'Paste complete clauses for more accurate analysis.'}
                  </p>
                </div>

                <div className="rounded-xl bg-[#f8f8f7] p-4">
                  <p className="text-sm font-medium text-slate-800">
                    {analysisMode === 'clause'
                      ? 'Each clause gets its own risk score, confidence level, and explanation.'
                      : 'Legal obligations and indemnity clauses usually carry higher risk.'}
                  </p>
                </div>

                {analysisMode === 'clause' && (
                  <div className="rounded-xl bg-[#f8f8f7] p-4">
                    <p className="text-sm font-medium text-slate-800">
                      Use the "Multi-Clause Contract" sample to see the full analysis in action.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Loading Spinner ─── */
function LoadingSpinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default Analyze;