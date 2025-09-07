import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Pause, 
  Play,
  Maximize2,
  Minimize2,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface PriceDataPoint {
  timestamp: number;
  price: number;
  confidence: number;
  volume?: number;
}

interface RealTimePriceChartProps {
  asset: string;
  symbol: string;
  priceData: PriceDataPoint[];
  isLive: boolean;
  onToggleLive?: () => void;
  className?: string;
}

const RealTimePriceChart: React.FC<RealTimePriceChartProps> = ({
  asset,
  symbol,
  priceData,
  isLive,
  onToggleLive,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('1h');
  const [chartData, setChartData] = useState<PriceDataPoint[]>([]);
  const [priceChange, setPriceChange] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);

  // Filter data based on time range
  useEffect(() => {
    const now = Date.now();
    const rangeMs = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
    };

    const filteredData = priceData.filter(point => 
      now - point.timestamp <= rangeMs[timeRange]
    );

    setChartData(filteredData);

    if (filteredData.length >= 2) {
      const latest = filteredData[filteredData.length - 1];
      const earliest = filteredData[0];
      const change = ((latest.price - earliest.price) / earliest.price) * 100;
      setPriceChange(change);
      setCurrentPrice(latest.price);
    }
  }, [priceData, timeRange]);

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || chartData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Chart dimensions
    const padding = 40;
    const chartWidth = rect.width - (padding * 2);
    const chartHeight = rect.height - (padding * 2);

    if (chartData.length < 2) return;

    // Calculate price range
    const prices = chartData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const pricePadding = priceRange * 0.1; // 10% padding

    // Calculate time range
    const times = chartData.map(d => d.timestamp);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const timeRange = maxTime - minTime;

    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Vertical grid lines (time)
    for (let i = 0; i <= 5; i++) {
      const x = padding + (chartWidth * i) / 5;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + chartHeight);
      ctx.stroke();
    }

    // Horizontal grid lines (price)
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight * i) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }

    // Draw price line
    ctx.strokeStyle = priceChange >= 0 ? '#10b981' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();

    chartData.forEach((point, index) => {
      const x = padding + ((point.timestamp - minTime) / timeRange) * chartWidth;
      const y = padding + chartHeight - (((point.price - minPrice + pricePadding) / (priceRange + pricePadding * 2)) * chartHeight);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw price points
    ctx.fillStyle = priceChange >= 0 ? '#10b981' : '#ef4444';
    chartData.forEach((point) => {
      const x = padding + ((point.timestamp - minTime) / timeRange) * chartWidth;
      const y = padding + chartHeight - (((point.price - minPrice + pricePadding) / (priceRange + pricePadding * 2)) * chartHeight);

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw confidence overlay
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();

    chartData.forEach((point, index) => {
      const x = padding + ((point.timestamp - minTime) / timeRange) * chartWidth;
      const y = padding + chartHeight - (((point.price - minPrice + pricePadding) / (priceRange + pricePadding * 2)) * chartHeight);
      const confidenceHeight = (point.confidence / 100) * 20; // Max 20px height

      if (index === 0) {
        ctx.moveTo(x, y - confidenceHeight / 2);
      } else {
        ctx.lineTo(x, y - confidenceHeight / 2);
      }
    });

    // Draw bottom of confidence area
    for (let i = chartData.length - 1; i >= 0; i--) {
      const point = chartData[i];
      const x = padding + ((point.timestamp - minTime) / timeRange) * chartWidth;
      const y = padding + chartHeight - (((point.price - minPrice + pricePadding) / (priceRange + pricePadding * 2)) * chartHeight);
      const confidenceHeight = (point.confidence / 100) * 20;

      ctx.lineTo(x, y + confidenceHeight / 2);
    }

    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // Draw labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';

    // Price labels
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (priceRange * i) / 5;
      const y = padding + chartHeight - ((price - minPrice + pricePadding) / (priceRange + pricePadding * 2)) * chartHeight;
      
      ctx.fillText(`$${price.toFixed(4)}`, padding - 5, y + 4);
    }

    // Time labels
    ctx.textAlign = 'center';
    for (let i = 0; i <= 5; i++) {
      const time = minTime + (timeRange * i) / 5;
      const x = padding + (chartWidth * i) / 5;
      const date = new Date(time);
      
      ctx.fillText(date.toLocaleTimeString(), x, padding + chartHeight + 20);
    }

  }, [chartData, priceChange]);

  const formatPrice = (price: number) => {
    return price.toFixed(6);
  };

  const formatPriceChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case '1h': return '1 Hour';
      case '6h': return '6 Hours';
      case '24h': return '24 Hours';
      default: return '1 Hour';
    }
  };

  return (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50 m-0' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className={`h-5 w-5 ${isLive ? 'text-green-500 animate-pulse' : 'text-gray-500'}`} />
              {symbol} Price Chart
            </CardTitle>
            <CardDescription>
              Real-time price data from Reflector oracle
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={isLive ? 'default' : 'secondary'}>
              {isLive ? 'LIVE' : 'PAUSED'}
            </Badge>
            
            <Button
              onClick={onToggleLive}
              variant="outline"
              size="sm"
            >
              {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <Button
              onClick={() => setIsFullscreen(!isFullscreen)}
              variant="outline"
              size="sm"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price Summary */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              ${formatPrice(currentPrice)}
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              priceChange >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {priceChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {formatPriceChange(priceChange)} ({getTimeRangeLabel()})
            </div>
          </div>

          <div className="text-right text-sm text-muted-foreground">
            <div>{chartData.length} data points</div>
            <div>Last update: {chartData.length > 0 ? new Date(chartData[chartData.length - 1].timestamp).toLocaleTimeString() : 'N/A'}</div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Time Range:</span>
          {(['1h', '6h', '24h'] as const).map((range) => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
            >
              {range}
            </Button>
          ))}
        </div>

        {/* Chart */}
        <div className={`relative ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-64'}`}>
          <canvas
            ref={canvasRef}
            className="w-full h-full border rounded"
            style={{ width: '100%', height: '100%' }}
          />
          
          {chartData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading chart data...</p>
              </div>
            </div>
          )}
        </div>

        {/* Chart Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Price</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500 opacity-30"></div>
              <span>Confidence</span>
            </div>
          </div>
          
          <div>
            Asset: {asset}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimePriceChart;
