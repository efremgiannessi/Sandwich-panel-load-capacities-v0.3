import React from 'react';
import { PanelSpec } from '../types';

interface DataTableProps {
  data: PanelSpec[];
  spans: number[];
}

export const DataTable: React.FC<DataTableProps> = ({ data, spans }) => {
  const hasTransmittance = data.some(item => item.transmittance !== undefined);

  return (
    <div className="overflow-x-auto rounded-xl shadow-xl border border-slate-800 bg-slate-900 custom-scrollbar relative">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="bg-slate-800/80 backdrop-blur sticky top-0 z-20">
            <tr>
              <th scope="col" className="sticky left-0 z-30 bg-slate-800 px-3 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-r border-slate-700">
                Spess.
              </th>
              <th scope="col" className="px-3 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Est
              </th>
               <th scope="col" className="px-3 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-r border-slate-800">
                Int
              </th>
              <th scope="col" className="px-3 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-r border-slate-800">
                Kg/m²
              </th>
              {hasTransmittance && (
                <th scope="col" className="px-3 py-3 text-left text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider border-b border-r border-slate-800">
                  U
                </th>
              )}
              {spans.map((span) => (
                <th key={span} scope="col" className="px-3 py-3 text-center text-[10px] font-bold text-blue-400/80 tracking-wider min-w-[65px] border-b border-slate-800">
                  {span}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-slate-900 divide-y divide-slate-800/50">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-slate-800/40 transition-colors group">
                <td className="sticky left-0 z-10 bg-slate-900 px-3 py-3 whitespace-nowrap text-xs font-bold text-white border-r border-slate-800 group-hover:bg-slate-850 shadow-[2px_0_5px_rgba(0,0,0,0.4)]">
                  {row.thickness}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-xs text-slate-400 group-hover:text-slate-200">
                  {row.steelExt.toFixed(1)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-xs text-slate-400 border-r border-slate-800/50 group-hover:text-slate-200">
                  {row.steelInt.toFixed(1)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-xs font-mono text-slate-500 border-r border-slate-800/50">
                  {row.weight.toFixed(1)}
                </td>
                {hasTransmittance && (
                  <td className="px-3 py-3 whitespace-nowrap text-xs font-mono text-emerald-500/80 border-r border-slate-800/50">
                    {row.transmittance?.toFixed(2) || '-'}
                  </td>
                )}
                {spans.map((span) => {
                  const load = row.loads[span];
                  return (
                    <td key={span} className={`px-3 py-3 whitespace-nowrap text-xs text-center border-r border-slate-800/20 ${!load ? 'bg-red-500/5' : ''}`}>
                      {load !== null && load !== undefined ? (
                        <span className="font-semibold text-slate-200">{load}</span>
                      ) : (
                        <span className="text-slate-800">-</span>
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