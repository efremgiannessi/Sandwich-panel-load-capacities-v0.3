import React from 'react';
import { PanelSpec } from '../types';

interface DataTableProps {
  data: PanelSpec[];
  spans: number[];
}

export const DataTable: React.FC<DataTableProps> = ({ data, spans }) => {
  const hasTransmittance = data.some(item => item.transmittance !== undefined);

  return (
    <div className="overflow-x-auto rounded-2xl shadow-xl border border-slate-800 bg-slate-900 custom-scrollbar">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-800">
            <tr>
              <th scope="col" className="sticky left-0 z-20 bg-slate-800 px-4 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-r border-slate-700 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.3)]">
                Spessore
              </th>
              <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                Esterno
              </th>
               <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-r border-slate-800">
                Interno
              </th>
              <th scope="col" className={`px-3 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-r border-slate-800 bg-slate-800/50 ${!hasTransmittance ? 'bg-slate-800/50' : ''}`}>
                Peso
              </th>
              {hasTransmittance && (
                <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-emerald-400/90 uppercase tracking-wider border-r border-slate-800 bg-slate-800/50">
                  Trasm.
                </th>
              )}
              {spans.map((span) => (
                <th key={span} scope="col" className="px-2 py-4 text-center text-xs font-bold text-blue-400/80 tracking-wider min-w-[50px] bg-slate-800/80">
                  {span}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-slate-900 divide-y divide-slate-800/50">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-slate-800/60 transition-colors group">
                <td className="sticky left-0 z-10 bg-slate-900 px-4 py-3 whitespace-nowrap text-sm font-bold text-white border-r border-slate-800 group-hover:bg-slate-800 transition-colors shadow-[4px_0_12px_-4px_rgba(0,0,0,0.3)]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    {row.thickness}
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-slate-400 group-hover:text-slate-200">
                  {row.steelExt.toFixed(1)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-slate-400 border-r border-slate-800/50 group-hover:text-slate-200">
                  {row.steelInt.toFixed(1)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm font-mono text-slate-400 border-r border-slate-800/50 bg-slate-900/30">
                  {row.weight.toFixed(2)}
                </td>
                {hasTransmittance && (
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-mono text-emerald-400/90 border-r border-slate-800/50 bg-slate-900/30 font-semibold">
                    {row.transmittance?.toFixed(2) || '-'}
                  </td>
                )}
                {spans.map((span) => {
                  const load = row.loads[span];
                  return (
                    <td key={span} className={`px-2 py-3 whitespace-nowrap text-sm text-center border-l border-slate-800/30 ${!load ? 'bg-red-500/5' : ''}`}>
                      {load !== null && load !== undefined ? (
                        <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">{load}</span>
                      ) : (
                        <span className="text-slate-700 text-xs font-mono">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};