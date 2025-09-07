import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Database, 
  RefreshCw, 
  Trash2, 
  Download, 
  Upload,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Users,
  Target,
  DollarSign
} from 'lucide-react';
import { DemoDataGenerator } from '@/utils/demoDataGenerator';
import { useToast } from '@/hooks/use-toast';

const DemoDataManager = () => {
  const { toast } = useToast();
  const [selectedScenario, setSelectedScenario] = useState<string>('bull_market');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);

  const scenarios = [
    {
      id: 'bull_market',
      name: 'Bull Market',
      description: 'Optimistic market with rising prices',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'bear_market',
      name: 'Bear Market',
      description: 'Pessimistic market with falling prices',
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      id: 'sideways',
      name: 'Sideways Market',
      description: 'Stable market with minimal movement',
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'volatile',
      name: 'Volatile Market',
      description: 'High volatility with large price swings',
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const generateData = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const data = DemoDataGenerator.generateRealisticScenario(selectedScenario as any);
      setGeneratedData(data);
      
      toast({
        title: "Demo Data Generated! 🎉",
        description: `Generated realistic ${scenarios.find(s => s.id === selectedScenario)?.name.toLowerCase()} scenario`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate demo data. Please try again.",
        duration: 3000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetData = () => {
    setGeneratedData(null);
    toast({
      title: "Data Reset",
      description: "Demo data has been cleared",
      duration: 2000,
    });
  };

  const exportData = () => {
    if (!generatedData) return;
    
    const dataStr = JSON.stringify(generatedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `kale-ndar-demo-data-${selectedScenario}-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported! 📁",
      description: "Demo data has been downloaded as JSON file",
      duration: 3000,
    });
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            setGeneratedData(data);
            toast({
              title: "Data Imported! 📥",
              description: "Demo data has been loaded successfully",
              duration: 3000,
            });
          } catch (error) {
            toast({
              title: "Import Failed",
              description: "Invalid JSON file. Please check the format.",
              duration: 3000,
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-500" />
            Demo Data Manager
          </CardTitle>
          <CardDescription>
            Generate realistic demo data for different market scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              Data Generator
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Realistic Scenarios
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Auto-Generated
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Market Scenario
          </CardTitle>
          <CardDescription>
            Choose a market scenario to generate realistic demo data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map((scenario) => {
              const IconComponent = scenario.icon;
              return (
                <div
                  key={scenario.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedScenario === scenario.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedScenario(scenario.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${scenario.bgColor}`}>
                      <IconComponent className={`h-5 w-5 ${scenario.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{scenario.name}</h3>
                      <p className="text-sm text-gray-600">{scenario.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={generateData}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Generate Demo Data
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={resetData}
              disabled={!generatedData}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Data Preview */}
      {generatedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Generated Data Preview
            </CardTitle>
            <CardDescription>
              Preview of the generated demo data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{generatedData.markets.length}</div>
                <div className="text-sm text-gray-600">Markets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{generatedData.users.length}</div>
                <div className="text-sm text-gray-600">Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{generatedData.bets.length}</div>
                <div className="text-sm text-gray-600">Bets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  ${(generatedData.markets.reduce((sum: number, m: any) => sum + m.totalFor + m.totalAgainst, 0) / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-gray-600">Total Volume</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Sample Markets</h4>
              <div className="space-y-2">
                {generatedData.markets.slice(0, 3).map((market: any) => (
                  <div key={market.id} className="p-3 border rounded-lg">
                    <h5 className="font-medium">{market.description}</h5>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>Target: ${market.targetPrice}</span>
                      <span>Current: ${market.currentPrice}</span>
                      <span>Volume: ${((market.totalFor + market.totalAgainst) / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button 
                onClick={exportData}
                variant="outline"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              
              <Button 
                onClick={importData}
                variant="outline"
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Management Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Additional data management options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Quick Actions</h5>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Generate Random Users
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Create Sample Markets
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Simulate Trading Activity
                </Button>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Data Operations</h5>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh All Data
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Validate Data
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoDataManager;
