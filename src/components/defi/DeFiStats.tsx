import React from 'react';
import { TrendingUp, Shield, Zap, Users, DollarSign, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DeFiStats as DeFiStatsType } from '@/services/defiService';

interface DeFiStatsProps {
  stats: DeFiStatsType;
  isLoading?: boolean;
}

const DeFiStats: React.FC<DeFiStatsProps> = ({ stats, isLoading = false }) => {
  const statCards = [
    {
      title: 'Total Value Locked',
      value: `$${(stats.totalValueLocked / 1000000).toFixed(1)}M`,
      icon: TrendingUp,
      color: 'purple',
      description: 'Across all protocols'
    },
    {
      title: 'Active Protocols',
      value: stats.activeProtocols.toString(),
      icon: Shield,
      color: 'blue',
      description: 'Currently operational'
    },
    {
      title: 'Average Yield',
      value: `${stats.totalYield}%`,
      icon: Zap,
      color: 'green',
      description: 'Weighted average APY'
    },
    {
      title: 'Active Users',
      value: stats.users.toLocaleString(),
      icon: Users,
      color: 'orange',
      description: 'Using DeFi protocols'
    },
    {
      title: 'Total Fees',
      value: `$${(stats.totalFees / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: 'teal',
      description: 'Generated this month'
    },
    {
      title: 'Average APY',
      value: `${stats.averageApy.toFixed(1)}%`,
      icon: BarChart3,
      color: 'indigo',
      description: 'Across all strategies'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      purple: 'bg-purple-100 text-purple-600',
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      orange: 'bg-orange-100 text-orange-600',
      teal: 'bg-teal-100 text-teal-600',
      indigo: 'bg-indigo-100 text-indigo-600'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-100 text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(stat.color)}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DeFiStats;
