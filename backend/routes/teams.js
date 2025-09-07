const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');

// Mock database for teams and team bets
let teams = [];
let teamBets = [];

/**
 * Create a new team vault
 */
router.post('/create', async (req, res) => {
  try {
    const {
      name,
      description,
      teamType,
      minDeposit,
      maxMembers,
      bettingStrategy,
      creatorSecret
    } = req.body;

    // Validate required fields
    if (!name || !description || !creatorSecret) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, description, creatorSecret'
      });
    }

    // Validate team type
    if (!['friends', 'public', 'competitive'].includes(teamType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid team type. Must be: friends, public, or competitive'
      });
    }

    // Validate betting strategy
    if (!['consensus', 'majority', 'individual'].includes(bettingStrategy)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid betting strategy. Must be: consensus, majority, or individual'
      });
    }

    // Create team vault
    const teamVault = {
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      creator: creatorSecret, // In production, derive from secret
      members: [{
        address: creatorSecret, // In production, derive from secret
        nickname: 'Creator',
        depositAmount: '0',
        joinedAt: Date.now(),
        isActive: true,
        votingPower: '100',
        betCount: 0,
        totalWinnings: '0'
      }],
      totalDeposits: '0',
      totalBets: '0',
      totalPayouts: '0',
      createdAt: Date.now(),
      isActive: true,
      contractAddress: `CVAULT${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      teamType: teamType || 'friends',
      minDeposit: minDeposit || '100',
      maxMembers: maxMembers || 10,
      bettingStrategy: bettingStrategy || 'majority'
    };

    teams.push(teamVault);

    logger.info('Team vault created:', {
      teamId: teamVault.id,
      name: teamVault.name,
      teamType: teamVault.teamType,
      maxMembers: teamVault.maxMembers
    });

    res.json({
      success: true,
      data: teamVault,
      message: 'Team vault created successfully'
    });

  } catch (error) {
    logger.error('Failed to create team vault:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Join an existing team vault
 */
router.post('/join', async (req, res) => {
  try {
    const {
      teamId,
      nickname,
      depositAmount,
      userSecret
    } = req.body;

    // Validate required fields
    if (!teamId || !nickname || !depositAmount || !userSecret) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: teamId, nickname, depositAmount, userSecret'
      });
    }

    const team = teams.find(t => t.id === teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (!team.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Team is not active'
      });
    }

    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'Team has reached maximum members'
      });
    }

    // Check if user is already a member
    const existingMember = team.members.find(m => m.address === userSecret);
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this team'
      });
    }

    // Validate deposit amount
    const deposit = parseFloat(depositAmount);
    const minDeposit = parseFloat(team.minDeposit);
    if (deposit < minDeposit) {
      return res.status(400).json({
        success: false,
        message: `Minimum deposit is ${minDeposit} KALE`
      });
    }

    // Create new member
    const newMember = {
      address: userSecret, // In production, derive from secret
      nickname,
      depositAmount,
      joinedAt: Date.now(),
      isActive: true,
      votingPower: (deposit / 100).toString(), // Simple voting power calculation
      betCount: 0,
      totalWinnings: '0'
    };

    // Add member to team
    team.members.push(newMember);
    team.totalDeposits = (parseFloat(team.totalDeposits) + deposit).toString();

    logger.info('User joined team vault:', {
      teamId,
      nickname,
      depositAmount,
      totalMembers: team.members.length
    });

    res.json({
      success: true,
      data: {
        team: team,
        member: newMember
      },
      message: 'Successfully joined team vault'
    });

  } catch (error) {
    logger.error('Failed to join team vault:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Propose a team bet
 */
router.post('/propose-bet', async (req, res) => {
  try {
    const {
      teamId,
      marketId,
      outcome,
      amount,
      requesterSecret,
      description
    } = req.body;

    // Validate required fields
    if (!teamId || !marketId || !outcome || !amount || !requesterSecret) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: teamId, marketId, outcome, amount, requesterSecret'
      });
    }

    const team = teams.find(t => t.id === teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is team member
    const member = team.members.find(m => m.address === requesterSecret);
    if (!member || !member.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User is not an active member of this team'
      });
    }

    // Validate bet amount
    const betAmount = parseFloat(amount);
    const teamBalance = parseFloat(team.totalDeposits);
    if (betAmount > teamBalance) {
      return res.status(400).json({
        success: false,
        message: 'Bet amount exceeds team vault balance'
      });
    }

    // Create team bet proposal
    const teamBet = {
      id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      teamId,
      marketId,
      outcome,
      amount,
      placedBy: requesterSecret,
      approvedBy: [],
      rejectedBy: [],
      status: 'pending',
      createdAt: Date.now(),
      description: description || '',
      executedAt: null,
      transactionHash: null,
      payoutAmount: null,
      isWinner: null
    };

    teamBets.push(teamBet);

    logger.info('Team bet proposed:', {
      betId: teamBet.id,
      teamId,
      marketId,
      outcome,
      amount,
      proposer: requesterSecret
    });

    res.json({
      success: true,
      data: teamBet,
      message: 'Team bet proposal created successfully'
    });

  } catch (error) {
    logger.error('Failed to propose team bet:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Vote on a team bet proposal
 */
router.post('/vote-bet', async (req, res) => {
  try {
    const {
      betId,
      vote,
      voterSecret
    } = req.body;

    // Validate required fields
    if (!betId || !vote || !voterSecret) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: betId, vote, voterSecret'
      });
    }

    if (!['approve', 'reject'].includes(vote)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote. Must be: approve or reject'
      });
    }

    const teamBet = teamBets.find(b => b.id === betId);
    if (!teamBet) {
      return res.status(404).json({
        success: false,
        message: 'Team bet not found'
      });
    }

    if (teamBet.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Bet proposal is no longer pending'
      });
    }

    const team = teams.find(t => t.id === teamBet.teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is team member
    const member = team.members.find(m => m.address === voterSecret);
    if (!member || !member.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User is not an active member of this team'
      });
    }

    // Check if user already voted
    if (teamBet.approvedBy.includes(voterSecret) || teamBet.rejectedBy.includes(voterSecret)) {
      return res.status(400).json({
        success: false,
        message: 'User has already voted on this proposal'
      });
    }

    // Record vote
    if (vote === 'approve') {
      teamBet.approvedBy.push(voterSecret);
    } else {
      teamBet.rejectedBy.push(voterSecret);
    }

    // Check if bet should be executed based on voting strategy
    const shouldExecute = shouldExecuteBet(teamBet, team);
    
    if (shouldExecute) {
      teamBet.status = 'executed';
      teamBet.executedAt = Date.now();
      teamBet.transactionHash = `tx${Math.random().toString(36).substr(2, 9)}`;
      
      // Update team stats
      team.totalBets = (parseFloat(team.totalBets) + parseFloat(teamBet.amount)).toString();
    }

    logger.info('Vote recorded on team bet:', {
      betId,
      voter: voterSecret,
      vote,
      approvedCount: teamBet.approvedBy.length,
      rejectedCount: teamBet.rejectedBy.length,
      executed: shouldExecute
    });

    res.json({
      success: true,
      data: teamBet,
      message: 'Vote recorded successfully'
    });

  } catch (error) {
    logger.error('Failed to vote on team bet:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Get team leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Calculate team stats
    const teamStats = teams.map(team => {
      const executedBets = teamBets.filter(bet => bet.teamId === team.id && bet.status === 'executed');
      const winningBets = executedBets.filter(bet => bet.isWinner);
      
      const winRate = executedBets.length > 0 
        ? (winningBets.length / executedBets.length) * 100 
        : 0;

      const averageBetSize = executedBets.length > 0
        ? executedBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0) / executedBets.length
        : 0;

      // Find top performer
      const topPerformer = team.members.reduce((top, member) => 
        parseFloat(member.totalWinnings) > parseFloat(top.totalWinnings) ? member : top
      );

      return {
        teamId: team.id,
        name: team.name,
        totalMembers: team.members.length,
        totalDeposits: team.totalDeposits,
        totalBets: executedBets.length,
        winRate,
        totalPayouts: team.totalPayouts,
        averageBetSize: averageBetSize.toFixed(2),
        topPerformer: topPerformer.nickname,
        teamRank: 0 // Will be calculated after sorting
      };
    });

    // Sort by win rate and total payouts
    teamStats.sort((a, b) => {
      if (b.winRate !== a.winRate) {
        return b.winRate - a.winRate;
      }
      return parseFloat(b.totalPayouts) - parseFloat(a.totalPayouts);
    });

    // Assign ranks
    teamStats.forEach((team, index) => {
      team.teamRank = index + 1;
    });

    // Limit results
    const limitedStats = teamStats.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: limitedStats,
      count: limitedStats.length
    });

  } catch (error) {
    logger.error('Failed to get team leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Get team details
 */
router.get('/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const team = teams.find(t => t.id === teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Get team bets
    const bets = teamBets.filter(bet => bet.teamId === teamId);

    res.json({
      success: true,
      data: {
        team,
        bets
      }
    });

  } catch (error) {
    logger.error('Failed to get team details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Get all teams
 */
router.get('/', async (req, res) => {
  try {
    const { teamType, status } = req.query;
    
    let filteredTeams = teams;

    // Apply filters
    if (teamType) {
      filteredTeams = filteredTeams.filter(team => team.teamType === teamType);
    }
    
    if (status) {
      filteredTeams = filteredTeams.filter(team => team.isActive === (status === 'active'));
    }

    res.json({
      success: true,
      data: filteredTeams,
      count: filteredTeams.length
    });

  } catch (error) {
    logger.error('Failed to get teams:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Helper function to determine if bet should be executed
function shouldExecuteBet(teamBet, team) {
  const totalVotingPower = team.members.reduce((sum, member) => 
    sum + parseFloat(member.votingPower), 0
  );

  const approvedVotingPower = teamBet.approvedBy.reduce((sum, voter) => {
    const member = team.members.find(m => m.address === voter);
    return sum + parseFloat(member?.votingPower || '0');
  }, 0);

  const rejectedVotingPower = teamBet.rejectedBy.reduce((sum, voter) => {
    const member = team.members.find(m => m.address === voter);
    return sum + parseFloat(member?.votingPower || '0');
  }, 0);

  switch (team.bettingStrategy) {
    case 'consensus':
      return approvedVotingPower >= totalVotingPower * 0.8; // 80% consensus
    case 'majority':
      return approvedVotingPower > rejectedVotingPower;
    case 'individual':
      return approvedVotingPower >= totalVotingPower * 0.5; // 50% approval
    default:
      return false;
  }
}

module.exports = router;
