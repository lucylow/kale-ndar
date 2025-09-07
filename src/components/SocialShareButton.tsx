import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  Twitter, 
  MessageCircle, 
  Send, 
  MessageSquare, 
  Linkedin,
  Copy,
  Check,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface SocialShareButtonProps {
  content: string;
  url?: string;
  platforms?: ('twitter' | 'discord' | 'telegram' | 'reddit' | 'linkedin')[];
  onShare?: (platform: string, content: string) => void;
  bonusPoints?: number;
  className?: string;
}

const SocialShareButton: React.FC<SocialShareButtonProps> = ({
  content,
  url = window.location.href,
  platforms = ['twitter', 'discord', 'telegram', 'reddit', 'linkedin'],
  onShare,
  bonusPoints,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState<string | null>(null);

  const platformIcons = {
    twitter: Twitter,
    discord: MessageCircle,
    telegram: Send,
    reddit: MessageSquare,
    linkedin: Linkedin,
  };

  const platformColors = {
    twitter: 'bg-blue-500 hover:bg-blue-600',
    discord: 'bg-indigo-500 hover:bg-indigo-600',
    telegram: 'bg-blue-400 hover:bg-blue-500',
    reddit: 'bg-orange-500 hover:bg-orange-600',
    linkedin: 'bg-blue-700 hover:bg-blue-800',
  };

  const generateShareUrl = (platform: string, text: string, shareUrl: string) => {
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
      case 'reddit':
        return `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      case 'telegram':
        return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
      default:
        return shareUrl;
    }
  };

  const handleShare = async (platform: string) => {
    try {
      setSharing(platform);
      
      const shareUrl = generateShareUrl(platform, content, url);
      
      if (platform === 'discord') {
        // For Discord, we'll copy to clipboard since we can't open a direct share URL
        await navigator.clipboard.writeText(`${content}\n${url}`);
        toast.success('Content copied to clipboard for Discord!');
      } else {
        // Open share URL in new window
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }

      // Call the onShare callback if provided
      if (onShare) {
        await onShare(platform, content);
      }

      // Show bonus points if applicable
      if (bonusPoints) {
        toast.success(`Shared on ${platform}! +${bonusPoints} bonus points earned!`);
      } else {
        toast.success(`Shared on ${platform}!`);
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Failed to share:', error);
      toast.error('Failed to share content');
    } finally {
      setSharing(null);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${content}\n${url}`);
      setCopied(true);
      toast.success('Content copied to clipboard!');
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy content');
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        Share
        {bonusPoints && (
          <Badge variant="secondary" className="ml-1 text-xs">
            +{bonusPoints} pts
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-background border rounded-lg shadow-lg p-3 z-50 min-w-[200px]">
          <div className="space-y-2">
            <div className="text-sm font-medium mb-2">Share on:</div>
            
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((platform) => {
                const Icon = platformIcons[platform];
                const isSharing = sharing === platform;
                
                return (
                  <Button
                    key={platform}
                    onClick={() => handleShare(platform)}
                    disabled={isSharing}
                    className={`${platformColors[platform]} text-white flex items-center gap-2 text-sm`}
                    size="sm"
                  >
                    {isSharing ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Icon className="h-3 w-3" />
                    )}
                    <span className="capitalize">{platform}</span>
                  </Button>
                );
              })}
            </div>
            
            <div className="pt-2 border-t">
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="w-full flex items-center gap-2"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialShareButton;
