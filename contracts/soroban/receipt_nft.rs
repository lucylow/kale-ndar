//! Minimal Soroban NFT-like contract for prediction receipt tokens (hackathon stub)
//! Not production-ready: no metadata standard, no auth gating.

#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, BytesN, Env, Symbol, Map};

#[contract]
pub struct ReceiptNft;

#[contractimpl]
impl ReceiptNft {
    pub fn mint(env: Env, owner: Address, token_id: BytesN<32>) {
        let key = (symbol_short!("own"), token_id.clone());
        env.storage().instance().set(&key, &owner);
    }

    pub fn owner_of(env: Env, token_id: BytesN<32>) -> Address {
        let key = (symbol_short!("own"), token_id);
        env.storage().instance().get(&key).unwrap()
    }

    pub fn transfer(env: Env, to: Address, token_id: BytesN<32>) {
        let key = (symbol_short!("own"), token_id.clone());
        env.storage().instance().set(&key, &to);
    }
}
