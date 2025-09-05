import { DataTypes, Model, Sequelize } from 'sequelize';

export interface MarketAttributes {
  id: string;
  creator: string;
  description: string;
  assetSymbol: string;
  targetPrice: string;
  condition: 'above' | 'below';
  resolveTime: number;
  createdAt: number;
  resolved: boolean;
  outcome?: boolean;
  totalFor: string;
  totalAgainst: string;
  marketFee: string;
  contractAddress?: string;
  resolutionType?: 'manual' | 'oracle' | 'timeout';
  resolutionData?: any;
  autoResolveEnabled: boolean;
}

export interface MarketCreationAttributes extends Omit<MarketAttributes, 'id' | 'createdAt' | 'resolved' | 'totalFor' | 'totalAgainst'> {}

export class Market extends Model<MarketAttributes, MarketCreationAttributes> implements MarketAttributes {
  public id!: string;
  public creator!: string;
  public description!: string;
  public assetSymbol!: string;
  public targetPrice!: string;
  public condition!: 'above' | 'below';
  public resolveTime!: number;
  public createdAt!: number;
  public resolved!: boolean;
  public outcome?: boolean;
  public totalFor!: string;
  public totalAgainst!: string;
  public marketFee!: string;
  public contractAddress?: string;
  public resolutionType?: 'manual' | 'oracle' | 'timeout';
  public resolutionData?: any;
  public autoResolveEnabled!: boolean;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

export const initMarketModel = (sequelize: Sequelize): typeof Market => {
  Market.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      creator: {
        type: DataTypes.STRING(56),
        allowNull: false,
        comment: 'Stellar address of market creator',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [10, 1000],
        },
      },
      assetSymbol: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Asset symbol (e.g., BTC, ETH, AAPL)',
      },
      targetPrice: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: false,
        comment: 'Target price for prediction',
      },
      condition: {
        type: DataTypes.ENUM('above', 'below'),
        allowNull: false,
        comment: 'Prediction condition',
      },
      resolveTime: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: 'Unix timestamp when market resolves',
      },
      createdAt: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: () => Date.now(),
        comment: 'Unix timestamp when market was created',
      },
      resolved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether market has been resolved',
      },
      outcome: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        comment: 'Market outcome (true for above/for, false for below/against)',
      },
      totalFor: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: false,
        defaultValue: '0',
        comment: 'Total amount bet for/above',
      },
      totalAgainst: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: false,
        defaultValue: '0',
        comment: 'Total amount bet against/below',
      },
      marketFee: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: false,
        comment: 'Fee paid to create market',
      },
      contractAddress: {
        type: DataTypes.STRING(56),
        allowNull: true,
        comment: 'Soroban contract address for this market',
      },
      resolutionType: {
        type: DataTypes.ENUM('manual', 'oracle', 'timeout'),
        allowNull: true,
        comment: 'How the market was resolved',
      },
      resolutionData: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Additional data from resolution (oracle data, etc.)',
      },
      autoResolveEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether auto-resolution is enabled',
      },
    },
    {
      sequelize,
      tableName: 'markets',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['creator'],
        },
        {
          fields: ['resolved'],
        },
        {
          fields: ['resolveTime'],
        },
        {
          fields: ['assetSymbol'],
        },
        {
          fields: ['createdAt'],
        },
        {
          fields: ['creator', 'resolved'],
        },
      ],
    }
  );

  return Market;
};
