import React, { useState, useRef } from 'react';
import { uploadFile } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import toast from 'react-hot-toast';
import PageHeader from '../ui/PageHeader';
import Button from '../ui/Button';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setProgress(0);
      setResult(null);
      setError(null);

      const res = await uploadFile(file, (event) => {
        const percent = Math.round(
          (event.loaded * 100) / event.total
        );

        setProgress(percent);
      });

      setResult(res.data);

      toast.success('Analysis complete');
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        'Upload failed. Please try again.';

      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f4] px-4 py-5">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="Upload Contract"
          description="Analyze contracts and detect potential risks."
        />

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
          {/* MAIN PANEL */}
          <div className="rounded-2xl border border-black/[0.04] bg-white">
            {/* TOP */}
            <div className="flex items-center justify-between border-b border-black/[0.04] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Document Upload
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  PDF, TXT, JPG, PNG
                </p>
              </div>

              <div className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-medium text-orange-700">
                Secure
              </div>
            </div>

            {/* DROPZONE */}
            <div className="p-5">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`
                  relative cursor-pointer rounded-xl border transition-all duration-200
                  ${
                    dragActive
                      ? 'border-orange-300 bg-orange-50'
                      : file
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-dashed border-slate-300 bg-[#fafafa] hover:border-slate-400'
                  }
                `}
              >
                <input
                  ref={inputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.jpg,.jpeg,.png"
                  className="hidden"
                />

                <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-10 text-center">
                  {file ? (
                    <>
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500">
                        <svg
                          className="h-6 w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20 6 9 17l-5-5"
                          />
                        </svg>
                      </div>

                      <h3 className="mt-4 text-sm font-semibold text-slate-900">
                        {file.name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                        <svg
                          className="h-7 w-7 text-slate-700"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 3v12m0-12 4 4m-4-4-4 4M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"
                          />
                        </svg>
                      </div>

                      <h3 className="mt-5 text-base font-semibold text-slate-900">
                        Drop your contract here
                      </h3>

                      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                        Drag and drop your file here or click to browse
                        documents from your device.
                      </p>

                      <div className="mt-6 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                        Browse files
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* PROGRESS */}
              {uploading && (
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">
                      Processing
                    </span>

                    <span className="text-xs font-semibold text-slate-800">
                      {progress}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-orange-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* ERROR */}
              {error && (
                <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                  <p className="text-xs font-medium text-rose-700">
                    {error}
                  </p>
                </div>
              )}

              {/* BUTTONS */}
              <div className="mt-5 flex gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="
                    h-11 flex-1 rounded-xl
                    bg-slate-900 text-sm font-medium
                    hover:bg-slate-800
                  "
                >
                  {uploading
                    ? 'Analyzing...'
                    : 'Upload & Analyze'}
                </Button>

                {(file || result) && (
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="h-11 rounded-xl border-slate-300 px-5 text-sm"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-5">
            {/* INFO */}
            <div className="rounded-2xl bg-slate-900 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-orange-300">
                    Analysis
                  </p>

                  <h3 className="mt-2 text-lg font-semibold leading-snug">
                    Contract Risk Detection
                  </h3>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <svg
                    className="h-5 w-5 text-orange-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.75 17 15 12l-5.25-5"
                    />
                  </svg>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">
                    Supported Files
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    PDF, TXT, JPG, PNG
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">
                    Processing
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    AI-powered analysis
                  </p>
                </div>
              </div>
            </div>

            {/* RESULT */}
            {result && (
              <div className="rounded-2xl border border-black/[0.04] bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-slate-400">
                      Result
                    </p>

                    <h3 className="mt-1 text-base font-semibold text-slate-900">
                      Contract #{result.contract_id}
                    </h3>
                  </div>

                  <RiskBadge risk={result.risk_score} />
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-xl bg-[#f8f8f7] p-4">
                    <p className="text-[11px] uppercase tracking-wider text-slate-400">
                      File Name
                    </p>

                    <p className="mt-1 truncate text-sm font-medium text-slate-900">
                      {result.file_name}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#f8f8f7] p-4">
                    <p className="text-[11px] uppercase tracking-wider text-slate-400">
                      Contract ID
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      #{result.contract_id}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Upload;