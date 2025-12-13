import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { PanelSpec } from '../types';

interface LoadChartProps {
  data: PanelSpec[];
  spans: number[];
}

export const LoadChart: React.FC<LoadChartProps> = ({ data, spans }) => {
  
  const chartData = useMemo(() => {
    return spans.map(span => {
      const point: any = { span };
      data.forEach(panel => {
        if (panel.loads[span] !== null && panel.loads[span] !== undefined) {
          const key = `${panel.thickness}-${panel.steelExt}-${panel.steelInt}`;
          point[key] = panel.loads[span];
        }
      });
      return point;
    });
  }, [data, spans]);

  const colors = [
    '#3b82f6', // blue-500
    '#ef4444', // red-500
    '#22c55e', // green-500
    '#f59e0b', // amber-500
    '#a855f7', // purple-500
    '#06b6d4', // cyan-500
    '#ec4899', // pink-500
    '#84cc16', // lime-500
  ];

  return (
    <div className="w-full h-[400px] bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-800">
      <div className="flex items-center justify-between mb-4 px-2">
         <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Grafico Portata vs Luce</h3>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="span" 
            tick={{fontSize: 11, fill: '#94a3b8'}}
            tickLine={{stroke: '#334155'}}
            axisLine={{stroke: '#334155'}}
            type="number"
            domain={['dataMin', 'dataMax']}
            tickCount={spans.length > 10 ? 8 : spans.length}
            dy={10}
          />
          <YAxis 
            tick={{fontSize: 11, fill: '#94a3b8'}}
            tickLine={{stroke: '#334155'}}
            axisLine={{stroke: '#334155'}}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              borderRadius: '12px', 
              border: '1px solid #334155',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
              color: '#f1f5f9',
              padding: '12px'
            }}
            itemStyle={{ color: '#e2e8f0', fontSize: '12px', padding: '2px 0' }}
            labelStyle={{ color: '#94a3b8', fontSize: '11px', marginBottom: '8px', fontWeight: 'bold' }}
          />
          <Legend 
            wrapperStyle={{paddingTop: '20px'}} 
            iconType="circle"
          />
          
          {data.map((panel, index) => (
             <Line
               key={panel.id}
               type="monotone"
               connectNulls
               dataKey={`${panel.thickness}-${panel.steelExt}-${panel.steelInt}`}
               name={`T${panel.thickness}`}
               stroke={colors[index % colors.length]}
               strokeWidth={2}
               activeDot={{ r: 6, fill: colors[index % colors.length], stroke: '#1e293b', strokeWidth: 2 }}
               dot={false}
             />
          ))}
          <ReferenceLine y={0} stroke="#475569" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};