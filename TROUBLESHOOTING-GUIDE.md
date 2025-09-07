# KALE-ndar Troubleshooting Guide

## Quick Fixes

### 🔧 **Most Common Issues**

#### Wallet Connection Issues
**Problem**: Wallet won't connect or shows "Connection Failed"

**Solutions**:
1. **Refresh the page** and try again
2. **Check Freighter extension** is installed and enabled
3. **Clear browser cache** and cookies
4. **Switch networks** (testnet ↔ mainnet)
5. **Restart browser** completely

**Still not working?**
- Try a different browser
- Check if Freighter is updated to latest version
- Verify you're on the correct Stellar network

#### Transaction Failures
**Problem**: Transactions fail with error messages

**Common Error Messages & Solutions**:

| Error | Cause | Solution |
|-------|-------|----------|
| "Insufficient balance" | Not enough KALE or XLM | Add more tokens to your wallet |
| "Transaction timeout" | Network congestion | Wait and retry, or increase gas |
| "Invalid signature" | Wallet issue | Reconnect wallet, check permissions |
| "Contract not found" | Wrong network | Switch to correct network |
| "Oracle data unavailable" | Oracle issue | Wait for oracle update or contact support |

#### Market Resolution Problems
**Problem**: Market hasn't resolved on time

**Check These**:
1. **Resolution time**: Has the actual resolution time passed?
2. **Oracle data**: Is Reflector Oracle providing fresh data?
3. **Network status**: Are there any Stellar network issues?
4. **Contract status**: Is the smart contract functioning?

**Solutions**:
- Wait up to 24 hours for automatic resolution
- Check Stellar network status
- Contact support if resolution is significantly delayed

## Detailed Troubleshooting

### 🏦 **Wallet Issues**

#### Freighter Wallet Problems

**Issue**: Freighter extension not detected
```
Solution Steps:
1. Ensure Freighter is installed from official source
2. Check browser extension permissions
3. Try disabling other wallet extensions temporarily
4. Restart browser after installation
```

**Issue**: "Account not found" error
```
Solution Steps:
1. Verify you're on the correct network (testnet/mainnet)
2. Check if account exists on Stellar Explorer
3. Import account using seed phrase if needed
4. Ensure account has sufficient XLM for fees
```

**Issue**: Transaction signing fails
```
Solution Steps:
1. Check Freighter permissions for the site
2. Ensure you're signing with the correct account
3. Try signing transaction manually
4. Check for Freighter updates
```

### 🔗 **Network Issues**

#### Stellar Network Problems

**Issue**: Slow transaction processing
```
Symptoms:
- Transactions pending for >5 minutes
- High gas prices
- Network congestion warnings

Solutions:
1. Wait for network congestion to clear
2. Increase transaction fee
3. Try during off-peak hours
4. Check Stellar network status
```

**Issue**: RPC endpoint errors
```
Symptoms:
- "RPC error" messages
- Failed API calls
- Connection timeouts

Solutions:
1. Switch to different RPC endpoint
2. Check RPC endpoint status
3. Wait for service restoration
4. Use backup RPC if available
```

### 📊 **Oracle Issues**

#### Reflector Oracle Problems

**Issue**: Price data is stale
```
Symptoms:
- Old timestamps on price feeds
- "Data unavailable" messages
- Failed market resolutions

Solutions:
1. Wait for oracle update (usually within 1 hour)
2. Check Reflector Oracle status
3. Verify asset is supported
4. Contact oracle support if persistent
```

**Issue**: Oracle confidence too low
```
Symptoms:
- Low confidence scores (<80%)
- "Unreliable data" warnings
- Market resolution delays

Solutions:
1. Wait for more oracle confirmations
2. Check multiple oracle sources
3. Verify data source reliability
4. Consider manual resolution if needed
```

### 💰 **Token Issues**

#### KALE Token Problems

**Issue**: KALE balance not updating
```
Symptoms:
- Balance shows old amount
- Transactions not reflected
- "Insufficient balance" despite having tokens

Solutions:
1. Refresh wallet connection
2. Check transaction on Stellar Explorer
3. Wait for blockchain confirmation
4. Clear browser cache and reload
```

**Issue**: Can't find KALE token
```
Symptoms:
- Token not visible in wallet
- "Token not found" errors
- Balance shows zero

Solutions:
1. Add KALE token manually to wallet
2. Verify token contract address
3. Check if on correct network
4. Import token using contract address
```

#### XLM Balance Issues

**Issue**: Not enough XLM for fees
```
Symptoms:
- "Insufficient XLM" errors
- Transaction failures
- Cannot perform any operations

Solutions:
1. Add XLM to your wallet
2. Buy XLM from exchange
3. Transfer from another wallet
4. Use Stellar DEX to swap other tokens
```

### 🎯 **Market Issues**

#### Betting Problems

**Issue**: Can't place bet
```
Symptoms:
- Bet button disabled
- Transaction fails immediately
- "Market closed" errors

Solutions:
1. Check if market is still active
2. Verify bet amount is within limits
3. Ensure sufficient KALE balance
4. Check market resolution time
```

**Issue**: Bet not showing in history
```
Symptoms:
- Bet placed but not visible
- Balance changed but no bet record
- "Transaction successful" but no bet

Solutions:
1. Wait for blockchain confirmation
2. Refresh the page
3. Check transaction on Stellar Explorer
4. Contact support with transaction hash
```

#### Market Resolution Issues

**Issue**: Market resolution delayed
```
Symptoms:
- Resolution time passed but not resolved
- "Pending resolution" status
- No outcome determined

Solutions:
1. Wait up to 24 hours for automatic resolution
2. Check oracle data availability
3. Verify resolution conditions are met
4. Contact support if significantly delayed
```

**Issue**: Wrong market outcome
```
Symptoms:
- Market resolved incorrectly
- Oracle data seems wrong
- Dispute over resolution

Solutions:
1. Check oracle data sources
2. Verify resolution conditions
3. Submit dispute through governance
4. Contact support with evidence
```

### 🔧 **Technical Issues**

#### Smart Contract Problems

**Issue**: Contract interaction fails
```
Symptoms:
- "Contract error" messages
- Failed function calls
- Unexpected behavior

Solutions:
1. Check contract address is correct
2. Verify function parameters
3. Ensure sufficient gas/fees
4. Check contract is not paused
```

**Issue**: Contract not responding
```
Symptoms:
- Timeout errors
- No response from contract
- "Contract not found"

Solutions:
1. Check network connectivity
2. Verify contract is deployed
3. Try different RPC endpoint
4. Wait and retry
```

#### Frontend Issues

**Issue**: Page won't load
```
Symptoms:
- Blank page
- Loading spinner forever
- JavaScript errors

Solutions:
1. Refresh the page
2. Clear browser cache
3. Disable browser extensions
4. Try different browser
5. Check internet connection
```

**Issue**: Data not updating
```
Symptoms:
- Old data displayed
- Real-time updates not working
- Stale information

Solutions:
1. Refresh the page
2. Check WebSocket connection
3. Verify backend is running
4. Clear browser cache
```

## Error Code Reference

### HTTP Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check input parameters |
| 401 | Unauthorized | Reconnect wallet |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Verify resource exists |
| 429 | Rate Limited | Wait and retry |
| 500 | Server Error | Contact support |

### Smart Contract Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 1001 | Insufficient Balance | Add more tokens |
| 1002 | Market Not Found | Check market ID |
| 1003 | Market Closed | Wait for next market |
| 1004 | Invalid Amount | Check bet limits |
| 1005 | Oracle Unavailable | Wait for oracle data |
| 1006 | Resolution Pending | Wait for resolution |

## Getting Help

### Self-Help Resources

1. **Documentation**: Check all available guides
2. **FAQ**: Review frequently asked questions
3. **Community**: Join Discord for peer support
4. **Search**: Use search function in docs

### When to Contact Support

Contact support if:
- Issue persists after trying solutions
- Error is not covered in documentation
- You suspect a bug or security issue
- You need help with account recovery

### How to Contact Support

**Before contacting support, gather**:
- Error messages (screenshots)
- Transaction hashes
- Steps to reproduce issue
- Browser and wallet information
- Network (testnet/mainnet)

**Support Channels**:
- **Discord**: #support channel
- **Email**: support@kale-ndar.com
- **GitHub**: Create issue for bugs
- **Twitter**: @KaleNdar for quick questions

### Emergency Contacts

**For urgent issues**:
- **Security**: security@kale-ndar.com
- **Critical Bugs**: Create GitHub issue with "urgent" label
- **Account Recovery**: support@kale-ndar.com

## Prevention Tips

### Best Practices

1. **Always verify URLs** before connecting wallet
2. **Start with small amounts** when testing
3. **Keep private keys secure** and never share
4. **Update wallet regularly** to latest version
5. **Check network status** before major transactions
6. **Read market terms** carefully before betting
7. **Keep transaction records** for support purposes

### Security Checklist

- [ ] Using official KALE-ndar website
- [ ] Freighter wallet is updated
- [ ] On correct Stellar network
- [ ] Sufficient XLM for transaction fees
- [ ] KALE tokens in wallet
- [ ] Browser extensions are trusted
- [ ] Private keys are secure

## Network Status

### How to Check Network Status

**Stellar Network**:
- [Stellar Network Status](https://status.stellar.org/)
- [Stellar Explorer](https://stellar.expert/)

**Reflector Oracle**:
- [Reflector Status](https://reflector.network/status)
- [Oracle Health Check](https://api.reflector.network/health)

**KALE Protocol**:
- [KALE Farm Status](https://testnet.kalefarm.xyz/)
- [KALE Protocol Docs](https://kaleonstellar.com)

---

## Still Need Help?

If you've tried all the solutions above and still need assistance:

1. **Join our Discord** for real-time community support
2. **Create a support ticket** with detailed information
3. **Check our status page** for known issues
4. **Follow our Twitter** for updates and announcements

**Remember**: Most issues can be resolved with patience and the right information. Our community and support team are here to help! 🚀
