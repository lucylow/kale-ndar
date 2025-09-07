import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface SocialShareTemplate {
  id: string;
  name: string;
  platform: 'twitter' | 'discord' | 'telegram' | 'reddit' | 'linkedin';
  template: string;
  variables: string[];
  bonusPoints: number;
  isActive: boolean;
}

export interface SocialShareRequest {
  userId: string;
  competitionId?: string;
  betId?: string;
  marketId?: string;
  platform: SocialShareTemplate['platform'];
  templateId: string;
  customContent?: string;
  variables?: Record<string, string>;
}

export interface SocialShareResult {
  id: string;
  platform: string;
  content: string;
  shareUrl?: string;
  bonusPoints: number;
  timestamp: number;
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
  };
}

export interface SocialEngagement {
  shareId: string;
  platform: string;
  likes: number;
  shares: number;
  comments: number;
  views?: number;
  lastUpdated: number;
}

export class SocialSharingService {
  private shareTemplates: Map<string, SocialShareTemplate> = new Map();
  private socialShares: Map<string, SocialShareResult> = new Map();
  private engagements: Map<string, SocialEngagement> = new Map();

  constructor() {
    this.initializeShareTemplates();
  }

  /**
   * Generate social share content
   */
  async generateShareContent(request: SocialShareRequest): Promise<SocialShareResult> {
    try {
      const template = this.shareTemplates.get(request.templateId);
      if (!template || !template.isActive) {
        throw new Error('Share template not found or inactive');
      }

      if (template.platform !== request.platform) {
        throw new Error('Template platform mismatch');
      }

      // Generate content from template
      let content = template.template;
      
      // Replace template variables
      if (request.variables) {
        for (const [key, value] of Object.entries(request.variables)) {
          content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
      }

      // Use custom content if provided
      if (request.customContent) {
        content = request.customContent;
      }

      // Ensure content meets platform requirements
      content = this.validateContentForPlatform(content, request.platform);

      const shareResult: SocialShareResult = {
        id: uuidv4(),
        platform: request.platform,
        content,
        bonusPoints: template.bonusPoints,
        timestamp: Date.now(),
      };

      // Store the share
      this.socialShares.set(shareResult.id, shareResult);

      logger.info('Social share content generated:', {
        shareId: shareResult.id,
        userId: request.userId,
        platform: request.platform,
        templateId: request.templateId,
        bonusPoints: shareResult.bonusPoints,
      });

      return shareResult;
    } catch (error) {
      logger.error('Failed to generate social share content:', error);
      throw error;
    }
  }

  /**
   * Get share templates for a platform
   */
  async getShareTemplates(platform?: SocialShareTemplate['platform']): Promise<SocialShareTemplate[]> {
    try {
      const templates = Array.from(this.shareTemplates.values())
        .filter(template => template.isActive && (!platform || template.platform === platform));

      return templates;
    } catch (error) {
      logger.error('Failed to get share templates:', error);
      throw error;
    }
  }

  /**
   * Create custom share template
   */
  async createShareTemplate(
    templateData: Omit<SocialShareTemplate, 'id'>
  ): Promise<SocialShareTemplate> {
    try {
      const template: SocialShareTemplate = {
        id: uuidv4(),
        ...templateData,
      };

      this.shareTemplates.set(template.id, template);

      logger.info('Share template created:', {
        templateId: template.id,
        name: template.name,
        platform: template.platform,
        bonusPoints: template.bonusPoints,
      });

      return template;
    } catch (error) {
      logger.error('Failed to create share template:', error);
      throw error;
    }
  }

  /**
   * Update social engagement metrics
   */
  async updateEngagement(
    shareId: string,
    engagement: Partial<SocialEngagement>
  ): Promise<SocialEngagement> {
    try {
      const existingEngagement = this.engagements.get(shareId) || {
        shareId,
        platform: '',
        likes: 0,
        shares: 0,
        comments: 0,
        lastUpdated: Date.now(),
      };

      const updatedEngagement: SocialEngagement = {
        ...existingEngagement,
        ...engagement,
        lastUpdated: Date.now(),
      };

      this.engagements.set(shareId, updatedEngagement);

      logger.info('Social engagement updated:', {
        shareId,
        likes: updatedEngagement.likes,
        shares: updatedEngagement.shares,
        comments: updatedEngagement.comments,
      });

      return updatedEngagement;
    } catch (error) {
      logger.error('Failed to update social engagement:', error);
      throw error;
    }
  }

  /**
   * Get user's social sharing stats
   */
  async getUserSocialStats(userId: string): Promise<{
    totalShares: number;
    totalBonusPoints: number;
    platformBreakdown: Record<string, number>;
    topPerformingContent: SocialShareResult[];
  }> {
    try {
      const userShares = Array.from(this.socialShares.values())
        .filter(share => share.id.startsWith(userId)); // Mock filtering

      const totalShares = userShares.length;
      const totalBonusPoints = userShares.reduce((sum, share) => sum + share.bonusPoints, 0);

      const platformBreakdown: Record<string, number> = {};
      userShares.forEach(share => {
        platformBreakdown[share.platform] = (platformBreakdown[share.platform] || 0) + 1;
      });

      const topPerformingContent = userShares
        .sort((a, b) => (b.engagement?.likes || 0) - (a.engagement?.likes || 0))
        .slice(0, 5);

      return {
        totalShares,
        totalBonusPoints,
        platformBreakdown,
        topPerformingContent,
      };
    } catch (error) {
      logger.error('Failed to get user social stats:', error);
      throw error;
    }
  }

  /**
   * Generate shareable URLs for different platforms
   */
  generateShareUrls(content: string, baseUrl: string): Record<string, string> {
    const encodedContent = encodeURIComponent(content);
    
    return {
      twitter: `https://twitter.com/intent/tweet?text=${encodedContent}&url=${baseUrl}`,
      discord: `https://discord.com/channels/@me`, // Would need Discord bot integration
      telegram: `https://t.me/share/url?url=${baseUrl}&text=${encodedContent}`,
      reddit: `https://reddit.com/submit?url=${baseUrl}&title=${encodedContent}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${baseUrl}`,
    };
  }

  /**
   * Validate content for platform requirements
   */
  private validateContentForPlatform(content: string, platform: SocialShareTemplate['platform']): string {
    const limits = {
      twitter: 280,
      discord: 2000,
      telegram: 4096,
      reddit: 40000,
      linkedin: 3000,
    };

    const limit = limits[platform] || 280;
    
    if (content.length > limit) {
      return content.substring(0, limit - 3) + '...';
    }

    return content;
  }

  /**
   * Initialize default share templates
   */
  private initializeShareTemplates(): void {
    const defaultTemplates: SocialShareTemplate[] = [
      {
        id: 'bet-win-twitter',
        name: 'Winning Bet Tweet',
        platform: 'twitter',
        template: '🎯 Just won {{amount}} KALE on KALE-ndar! Predicted {{outcome}} for {{market}} correctly! 🚀 #KALEndar #PredictionMarket #Stellar',
        variables: ['amount', 'outcome', 'market'],
        bonusPoints: 15,
        isActive: true,
      },
      {
        id: 'competition-join-twitter',
        name: 'Competition Join Tweet',
        platform: 'twitter',
        template: '🏆 Joined the {{season}} competition on KALE-ndar! Ready to compete for {{prizePool}} KALE rewards! 💪 #KALEndar #Competition #Stellar',
        variables: ['season', 'prizePool'],
        bonusPoints: 10,
        isActive: true,
      },
      {
        id: 'leaderboard-twitter',
        name: 'Leaderboard Achievement Tweet',
        platform: 'twitter',
        template: '🏅 Ranked #{{rank}} in {{category}} on KALE-ndar! {{score}} points and climbing! 📈 #KALEndar #Leaderboard #Stellar',
        variables: ['rank', 'category', 'score'],
        bonusPoints: 20,
        isActive: true,
      },
      {
        id: 'team-bet-discord',
        name: 'Team Bet Discord',
        platform: 'discord',
        template: '🎯 **Team Bet Alert!** Our squad just placed a {{amount}} KALE bet on {{market}}! Let\'s go team! 🚀 #KALEndar #TeamBetting',
        variables: ['amount', 'market'],
        bonusPoints: 12,
        isActive: true,
      },
      {
        id: 'prediction-reddit',
        name: 'Prediction Analysis Reddit',
        platform: 'reddit',
        template: '📊 **Market Analysis**: {{market}}\n\n**Prediction**: {{outcome}}\n\n**Reasoning**: {{analysis}}\n\n**Platform**: KALE-ndar (Stellar-based prediction market)\n\nWhat do you think? #KALEndar #PredictionMarket',
        variables: ['market', 'outcome', 'analysis'],
        bonusPoints: 25,
        isActive: true,
      },
      {
        id: 'achievement-linkedin',
        name: 'Professional Achievement LinkedIn',
        platform: 'linkedin',
        template: '🎯 Excited to share my latest achievement on KALE-ndar, a Stellar-based prediction market platform!\n\n{{achievement}}\n\nThis innovative platform combines DeFi, prediction markets, and social features. The future of decentralized prediction markets is here! #DeFi #Stellar #PredictionMarkets #Innovation',
        variables: ['achievement'],
        bonusPoints: 30,
        isActive: true,
      },
    ];

    defaultTemplates.forEach(template => {
      this.shareTemplates.set(template.id, template);
    });
  }
}
