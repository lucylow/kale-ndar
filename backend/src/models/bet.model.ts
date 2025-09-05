import { DataTypes, Model, Sequelize } from 'sequelize';

export interface BetAttributes {
  id: string;
  marketId: string;
  userId: string;
  outcome: string;
  amount: string;
  placedAt: number;
  settled: boolean;
  payoutAmount?: string;
  transactionHash?: string;
  odds?: string;
  profitLoss?: string;
  isWinner?: boolean;
}

export interface BetCreationAttributes extends Omit<BetAttributes, 'id' | 'placedAt' | 'settled'> {}

export class Bet extends Model<BetAttributes, BetCreationAttributes> implements BetAttributes {
  public id!: string;
  public marketId!: string;
  public userId!: string;
  public outcome!: string;
  public amount!: string;
  public placedAt!: number;
  public settled!: boolean;
  public payoutAmount?: string;
  public transactionHash?: string;
  public odds?: string;
  public profitLoss?: string;
  public isWinner?: boolean;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

export const initBetModel = (sequelize: Sequelize): typeof Bet => {
  Bet.init(
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
      userId: {
        type: DataTypes.STRING(56),
        allowNull: false,
        comment: 'Stellar address of bettor',
      },
      outcome: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Bet outcome (for, against, above, below)',
      },
      amount: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: false,
        comment: 'Amount bet in KALE tokens',
      },
      placedAt: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: () => Date.now(),
        comment: 'Unix timestamp when bet was placed',
      },
      settled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether bet has been settled',
      },
      payoutAmount: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: true,
        comment: 'Amount paid out to bettor',
      },
      transactionHash: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: 'Stellar transaction hash for bet placement',
      },
      odds: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
        comment: 'Odds when bet was placed',
      },
      profitLoss: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: true,
        comment: 'Profit or loss from this bet',
      },
      isWinner: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        comment: 'Whether this bet won',
      },
    },
    {
      sequelize,
      tableName: 'bets',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['marketId'],
        },
        {
          fields: ['userId'],
        },
        {
          fields: ['settled'],
        },
        {
          fields: ['placedAt'],
        },
        {
          fields: ['marketId', 'userId'],
        },
        {
          fields: ['marketId', 'outcome'],
        },
        {
          fields: ['userId', 'settled'],
        },
        {
          fields: ['transactionHash'],
          unique: true,
        },
      ],
    }
  );

  return Bet;
};
