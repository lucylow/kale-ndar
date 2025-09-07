import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface DataPoint {
  name: string;
  value: number;
  change?: number;
  timestamp?: string;
}

interface EnhancedChartProps {
  data: DataPoint[];
  type: 'line' | 'pie';
  title: string;
  subtitle?: string;
  height?: number;
  showTrend?: boolean;
  colors?: string[];
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent-teal))',
  'hsl(var(--accent-purple))',
  'hsl(var(--accent-gold))',
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg backdrop-blur-sm">
        <p className="font-medium text-card-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const EnhancedChart: React.FC<EnhancedChartProps> = ({
  data,
  type,
  title,
  subtitle,
  height = 300,
  showTrend = true,
  colors = CHART_COLORS
}) => {
  const calculateTotalChange = () => {
    if (data.length < 2) return 0;
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    return ((lastValue - firstValue) / firstValue) * 100;
  };

  const totalChange = calculateTotalChange();
  const isPositive = totalChange >= 0;

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="name" 
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={colors[0]}
          strokeWidth={3}
          dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
          className="drop-shadow-sm"
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={colors[index % colors.length]}
              className="hover:opacity-80 transition-opacity duration-300"
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <Card className="bg-gradient-card border-white/10 shadow-card hover:shadow-primary/20 transition-all duration-300 group">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary animate-pulse" />
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          
          {showTrend && type === 'line' && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              isPositive 
                ? 'bg-primary/10 text-primary' 
                : 'bg-destructive/10 text-destructive'
            }`}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {Math.abs(totalChange).toFixed(1)}%
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="group-hover:scale-[1.02] transition-transform duration-300">
          {type === 'line' ? renderLineChart() : renderPieChart()}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedChart;