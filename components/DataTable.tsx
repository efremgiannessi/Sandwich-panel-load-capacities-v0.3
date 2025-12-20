import React from 'react';
import { PanelSpec } from '../types';

interface DataTableProps {
  data: PanelSpec[];
  spans: number[];
}

export const DataTable: React.FC<DataTableProps> = ({ data, spans }) => {
  const hasTransmittance = data.some(item => item.transmittance !== undefined);

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl relative scrollbar-hide">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="bg-slate-800/90 backdrop-blur sticky top-0 z-20">
            <tr>
              <th scope="col" className="sticky left-0 z-30 bg-slate-800 px-4 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-r border-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                Spess.
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Ext
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-r border-slate-800/50">
                Int
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-r border-slate-800/50">
                KG/M²
              </th>
              {hasTransmittance && (
                <th scope="col" className="px-3 py-3.5 text-left text-[10px] font-bold text-emerald-500/80 uppercase tracking-wider border-b border-r border-slate-800/50">
                  U
                </th>
              )}
              {spans.map((span) => (
                <th key={span} scope="col" className="px-4 py-3.5 text-center text-[10px] font-bold text-blue-400/90 tracking-tighter min-w-[70px] border-b border-slate-800">
                  L={span}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-slate-950/40 divide-y divide-slate-800/30">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-blue-600/5 transition-colors group">
                <td className="sticky left-0 z-10 bg-slate-900 px-4 py-3.5 whitespace-nowrap text-xs font-black text-white border-r border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                  {row.thickness}
                </td>
                <td className="px-3 py-3.5 whitespace-nowrap text-xs text-slate-500 group-hover:text-slate-300">
                  {row.steelExt.toFixed(1)}
                </td>
                <td className="px-3 py-3.5 whitespace-nowrap text-xs text-slate-500 border-r border-slate-800/30 group-hover:text-slate-300">
                  {row.steelInt.toFixed(1)}
                </td>
                <td className="px-3 py-3.5 whitespace-nowrap text-xs font-mono text-slate-600 border-r border-slate-800/30">
                  {row.weight.toFixed(1)}
                </td>
                {hasTransmittance && (
                  <td className="px-3 py-3.5 whitespace-nowrap text-xs font-mono text-emerald-600/70 border-r border-slate-800/30">
                    {row.transmittance?.toFixed(2) || '-'}
                  </td>
                )}
                {spans.map((span) => {
                  const load = row.loads[span];
                  return (
                    <td key={span} className={`px-4 py-3.5 whitespace-nowrap text-xs text-center border-r border-slate-800/10 ${!load ? 'bg-red-500/5' : ''}`}>
                      {load !== null && load !== undefined ? (
                        <span className="font-bold text-slate-200">{load}</span>
                      ) : (
                        <span className="text-slate-800 opacity-20">n/a</span>
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