import { DataTypes, Model, Sequelize } from 'sequelize';

export interface OracleSubscriptionAttributes {
  id: string;
  marketId: string;
  reflectorSubscriptionId?: string;
  baseAsset: string;
  quoteAsset: string;
  threshold: number;
  heartbeat: number;
  balance: string;
  isActive: boolean;
  createdAt: number;
  webhookUrl: string;
  oracleType: 'price_feed' | 'event_data';
  eventType?: string;
}

export interface OracleSubscriptionCreationAttributes extends Omit<OracleSubscriptionAttributes, 'id' | 'createdAt'> {}

export class OracleSubscription extends Model<OracleSubscriptionAttributes, OracleSubscriptionCreationAttributes> implements OracleSubscriptionAttributes {
  public id!: string;
  public marketId!: string;
  public reflectorSubscriptionId?: string;
  public baseAsset!: string;
  public quoteAsset!: string;
  public threshold!: number;
  public heartbeat!: number;
  public balance!: string;
  public isActive!: boolean;
  public createdAt!: number;
  public webhookUrl!: string;
  public oracleType!: 'price_feed' | 'event_data';
  public eventType?: string;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

export interface OracleDataAttributes {
  id: string;
  subscriptionId: string;
  marketId: string;
  dataType: 'price_update' | 'threshold_breach' | 'heartbeat' | 'event_data';
  symbol?: string;
  price?: string;
  previousPrice?: string;
  timestamp: number;
  data: any;
  source: string;
  processed: boolean;
}

export interface OracleDataCreationAttributes extends Omit<OracleDataAttributes, 'id' | 'timestamp' | 'processed'> {}

export class OracleData extends Model<OracleDataAttributes, OracleDataCreationAttributes> implements OracleDataAttributes {
  public id!: string;
  public subscriptionId!: string;
  public marketId!: string;
  public dataType!: 'price_update' | 'threshold_breach' | 'heartbeat' | 'event_data';
  public symbol?: string;
  public price?: string;
  public previousPrice?: string;
  public timestamp!: number;
  public data!: any;
  public source!: string;
  public processed!: boolean;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

export const initOracleSubscriptionModel = (sequelize: Sequelize): typeof OracleSubscription => {
  OracleSubscription.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      marketId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'markets',
          key: 'id',
        },
        onDelete: 'CASCADE',
        comment: 'Reference to market',
      },
      reflectorSubscriptionId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Reflector subscription ID',
      },
      baseAsset: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Base asset symbol',
      },
      quoteAsset: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Quote asset symbol',
      },
      threshold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Threshold for triggering (per ten-thousand)',
      },
      heartbeat: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Heartbeat interval in minutes',
      },
      balance: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: false,
        comment: 'XRF token balance for subscription',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether subscription is active',
      },
      createdAt: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: () => Date.now(),
        comment: 'Unix timestamp when subscription was created',
      },
      webhookUrl: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'Webhook URL for notifications',
      },
      oracleType: {
        type: DataTypes.ENUM('price_feed', 'event_data'),
        allowNull: false,
        comment: 'Type of oracle data',
      },
      eventType: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Type of event for event_data oracle',
      },
    },
    {
      sequelize,
      tableName: 'oracle_subscriptions',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['marketId'],
        },
        {
          fields: ['isActive'],
        },
        {
          fields: ['oracleType'],
        },
        {
          fields: ['reflectorSubscriptionId'],
          unique: true,
        },
        {
          fields: ['marketId', 'oracleType'],
        },
      ],
    }
  );

  return OracleSubscription;
};

export const initOracleDataModel = (sequelize: Sequelize): typeof OracleData => {
  OracleData.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      subscriptionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'oracle_subscriptions',
          key: 'id',
        },
        onDelete: 'CASCADE',
        comment: 'Reference to oracle subscription',
      },
      marketId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'markets',
          key: 'id',
        },
        onDelete: 'CASCADE',
        comment: 'Reference to market',
      },
      dataType: {
        type: DataTypes.ENUM('price_update', 'threshold_breach', 'heartbeat', 'event_data'),
        allowNull: false,
        comment: 'Type of oracle data',
      },
      symbol: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Asset symbol for price data',
      },
      price: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: true,
        comment: 'Current price',
      },
      previousPrice: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: true,
        comment: 'Previous price for comparison',
      },
      timestamp: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: () => Date.now(),
        comment: 'Unix timestamp of data',
      },
      data: {
        type: DataTypes.JSONB,
        allowNull: false,
        comment: 'Raw oracle data',
      },
      source: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'reflector',
        comment: 'Source of oracle data',
      },
      processed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether data has been processed',
      },
    },
    {
      sequelize,
      tableName: 'oracle_data',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['subscriptionId'],
        },
        {
          fields: ['marketId'],
        },
        {
          fields: ['dataType'],
        },
        {
          fields: ['timestamp'],
        },
        {
          fields: ['processed'],
        },
        {
          fields: ['marketId', 'dataType'],
        },
        {
          fields: ['timestamp', 'processed'],
        },
      ],
    }
  );

  return OracleData;
};
