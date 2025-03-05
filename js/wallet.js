// Wallet Management
class WalletManager {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.ethPrice = 0;
        this.init();
    }

    async init() {
        // Get current ETH price
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
            const data = await response.json();
            this.ethPrice = data.ethereum.usd;
        } catch (error) {
            console.error('Error fetching ETH price:', error);
        }

        // Check if already connected
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                this.connectWithMetaMask();
            }
        }
    }

    async connectWithMetaMask() {
        try {
            if (!window.ethereum) {
                this.showError('MetaMask not detected! Please install MetaMask first.');
                return;
            }

            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            this.address = await this.signer.getAddress();

            // Update UI
            this.showDashboard();
            this.updateWalletInfo();
            this.setupEventListeners();

        } catch (error) {
            this.showError('Failed to connect wallet: ' + error.message);
        }
    }

    async updateWalletInfo() {
        if (!this.provider || !this.address) return;

        try {
            // Get and display balance
            const balance = await this.provider.getBalance(this.address);
            const ethBalance = ethers.utils.formatEther(balance);
            const usdBalance = (parseFloat(ethBalance) * this.ethPrice).toFixed(2);

            document.querySelector('.balance-amount').textContent = parseFloat(ethBalance).toFixed(4);
            document.querySelector('.usd-balance').textContent = `≈ $${usdBalance} USD`;

            // Get and display transactions
            this.updateTransactionHistory();
            
            // Get and display tokens
            this.updateTokenList();

        } catch (error) {
            console.error('Error updating wallet info:', error);
        }
    }

    async updateTransactionHistory() {
        const transactionList = document.querySelector('.transaction-list');
        transactionList.innerHTML = '<div class="loading">Loading transactions...</div>';

        try {
            // Get recent transactions
            const transactions = await this.provider.getHistory(this.address);
            
            transactionList.innerHTML = transactions.length ? '' : '<div class="no-transactions">No transactions found</div>';

            transactions.slice(0, 10).forEach(tx => {
                const isReceived = tx.to.toLowerCase() === this.address.toLowerCase();
                const formattedAmount = ethers.utils.formatEther(tx.value);
                
                transactionList.innerHTML += `
                    <div class="transaction-item">
                        <div class="transaction-type">
                            <span class="transaction-icon ${isReceived ? 'received' : 'sent'}">
                                ${isReceived ? '↓' : '↑'}
                            </span>
                            <span>${isReceived ? 'Received' : 'Sent'}</span>
                        </div>
                        <div class="transaction-amount">
                            ${isReceived ? '+' : '-'}${formattedAmount} ETH
                        </div>
                    </div>
                `;
            });

        } catch (error) {
            transactionList.innerHTML = '<div class="error">Error loading transactions</div>';
            console.error('Error fetching transactions:', error);
        }
    }

    async updateTokenList() {
        const tokenList = document.querySelector('.token-list');
        tokenList.innerHTML = '<div class="loading">Loading tokens...</div>';

        try {
            // This would typically involve checking multiple token contracts
            // For demo purposes, we'll show a sample token
            tokenList.innerHTML = `
                <div class="token-item">
                    <div class="token-info">
                        <span class="token-name">Sample Property Token</span>
                        <span class="token-address">123 Main St.</span>
                    </div>
                    <div class="token-balance">
                        <span class="token-amount">10</span>
                        <span class="token-symbol">PROP</span>
                    </div>
                </div>
            `;

        } catch (error) {
            tokenList.innerHTML = '<div class="error">Error loading tokens</div>';
            console.error('Error fetching tokens:', error);
        }
    }

    setupEventListeners() {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnectWallet();
                } else {
                    this.address = accounts[0];
                    this.updateWalletInfo();
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    }

    showDashboard() {
        document.getElementById('walletStatus').style.display = 'none';
        document.getElementById('walletDashboard').style.display = 'block';
    }

    disconnectWallet() {
        this.provider = null;
        this.signer = null;
        this.address = null;
        document.getElementById('walletStatus').style.display = 'block';
        document.getElementById('walletDashboard').style.display = 'none';
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.querySelector('.wallet-status').appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

// Initialize wallet manager
const walletManager = new WalletManager();

// Global functions for button clicks
function connectWallet() {
    walletManager.connectWithMetaMask();
}

function connectWalletConnect() {
    walletManager.connectWithWalletConnect();
} 