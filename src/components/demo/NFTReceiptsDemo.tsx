import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Target, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart,
  ArrowRightLeft,
  Shield,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NFTReceipt {
  id: string;
  tokenId: string;
  marketId: string;
  marketDescription: string;
  outcome: 'above' | 'below';
  amount: number;
  odds: number;
  owner: string;
  createdAt: Date;
  status: 'active' | 'listed' | 'sold' | 'won' | 'lost';
  listPrice?: number;
  currentValue?: number;
}

const NFTReceiptsDemo = () => {
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState<'mint' | 'list' | 'trade' | 'portfolio'>('mint');
  const [betAmount, setBetAmount] = useState(5000);
  const [betOutcome, setBetOutcome] = useState<'above' | 'below'>('above');
  const [listPrice, setListPrice] = useState(6000);
  const [bidPrice, setBidPrice] = useState(5500);
  
  const [nftReceipts, setNftReceipts] = useState<NFTReceipt[]>([
    {
      id: 'receipt1',
      tokenId: 'NFT-001',
      marketId: 'market_btc_100k',
      marketDescription: 'Will Bitcoin reach $100,000 by December 31, 2024?',
      outcome: 'above',
      amount: 10000,
      odds: 2.5,
      owner: 'Demo User',
      createdAt: new Date(),
      status: 'active',
      currentValue: 12000,
    },
    {
      id: 'receipt2',
      tokenId: 'NFT-002',
      marketId: 'market_eth_5k',
      marketDescription: 'Will Ethereum reach $5,000 before Q2 2024 ends?',
      outcome: 'below',
      amount: 7500,
      odds: 1.8,
      owner: 'Demo User',
      createdAt: new Date(),
      status: 'listed',
      listPrice: 8000,
      currentValue: 8500,
    },
  ]);

  const mintReceipt = () => {
    const newReceipt: NFTReceipt = {
      id: `receipt${Date.now()}`,
      tokenId: `NFT-${String(nftReceipts.length + 1).padStart(3, '0')}`,
      marketId: 'market_btc_100k',
      marketDescription: 'Will Bitcoin reach $100,000 by December 31, 2024?',
      outcome: betOutcome,
      amount: betAmount,
      odds: betOutcome === 'above' ? 2.5 : 1.8,
      owner: 'Demo User',
      createdAt: new Date(),
      status: 'active',
      currentValue: betAmount * (betOutcome === 'above' ? 2.5 : 1.8),
    };
    
    setNftReceipts([...nftReceipts, newReceipt]);
    toast({
      title: "NFT Receipt Minted! 🎨",
      description: `Created NFT-${String(nftReceipts.length + 1).padStart(3, '0')} for your ${betAmount} KALE bet`,
      duration: 3000,
    });
    setActiveStep('list');
  };

  const listReceipt = (receiptId: string) => {
    setNftReceipts(receipts => 
      receipts.map(receipt => 
        receipt.id === receiptId 
          ? { ...receipt, status: 'listed', listPrice }
          : receipt
      )
    );
    toast({
      title: "Receipt Listed! 📋",
      description: `NFT receipt listed for ${listPrice} KALE on Stellar DEX`,
      duration: 3000,
    });
    setActiveStep('trade');
  };

  const placeBid = (receiptId: string) => {
    toast({
      title: "Bid Placed! 💰",
      description: `Placed bid of ${bidPrice} KALE on NFT receipt`,
      duration: 3000,
    });
  };

  const executeTrade = (receiptId: string) => {
    setNftReceipts(receipts => 
      receipts.map(receipt => 
        receipt.id === receiptId 
          ? { ...receipt, status: 'sold', owner: 'New Buyer' }
          : receipt
      )
    );
    toast({
      title: "Trade Executed! ✅",
      description: "NFT receipt successfully traded on Stellar DEX",
      duration: 3000,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'listed': return 'bg-blue-100 text-blue-800';
      case 'sold': return 'bg-purple-100 text-purple-800';
      case 'won': return 'bg-yellow-100 text-yellow-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            NFT Receipts Demo - Tradable Bet Tokens
          </CardTitle>
          <CardDescription>
            Experience NFT receipts that represent your bets and can be traded on Stellar DEX
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Demo Mode
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {nftReceipts.length} Receipts
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              ${nftReceipts.reduce((sum, r) => sum + (r.currentValue || 0), 0) / 1000}K Value
            </Badge>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-4">
            {['mint', 'list', 'trade', 'portfolio'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  activeStep === step 
                    ? 'bg-purple-500 text-white' 
                    : ['mint', 'list', 'trade', 'portfolio'].indexOf(activeStep) > index
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm ${
                  activeStep === step ? 'text-purple-600 font-medium' : 'text-gray-500'
                }`}>
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </span>
                {index < 3 && <div className="w-8 h-0.5 bg-gray-200 ml-2" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Mint Receipt */}
      {activeStep === 'mint' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Step 1: Mint NFT Receipt
            </CardTitle>
            <CardDescription>
              Create an NFT receipt for your bet that can be traded
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold mb-2">Available Market</h4>
              <p className="text-sm">Will Bitcoin reach $100,000 by December 31, 2024?</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>Current Price: $85,000</span>
                <span>Target: $100,000</span>
                <span>Resolves: Dec 31, 2024</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="betAmount">Bet Amount (KALE)</Label>
                <Input
                  id="betAmount"
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="betOutcome">Prediction</Label>
                <div className="flex gap-2">
                  <Button
                    variant={betOutcome === 'above' ? 'default' : 'outline'}
                    onClick={() => setBetOutcome('above')}
                    className="flex-1"
                  >
                    Above $100k
                  </Button>
                  <Button
                    variant={betOutcome === 'below' ? 'default' : 'outline'}
                    onClick={() => setBetOutcome('below')}
                    className="flex-1"
                  >
                    Below $100k
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h5 className="font-semibold mb-2">Receipt Preview</h5>
              <div className="space-y-1 text-sm">
                <div>Token ID: NFT-{String(nftReceipts.length + 1).padStart(3, '0')}</div>
                <div>Market: Bitcoin $100k by Dec 2024</div>
                <div>Outcome: {betOutcome}</div>
                <div>Amount: {betAmount} KALE</div>
                <div>Estimated Value: {betAmount * (betOutcome === 'above' ? 2.5 : 1.8)} KALE</div>
              </div>
            </div>
            
            <Button onClick={mintReceipt} className="w-full">
              Mint NFT Receipt
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: List Receipt */}
      {activeStep === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Step 2: List Receipt for Sale
            </CardTitle>
            <CardDescription>
              List your NFT receipt on Stellar DEX for trading
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {nftReceipts.filter(r => r.status === 'active').map((receipt) => (
              <div key={receipt.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">{receipt.tokenId}</h4>
                    <p className="text-sm text-gray-600">{receipt.marketDescription}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm">
                      <span>Amount: {receipt.amount} KALE</span>
                      <span>Outcome: {receipt.outcome}</span>
                      <span>Value: {receipt.currentValue} KALE</span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(receipt.status)}>
                    {receipt.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="listPrice">List Price (KALE)</Label>
                    <Input
                      id="listPrice"
                      type="number"
                      value={listPrice}
                      onChange={(e) => setListPrice(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={() => listReceipt(receipt.id)}
                      className="w-full"
                    >
                      List on DEX
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Trade Receipts */}
      {activeStep === 'trade' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Step 3: Trade Receipts
            </CardTitle>
            <CardDescription>
              Buy and sell NFT receipts on the secondary market
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bidPrice">Bid Price (KALE)</Label>
                <Input
                  id="bidPrice"
                  type="number"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(Number(e.target.value))}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={() => placeBid('receipt2')}
                  className="w-full"
                >
                  Place Bid
                </Button>
              </div>
            </div>
            
            {nftReceipts.filter(r => r.status === 'listed').map((receipt) => (
              <div key={receipt.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">{receipt.tokenId}</h4>
                    <p className="text-sm text-gray-600">{receipt.marketDescription}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm">
                      <span>Amount: {receipt.amount} KALE</span>
                      <span>Outcome: {receipt.outcome}</span>
                      <span>List Price: {receipt.listPrice} KALE</span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(receipt.status)}>
                    {receipt.status}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => executeTrade(receipt.id)}
                    className="flex-1"
                  >
                    Buy Now
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => placeBid(receipt.id)}
                    className="flex-1"
                  >
                    Place Bid
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Portfolio */}
      {activeStep === 'portfolio' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Step 4: Receipt Portfolio
            </CardTitle>
            <CardDescription>
              View and manage your NFT receipt collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nftReceipts.map((receipt) => (
                <div key={receipt.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{receipt.tokenId}</h4>
                      <p className="text-sm text-gray-600">{receipt.marketDescription}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <span>Amount: {receipt.amount} KALE</span>
                        <span>Outcome: {receipt.outcome}</span>
                        <span>Value: {receipt.currentValue} KALE</span>
                        <span>Status: {receipt.status}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(receipt.status)}>
                      {receipt.status}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Token ID
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View on Explorer
                    </Button>
                    {receipt.status === 'active' && (
                      <Button size="sm">
                        List for Sale
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Receipt Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Receipt Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{nftReceipts.length}</div>
              <div className="text-sm text-gray-600">Total Receipts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {nftReceipts.filter(r => r.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {nftReceipts.filter(r => r.status === 'listed').length}
              </div>
              <div className="text-sm text-gray-600">Listed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                ${nftReceipts.reduce((sum, r) => sum + (r.currentValue || 0), 0) / 1000}K
              </div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NFTReceiptsDemo;
