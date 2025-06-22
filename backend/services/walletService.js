const fs = require('fs');
const path = require('path');

const WALLETS_FILE = path.join(__dirname, '../data/wallets.json');

class WalletService {
    constructor() {
        this.wallets = this.loadWallets();
    }

    loadWallets() {
        try {
            if (fs.existsSync(WALLETS_FILE)) {
                return JSON.parse(fs.readFileSync(WALLETS_FILE, 'utf8'));
            }
            return {};
        } catch (error) {
            console.error('Error loading wallets:', error);
            return {};
        }
    }

    saveWallets() {
        try {
            fs.writeFileSync(WALLETS_FILE, JSON.stringify(this.wallets, null, 2));
        } catch (error) {
            console.error('Error saving wallets:', error);
        }
    }

    getWallet(userId) {
        return this.wallets[userId] || { balance: 0, transactions: [] };
    }

    createWallet(userId) {
        if (!this.wallets[userId]) {
            this.wallets[userId] = {
                balance: 0,
                transactions: []
            };
            this.saveWallets();
        }
        return this.wallets[userId];
    }

    async addMoney(userId, amount, paymentMethod, transactionId) {
        if (!this.wallets[userId]) {
            this.createWallet(userId);
        }

        const wallet = this.wallets[userId];
        wallet.balance += amount;
        
        const transaction = {
            id: `TXN_${Date.now()}`,
            type: 'CREDIT',
            amount: amount,
            timestamp: new Date().toISOString(),
            paymentMethod,
            transactionId,
            balance: wallet.balance
        };

        wallet.transactions.push(transaction);
        this.saveWallets();
        return transaction;
    }

    async deductMoney(userId, amount, orderId) {
        if (!this.wallets[userId]) {
            throw new Error('Wallet not found');
        }

        const wallet = this.wallets[userId];
        if (wallet.balance < amount) {
            throw new Error('Insufficient balance');
        }

        wallet.balance -= amount;
        
        const transaction = {
            id: `TXN_${Date.now()}`,
            type: 'DEBIT',
            amount: amount,
            timestamp: new Date().toISOString(),
            orderId,
            balance: wallet.balance
        };

        wallet.transactions.push(transaction);
        this.saveWallets();
        return transaction;
    }

    getTransactionHistory(userId) {
        const wallet = this.getWallet(userId);
        return wallet.transactions.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
    }

    getBalance(userId) {
        const wallet = this.getWallet(userId);
        return wallet.balance;
    }
}

module.exports = new WalletService(); 