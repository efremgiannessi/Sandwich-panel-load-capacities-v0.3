
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

// Define missing LoadChartProps interface
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
    '#f97316', // orange-500 (Primary accent)
    '#3b82f6', // blue-500
    '#ef4444', // red-500
    '#22c55e', // green-500
    '#a855f7', // purple-500
    '#06b6d4', // cyan-500
    '#ec4899', // pink-500
    '#84cc16', // lime-500
  ];

  return (
    <div className="w-full h-[400px] bg-neutral-900 p-4 rounded-2xl shadow-xl border border-neutral-800">
      <div className="flex items-center justify-between mb-4 px-2">
         <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wide">Grafico Portata vs Luce</h3>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} />
          <XAxis 
            dataKey="span" 
            tick={{fontSize: 11, fill: '#737373'}}
            tickLine={{stroke: '#404040'}}
            axisLine={{stroke: '#404040'}}
            type="number"
            domain={['dataMin', 'dataMax']}
            tickCount={spans.length > 10 ? 8 : spans.length}
            dy={10}
          />
          <YAxis 
            tick={{fontSize: 11, fill: '#737373'}}
            tickLine={{stroke: '#404040'}}
            axisLine={{stroke: '#404040'}}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#171717', 
              borderRadius: '12px', 
              border: '1px solid #404040',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
              color: '#f5f5f5',
              padding: '12px'
            }}
            itemStyle={{ color: '#e5e5e5', fontSize: '12px', padding: '2px 0' }}
            labelStyle={{ color: '#a3a3a3', fontSize: '11px', marginBottom: '8px', fontWeight: 'bold' }}
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
               activeDot={{ r: 6, fill: colors[index % colors.length], stroke: '#171717', strokeWidth: 2 }}
               dot={false}
             />
          ))}
          <ReferenceLine y={0} stroke="#525252" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
