import React from 'react';
import { Link } from 'react-router-dom';
import RiskBadge from './RiskBadge';
import Button from '../ui/Button';

const ContractTable = ({ contracts }) => {
  if (!contracts || contracts.length === 0) {
    return (
      <div className="text-center py-14">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
          <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <p className="text-slate-900 text-sm font-bold">No contracts yet</p>
        <p className="text-slate-600 text-sm mt-1">
          Upload a document to start building your risk dashboard.
        </p>
        <div className="mt-5">
          <Button as={Link} to="/upload" variant="primary">
            Upload contract
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/70">
            <th className="text-left py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
              ID
            </th>
            <th className="text-left py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
              File
            </th>
            <th className="text-left py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
              Risk
            </th>
            <th className="text-left py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
              Created
            </th>
            <th className="text-right py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {contracts.map((contract) => (
            <tr
              key={contract.id}
              className="group hover:bg-slate-50 transition-colors"
            >
              <td className="py-4 px-4 text-sm text-slate-600 font-mono">
                #{contract.id}
              </td>
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                    <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-900 font-semibold truncate max-w-[260px]">
                    {contract.file_name}
                  </span>
                </div>
              </td>
              <td className="py-3.5 px-4">
                <RiskBadge risk={contract.risk_score} />
              </td>
              <td className="py-3.5 px-4 text-sm text-slate-600">
                {formatDate(contract.created_at)}
              </td>
              <td className="py-3.5 px-4 text-right">
                <Button
                  as={Link}
                  to={`/contracts/${contract.id}`}
                  variant="outline"
                  size="sm"
                >
                  Open
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default ContractTable;
