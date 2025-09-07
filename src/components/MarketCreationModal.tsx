import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X, AlertCircle, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

interface MarketCreationModalProps {
  onMarketCreated?: (market: any) => void;
}

interface MarketFormData {
  title: string;
  description: string;
  category: string;
  endDate: Date;
  options: string[];
  initialLiquidity: number;
  fee: number;
  oracleType: string;
  resolutionCriteria: string;
}

const MARKET_CATEGORIES = [
  { id: 'crypto', name: 'Cryptocurrency', icon: '₿', color: 'bg-orange-100 text-orange-800' },
  { id: 'stocks', name: 'Stocks', icon: '📈', color: 'bg-green-100 text-green-800' },
  { id: 'sports', name: 'Sports', icon: '⚽', color: 'bg-blue-100 text-blue-800' },
  { id: 'politics', name: 'Politics', icon: '🏛️', color: 'bg-purple-100 text-purple-800' },
  { id: 'economics', name: 'Economics', icon: '💰', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'stellar', name: 'Stellar Ecosystem', icon: '⭐', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'weather', name: 'Weather', icon: '🌤️', color: 'bg-sky-100 text-sky-800' },
  { id: 'technology', name: 'Technology', icon: '💻', color: 'bg-gray-100 text-gray-800' },
];

const ORACLE_TYPES = [
  { id: 'reflector', name: 'Reflector Oracle', description: 'Real-time price feeds' },
  { id: 'manual', name: 'Manual Resolution', description: 'Community-based resolution' },
  { id: 'external', name: 'External API', description: 'Third-party data source' },
];

export const MarketCreationModal: React.FC<MarketCreationModalProps> = ({ onMarketCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<MarketFormData>({
    title: '',
    description: '',
    category: '',
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    options: ['Yes', 'No'],
    initialLiquidity: 100,
    fee: 2.5,
    oracleType: 'reflector',
    resolutionCriteria: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newOption, setNewOption] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Market title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Market description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (formData.endDate <= new Date()) {
      newErrors.endDate = 'End date must be in the future';
    }

    if (formData.options.length < 2) {
      newErrors.options = 'At least 2 options are required';
    }

    if (formData.initialLiquidity < 10) {
      newErrors.initialLiquidity = 'Minimum initial liquidity is 10 KALE';
    }

    if (formData.fee < 0 || formData.fee > 10) {
      newErrors.fee = 'Fee must be between 0% and 10%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateMarket = async () => {
    if (!validateForm()) return;

    setIsCreating(true);
    try {
      const marketData = {
        ...formData,
        endDate: formData.endDate.toISOString(),
        createdAt: new Date().toISOString(),
        status: 'active',
        totalLiquidity: formData.initialLiquidity,
        totalBets: 0,
        participants: 0,
      };

      // Call API to create market
      const response = await fetch('/api/markets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(marketData),
      });

      if (!response.ok) {
        throw new Error('Failed to create market');
      }

      const createdMarket = await response.json();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        options: ['Yes', 'No'],
        initialLiquidity: 100,
        fee: 2.5,
        oracleType: 'reflector',
        resolutionCriteria: '',
      });
      setErrors({});
      setIsOpen(false);

      // Notify parent component
      if (onMarketCreated) {
        onMarketCreated(createdMarket);
      }

      // Show success notification
      // You can implement a toast notification here

    } catch (error) {
      console.error('Error creating market:', error);
      setErrors({ general: 'Failed to create market. Please try again.' });
    } finally {
      setIsCreating(false);
    }
  };

  const addOption = () => {
    if (newOption.trim() && !formData.options.includes(newOption.trim())) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, newOption.trim()]
      }));
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const selectedCategory = MARKET_CATEGORIES.find(cat => cat.id === formData.category);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Market
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Prediction Market</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.general}</span>
              </div>
            </div>
          )}

          {/* Market Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Market Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Will Bitcoin reach $100,000 by end of 2024?"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Market Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about what this market is predicting..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={errors.description ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {MARKET_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all text-left',
                    formData.category === category.id
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="text-2xl mb-1">{category.icon}</div>
                  <div className="text-sm font-medium">{category.name}</div>
                </button>
              ))}
            </div>
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label>End Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.endDate && 'text-muted-foreground',
                    errors.endDate && 'border-red-500'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.endDate ? format(formData.endDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.endDate}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, endDate: date }))}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
          </div>

          {/* Market Options */}
          <div className="space-y-2">
            <Label>Market Options *</Label>
            <div className="space-y-2">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[index] = e.target.value;
                      setFormData(prev => ({ ...prev, options: newOptions }));
                    }}
                    className="flex-1"
                  />
                  {formData.options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Add new option..."
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOption()}
                />
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {errors.options && <p className="text-sm text-red-500">{errors.options}</p>}
          </div>

          {/* Oracle Type */}
          <div className="space-y-2">
            <Label>Resolution Method</Label>
            <Select value={formData.oracleType} onValueChange={(value) => setFormData(prev => ({ ...prev, oracleType: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORACLE_TYPES.map((oracle) => (
                  <SelectItem key={oracle.id} value={oracle.id}>
                    <div>
                      <div className="font-medium">{oracle.name}</div>
                      <div className="text-sm text-gray-500">{oracle.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Market Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Market Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="liquidity">Initial Liquidity (KALE)</Label>
                  <Input
                    id="liquidity"
                    type="number"
                    min="10"
                    value={formData.initialLiquidity}
                    onChange={(e) => setFormData(prev => ({ ...prev, initialLiquidity: Number(e.target.value) }))}
                    className={errors.initialLiquidity ? 'border-red-500' : ''}
                  />
                  {errors.initialLiquidity && <p className="text-sm text-red-500">{errors.initialLiquidity}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fee">Platform Fee (%)</Label>
                  <Input
                    id="fee"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, fee: Number(e.target.value) }))}
                    className={errors.fee ? 'border-red-500' : ''}
                  />
                  {errors.fee && <p className="text-sm text-red-500">{errors.fee}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Preview */}
          {formData.title && formData.category && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Market Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    {selectedCategory && (
                      <Badge className={selectedCategory.color}>
                        {selectedCategory.icon} {selectedCategory.name}
                      </Badge>
                    )}
                    <span className="text-sm text-gray-500">
                      Ends {format(formData.endDate, 'PPP')}
                    </span>
                  </div>
                  <h3 className="font-semibold">{formData.title}</h3>
                  <p className="text-sm text-gray-600">{formData.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.options.map((option, index) => (
                      <Badge key={index} variant="outline">
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateMarket} 
              disabled={isCreating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Market
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
