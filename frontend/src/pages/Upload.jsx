import React, { useState, useRef } from 'react';
import { uploadFile } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import toast from 'react-hot-toast';

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
    } else if (e.type === 'dragleave') {
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
      setError(null);
      setResult(null);

      const res = await uploadFile(file, (event) => {
        const percent = Math.round((event.loaded * 100) / event.total);
        setProgress(percent);
      });

      setResult(res.data);
      toast.success('Contract analyzed successfully!');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Upload failed. Please try again.';
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
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Upload Contract</h1>
        <p className="text-slate-400 text-sm mt-1">
          Upload a legal document to analyze its risk level
        </p>
      </div>

      {/* Upload Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-indigo-500 bg-indigo-500/5'
              : file
              ? 'border-emerald-500/50 bg-emerald-500/5'
              : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/30'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.txt,.jpg,.jpeg,.png"
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{file.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center">
                <svg className="w-7 h-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-300">
                  <span className="text-indigo-400 font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  PDF, TXT, JPG, or PNG
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Uploading & Analyzing...</span>
              <span className="text-xs text-indigo-400 font-mono">{progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-5 p-5 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-emerald-400">Analysis Complete</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Contract ID</p>
                <p className="text-sm text-white font-mono">#{result.contract_id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">File Name</p>
                <p className="text-sm text-white truncate">{result.file_name}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500 mb-2">Risk Score</p>
                <RiskBadge risk={result.risk_score} />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 py-3 px-6 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
          >
            {uploading ? 'Analyzing...' : 'Upload & Analyze'}
          </button>
          {(file || result) && (
            <button
              onClick={resetForm}
              className="py-3 px-5 rounded-xl text-sm font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-slate-300 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
