import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/contexts/WalletContext';
import { reflectorOracleService } from '@/services/reflector-oracle';
import { 
  Plus, 
  Globe, 
  Database, 
  Zap, 
  Shield, 
  Clock, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface CustomFeedForm {
  name: string;
  description: string;
  assetCode: string;
  baseCurrency: string;
  dataSource: string;
  updateFrequency: string;
  confidenceThreshold: number;
  costPerUpdate: number;
  maxSubscribers: number;
  isPublic: boolean;
}

interface CreateCustomFeedModalProps {
  onFeedCreated?: (feed: any) => void;
}

const CreateCustomFeedModal: React.FC<CreateCustomFeedModalProps> = ({ onFeedCreated }) => {
  const { toast } = useToast();
  const { wallet } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<CustomFeedForm>({
    name: '',
    description: '',
    assetCode: '',
    baseCurrency: 'USD',
    dataSource: 'external_api',
    updateFrequency: 'hourly',
    confidenceThreshold: 80,
    costPerUpdate: 1.0,
    maxSubscribers: 1000,
    isPublic: true,
  });

  const dataSources = [
    { value: 'external_api', label: 'External API', description: 'Connect to external price APIs' },
    { value: 'cex', label: 'Centralized Exchange', description: 'Data from major exchanges' },
    { value: 'dex', label: 'Decentralized Exchange', description: 'On-chain DEX data' },
    { value: 'custom', label: 'Custom Source', description: 'Your own data source' },
  ];

  const updateFrequencies = [
    { value: 'realtime', label: 'Real-time', cost: 5.0, description: 'Updates every few seconds' },
    { value: 'minute', label: 'Per Minute', cost: 2.0, description: 'Updates every minute' },
    { value: 'hourly', label: 'Hourly', cost: 1.0, description: 'Updates every hour' },
    { value: 'daily', label: 'Daily', cost: 0.5, description: 'Updates once per day' },
  ];

  const baseCurrencies = ['USD', 'EUR', 'BTC', 'ETH', 'XLM'];

  const validateForm = () => {
    if (!form.name.trim()) return 'Feed name is required';
    if (!form.assetCode.trim()) return 'Asset code is required';
    if (!form.description.trim()) return 'Description is required';
    if (form.confidenceThreshold < 50 || form.confidenceThreshold > 100) {
      return 'Confidence threshold must be between 50 and 100';
    }
    if (form.costPerUpdate <= 0) return 'Cost per update must be greater than 0';
    if (form.maxSubscribers <= 0) return 'Max subscribers must be greater than 0';
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      toast({
        title: "Validation Error",
        description: error,
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    if (!wallet.isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create a custom feed",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    try {
      setIsLoading(true);

      // Create the custom feed
      const feedData = {
        ...form,
        creator: wallet.publicKey,
        createdAt: new Date().toISOString(),
        status: 'pending',
        totalSubscribers: 0,
        totalRevenue: 0,
      };

      // Simulate API call to create feed
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Custom Feed Created! 🎉",
        description: `Your feed "${form.name}" has been created and is pending approval`,
        duration: 5000,
      });

      // Call the callback if provided
      if (onFeedCreated) {
        onFeedCreated(feedData);
      }

      // Reset form and close modal
      setForm({
        name: '',
        description: '',
        assetCode: '',
        baseCurrency: 'USD',
        dataSource: 'external_api',
        updateFrequency: 'hourly',
        confidenceThreshold: 80,
        costPerUpdate: 1.0,
        maxSubscribers: 1000,
        isPublic: true,
      });
      setIsOpen(false);

    } catch (error) {
      console.error('Error creating custom feed:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create custom feed",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFrequencyChange = (frequency: string) => {
    const freqData = updateFrequencies.find(f => f.value === frequency);
    setForm(prev => ({
      ...prev,
      updateFrequency: frequency,
      costPerUpdate: freqData?.cost || 1.0,
    }));
  };

  const estimatedRevenue = form.costPerUpdate * form.maxSubscribers * 0.1; // 10% utilization estimate

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Feed
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            Create Custom Price Feed
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>
                Define the basic details of your custom price feed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Feed Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Custom BTC/USD Feed"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="assetCode">Asset Code *</Label>
                  <Input
                    id="assetCode"
                    value={form.assetCode}
                    onChange={(e) => setForm(prev => ({ ...prev, assetCode: e.target.value.toUpperCase() }))}
                    placeholder="e.g., BTC"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your custom price feed..."
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="baseCurrency">Base Currency</Label>
                  <Select
                    value={form.baseCurrency}
                    onValueChange={(value) => setForm(prev => ({ ...prev, baseCurrency: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {baseCurrencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dataSource">Data Source</Label>
                  <Select
                    value={form.dataSource}
                    onValueChange={(value) => setForm(prev => ({ ...prev, dataSource: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSources.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          <div>
                            <div className="font-medium">{source.label}</div>
                            <div className="text-xs text-muted-foreground">{source.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuration</CardTitle>
              <CardDescription>
                Set up the technical parameters for your feed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="updateFrequency">Update Frequency</Label>
                <Select
                  value={form.updateFrequency}
                  onValueChange={handleFrequencyChange}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {updateFrequencies.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <div className="font-medium">{freq.label}</div>
                            <div className="text-xs text-muted-foreground">{freq.description}</div>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {freq.cost} XRF
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="confidenceThreshold">Confidence Threshold (%)</Label>
                  <Input
                    id="confidenceThreshold"
                    type="number"
                    min="50"
                    max="100"
                    value={form.confidenceThreshold}
                    onChange={(e) => setForm(prev => ({ ...prev, confidenceThreshold: parseInt(e.target.value) }))}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="maxSubscribers">Max Subscribers</Label>
                  <Input
                    id="maxSubscribers"
                    type="number"
                    min="1"
                    value={form.maxSubscribers}
                    onChange={(e) => setForm(prev => ({ ...prev, maxSubscribers: parseInt(e.target.value) }))}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="costPerUpdate">Cost Per Update (XRF)</Label>
                <Input
                  id="costPerUpdate"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={form.costPerUpdate}
                  onChange={(e) => setForm(prev => ({ ...prev, costPerUpdate: parseFloat(e.target.value) }))}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Revenue Estimation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Revenue Estimation
              </CardTitle>
              <CardDescription>
                Estimated potential revenue from your custom feed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Cost per Update</p>
                  <p className="text-lg font-bold text-foreground">{form.costPerUpdate} XRF</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Max Subscribers</p>
                  <p className="text-lg font-bold text-foreground">{form.maxSubscribers.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-green-100 rounded-lg">
                  <p className="text-sm text-green-600">Estimated Monthly Revenue</p>
                  <p className="text-lg font-bold text-green-700">{estimatedRevenue.toFixed(2)} XRF</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Requirements & Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Data Quality</p>
                    <p className="text-sm text-muted-foreground">
                      Ensure your data source provides accurate, real-time price information
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Reliability</p>
                    <p className="text-sm text-muted-foreground">
                      Maintain 99%+ uptime for your data source
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Compliance</p>
                    <p className="text-sm text-muted-foreground">
                      Ensure compliance with data provider terms of service
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Review Process</p>
                    <p className="text-sm text-muted-foreground">
                      All custom feeds are subject to review and approval (24-48 hours)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !!validateForm()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Feed...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Custom Feed
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCustomFeedModal;
