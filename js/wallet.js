// Wallet Management
class WalletManager {
    constructor() {
        // Ensure ethers is available
        this.ethersAvailable = false;
        if (typeof window.ethers === 'undefined') {
            console.error('Ethers.js library not found. Wallet functionality will not work.');
            this.showErrorMessage('Wallet functionality is not available. Please refresh the page or check your internet connection.');
            return;
        } else {
            this.ethersAvailable = true;
            console.log('Ethers.js is available, initializing wallet manager');
        }
        
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.network = null;
        this.ethPrice = 0;
        this.connected = false;
        
        // Initialize if ethers is available
        this.init();
    }

    // Show an error message directly in the UI without needing the notification system
    showErrorMessage(message) {
        const walletSection = document.querySelector('.wallet-section');
        if (!walletSection) return;
        
        // Check if error already exists and remove it
        const existingError = walletSection.querySelector('.error-message');
        if (existingError) existingError.remove();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.margin = '20px auto';
        errorDiv.style.maxWidth = '800px';
        
        // Add retry button
        const retryBtn = document.createElement('button');
        retryBtn.textContent = 'Retry';
        retryBtn.className = 'retry-btn';
        retryBtn.style.marginTop = '10px';
        retryBtn.style.padding = '8px 16px';
        retryBtn.addEventListener('click', function() {
            window.location.reload();
        });
        
        errorDiv.appendChild(document.createElement('br'));
        errorDiv.appendChild(retryBtn);
        
        walletSection.querySelector('.container').appendChild(errorDiv);
    }

    async init() {
        if (!this.ethersAvailable) return;
        
        // Get current ETH price
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
            const data = await response.json();
            this.ethPrice = data.ethereum.usd;
        } catch (error) {
            console.error('Error fetching ETH price:', error);
            this.ethPrice = 3000; // Fallback price if API fails
        }

        // Check if already connected
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    this.connectWithMetaMask();
                }
            } catch (error) {
                console.error('Error checking for existing wallet connection:', error);
            }
        }
    }

    async connectWithMetaMask() {
        // Double check that ethers is defined
        if (!this.ethersAvailable || typeof window.ethers === 'undefined') {
            this.showErrorMessage('Wallet library not loaded. Please refresh the page.');
            console.error('Ethers.js not defined when trying to connect wallet');
            return;
        }
        
        try {
            if (!window.ethereum) {
                this.showErrorMessage('MetaMask not detected! Please install MetaMask first.');
                return;
            }

            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            try {
                // Create provider
                this.provider = new window.ethers.providers.Web3Provider(window.ethereum);
                console.log('Provider created successfully');
                
                // Get signer
                this.signer = this.provider.getSigner();
                console.log('Signer obtained successfully');
                
                // Get address and network
                this.address = await this.signer.getAddress();
                this.network = await this.provider.getNetwork();
                this.connected = true;
                
                console.log('Connected to wallet:', this.address);
                console.log('Network:', this.network.name);

                // Update UI
                this.showDashboard();
                this.updateWalletInfo();
                this.setupEventListeners();

                // Create disconnect button if it doesn't exist
                this.addDisconnectButton();
                
            } catch (ethersError) {
                console.error('Ethers.js error:', ethersError);
                this.showErrorMessage('Error initializing wallet connection: ' + ethersError.message);
            }

        } catch (error) {
            this.showErrorMessage('Failed to connect wallet: ' + error.message);
        }
    }

    async updateWalletInfo() {
        if (!this.provider || !this.address) return;

        try {
            // Get and display balance
            const balance = await this.provider.getBalance(this.address);
            const ethBalance = window.ethers.utils.formatEther(balance);
            const usdBalance = (parseFloat(ethBalance) * this.ethPrice).toFixed(2);

            document.querySelector('.balance-amount').textContent = parseFloat(ethBalance).toFixed(4);
            document.querySelector('.usd-balance').textContent = `≈ $${usdBalance} USD`;

            // Add wallet address info
            this.updateWalletAddress();
            
            // Get and display network info
            this.updateNetworkInfo();
            
            // Get and display transactions
            this.updateTransactionHistory();
            
            // Get and display tokens
            this.updateTokenList();

        } catch (error) {
            console.error('Error updating wallet info:', error);
        }
    }
    
    updateWalletAddress() {
        if (!document.querySelector('.wallet-address')) {
            const addressDiv = document.createElement('div');
            addressDiv.className = 'wallet-address';
            
            addressDiv.innerHTML = `
                <div class="address-container">
                    <span class="address-label">Wallet Address</span>
                    <span class="address-value">${this.formatAddress(this.address)}</span>
                </div>
                <button class="copy-address" title="Copy wallet address">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002-2h8a2 2 0 012 2v12a2 2 0 01-2 2h-3"></path>
                        <path d="M16 3v4"></path>
                        <path d="M8 3v4"></path>
                        <path d="M3 11h16"></path>
                    </svg>
                    <span class="tooltip">Copy</span>
                </button>
            `;
            
            // Add after balance info
            const balanceInfo = document.querySelector('.balance-info');
            balanceInfo.after(addressDiv);
            
            // Add copy functionality
            const copyBtn = addressDiv.querySelector('.copy-address');
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(this.address);
                
                // Add visual feedback for copy action
                copyBtn.classList.add('copied');
                
                // Change the icon to a checkmark
                copyBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                    <span class="tooltip">Copied!</span>
                `;
                
                // Show notification
                this.showNotification('Wallet address copied to clipboard!', 'success');
                
                // Reset after animation
                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    copyBtn.innerHTML = `
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002-2h8a2 2 0 012 2v12a2 2 0 01-2 2h-3"></path>
                            <path d="M16 3v4"></path>
                            <path d="M8 3v4"></path>
                            <path d="M3 11h16"></path>
                        </svg>
                        <span class="tooltip">Copy</span>
                    `;
                }, 2000);
            });
        }
    }
    
    updateNetworkInfo() {
        // Create network info display if it doesn't exist
        if (!document.querySelector('.network-info') && this.network) {
            const balanceCard = document.querySelector('.balance-card');
            
            if (balanceCard) {
                const networkDiv = document.createElement('div');
                networkDiv.className = 'network-info';
                
                // Get network name
                let networkName = this.network.name;
                if (networkName === 'homestead') networkName = 'Ethereum Mainnet';
                
                networkDiv.innerHTML = `
                    <p class="network-label">Network:</p>
                    <p class="network-name">${networkName} (Chain ID: ${this.network.chainId})</p>
                `;
                
                // Add after wallet address or balance info
                const addressDiv = balanceCard.querySelector('.wallet-address');
                if (addressDiv) {
                    addressDiv.after(networkDiv);
                } else {
                    const balanceInfo = balanceCard.querySelector('.balance-info');
                    balanceInfo.after(networkDiv);
                }
            }
        }
    }

    async updateTransactionHistory() {
        const transactionList = document.querySelector('.transaction-list');
        transactionList.innerHTML = '<div class="loading">Loading transactions...</div>';

        // Style the transaction list container for better visibility
        transactionList.style.backgroundColor = '#f8f9fa';
        transactionList.style.borderRadius = '8px';
        transactionList.style.border = '1px solid #e9ecef';
        
        // Check for dark theme
        const isDarkTheme = document.documentElement.classList.contains('dark-theme');
        if (isDarkTheme) {
            transactionList.style.backgroundColor = '#2d2d2d';
            transactionList.style.border = '1px solid #444';
        }

        try {
            // Make sure provider and address are available
            if (!this.provider || !this.address) {
                transactionList.innerHTML = '<div class="error">Wallet not properly connected</div>';
                return;
            }
            
            // Try to get transactions from Etherscan API
            try {
                // Use a fallback empty API key if needed
                const etherscanApiKey = 'AN6F4EQWVT1A44JGTYXFDVSUB5H9Q5K88V' || ''; 
                const network = this.network && this.network.name ? 
                    (this.network.name === 'homestead' ? '' : `-${this.network.name}`) : '';
                const baseUrl = `https://api${network}.etherscan.io/api`;
                
                // Fetch recent transactions (last 10)
                const url = `${baseUrl}?module=account&action=txlist&address=${this.address}&page=1&offset=10&sort=desc&apikey=${etherscanApiKey}`;
                
                console.log('Fetching transactions from:', url);
                
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.status === '1' && data.result && data.result.length > 0) {
                    transactionList.innerHTML = '';
                    
                    data.result.forEach(tx => {
                        const isReceived = tx.to && tx.to.toLowerCase() === this.address.toLowerCase();
                        const formattedAmount = window.ethers.utils.formatEther(tx.value || '0');
                        const timestamp = new Date(parseInt(tx.timeStamp || Date.now()) * 1000);
                        const dateStr = timestamp.toLocaleDateString();
                        
                        // Use more contrasting colors for amount based on transaction type
                        const amountColor = isReceived ? '#006400' : '#8B0000';
                        
                        transactionList.innerHTML += `
                            <div class="transaction-item">
                                <div class="transaction-info">
                                    <div class="transaction-type">
                                        <span class="transaction-icon ${isReceived ? 'received' : 'sent'}">
                                            ${isReceived ? '↓' : '↑'}
                                        </span>
                                        <span>${isReceived ? 'Received' : 'Sent'}</span>
                                    </div>
                                    <div class="transaction-date">${dateStr}</div>
                                </div>
                                <div class="transaction-amount" style="color: ${amountColor}">
                                    ${isReceived ? '+' : '-'}${parseFloat(formattedAmount).toFixed(4)} ETH
                                </div>
                                <a href="https://${network ? network + '.' : ''}etherscan.io/tx/${tx.hash}" 
                                   target="_blank" class="transaction-link" title="View on Etherscan">
                                    <svg viewBox="0 0 24 24" width="14" height="14">
                                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
                                        <path d="M15 3h6v6"></path>
                                        <path d="M10 14L21 3"></path>
                                    </svg>
                                </a>
                            </div>
                        `;
                    });
                    
                    // Apply dark theme styles if needed
                    if (isDarkTheme) {
                        const items = transactionList.querySelectorAll('.transaction-item');
                        items.forEach(item => {
                            item.style.borderBottom = '1px solid #444';
                        });
                    }
                } else {
                    // Fallback to a generic message if Etherscan API returns no transactions
                    this.showFallbackTransactions(transactionList);
                }
            } catch (apiError) {
                console.error('Error fetching transactions from API:', apiError);
                // Use fallback if API fails
                this.showFallbackTransactions(transactionList);
            }
        } catch (error) {
            transactionList.innerHTML = '<div class="error">Error loading transactions</div>';
            console.error('Error in updateTransactionHistory:', error);
        }
    }
    
    // Helper method to show fallback transaction view when API fails
    showFallbackTransactions(container) {
        if (!container) return;
        
        // Add background and border for better visibility
        container.style.backgroundColor = '#f8f9fa';
        container.style.borderRadius = '8px';
        container.style.border = '1px solid #e9ecef';
        
        // Check for dark theme
        const isDarkTheme = document.documentElement.classList.contains('dark-theme');
        if (isDarkTheme) {
            container.style.backgroundColor = '#2d2d2d';
            container.style.border = '1px solid #444';
        }
        
        if (this.address) {
            container.innerHTML = `
                <div class="fallback-message" style="color: ${isDarkTheme ? '#ffffff' : '#000000'};">
                    <p style="color: ${isDarkTheme ? '#cccccc' : '#333333'}; font-weight: 500;">Transaction history is not available right now.</p>
                    <a href="https://${this.network && this.network.name !== 'homestead' ? this.network.name + '.' : ''}etherscan.io/address/${this.address}" 
                       target="_blank" class="etherscan-link" style="color: ${isDarkTheme ? '#4fc3f7' : '#0066cc'};">
                       View your transactions on Etherscan
                       <svg viewBox="0 0 24 24" width="14" height="14">
                           <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
                           <path d="M15 3h6v6"></path>
                           <path d="M10 14L21 3"></path>
                       </svg>
                    </a>
                </div>
            `;
        } else {
            container.innerHTML = '<div class="no-transactions" style="color: #333333; font-weight: 500;">No transactions found</div>';
        }
    }

    async updateTokenList() {
        const tokenList = document.querySelector('.token-list');
        tokenList.innerHTML = '<div class="loading">Loading tokens...</div>';

        try {
            // For demo purposes, use mock data and also try to fetch real ERC-721 tokens
            const sampleTokens = [
                { name: 'Luxury Villa #1', address: '123 Ocean Drive', amount: 5, symbol: 'PROP' },
                { name: 'Downtown Apartment', address: '456 Main St.', amount: 10, symbol: 'PROP' },
                { name: 'Commercial Building', address: '789 Business Ave.', amount: 2, symbol: 'PROP' }
            ];
            
            // Try to fetch real ERC-721 tokens if we have contract addresses available
            const realTokens = await this.fetchERC721Tokens();
            
            // Combine real and sample tokens for display
            const allTokens = [...realTokens, ...sampleTokens];
            
            if (allTokens.length > 0) {
                tokenList.innerHTML = '';
                
                allTokens.forEach(token => {
                    tokenList.innerHTML += `
                        <div class="token-item">
                            <div class="token-info">
                                <span class="token-name">${token.name}</span>
                                <span class="token-address">${token.address}</span>
                                ${token.tokenId ? `<span class="token-id">Token ID: #${token.tokenId}</span>` : ''}
                            </div>
                            <div class="token-balance">
                                <span class="token-amount">${token.amount || 1}</span>
                                <span class="token-symbol">${token.symbol}</span>
                            </div>
                        </div>
                    `;
                });
            } else {
                tokenList.innerHTML = '<div class="no-tokens">No property tokens found</div>';
            }
        } catch (error) {
            tokenList.innerHTML = '<div class="error">Error loading tokens</div>';
            console.error('Error fetching tokens:', error);
        }
    }
    
    async fetchERC721Tokens() {
        // Return empty array if provider or address not available
        if (!this.provider || !this.address) return [];
        
        try {
            // List of property token contract addresses (would come from your backend or config)
            // These are placeholder addresses and should be replaced with real contract addresses
            const propertyTokenContracts = [
                // { address: '0x123...', name: 'Sharmo Properties' }
                // Add actual contract addresses here when available
            ];
            
            // Early return if no contracts defined yet
            if (propertyTokenContracts.length === 0) return [];
            
            const tokens = [];
            
            // ERC-721 ABI (minimal for balanceOf and tokenOfOwnerByIndex)
            const erc721ABI = [
                // balanceOf function
                {
                    "constant": true,
                    "inputs": [{"name": "owner", "type": "address"}],
                    "name": "balanceOf",
                    "outputs": [{"name": "", "type": "uint256"}],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                },
                // tokenOfOwnerByIndex function
                {
                    "constant": true,
                    "inputs": [
                        {"name": "owner", "type": "address"},
                        {"name": "index", "type": "uint256"}
                    ],
                    "name": "tokenOfOwnerByIndex",
                    "outputs": [{"name": "", "type": "uint256"}],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                },
                // tokenURI function
                {
                    "constant": true,
                    "inputs": [{"name": "tokenId", "type": "uint256"}],
                    "name": "tokenURI",
                    "outputs": [{"name": "", "type": "string"}],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                },
                // symbol function
                {
                    "constant": true,
                    "inputs": [],
                    "name": "symbol",
                    "outputs": [{"name": "", "type": "string"}],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                }
            ];
            
            // For each contract, check balance and token IDs
            for (const contractInfo of propertyTokenContracts) {
                const contract = new window.ethers.Contract(
                    contractInfo.address,
                    erc721ABI,
                    this.provider
                );
                
                // Get balance
                const balance = await contract.balanceOf(this.address);
                
                if (balance > 0) {
                    // Get symbol
                    let symbol;
                    try {
                        symbol = await contract.symbol();
                    } catch (e) {
                        symbol = 'NFT';
                    }
                    
                    // Loop through tokens
                    for (let i = 0; i < Math.min(balance, 10); i++) {
                        try {
                            // Get token ID
                            const tokenId = await contract.tokenOfOwnerByIndex(this.address, i);
                            
                            // Try to get token URI and metadata
                            let name = `${contractInfo.name || 'Property'} #${tokenId.toString()}`;
                            let propertyAddress = 'Address data unavailable';
                            
                            try {
                                const uri = await contract.tokenURI(tokenId);
                                if (uri) {
                                    // Handle both IPFS and HTTP URIs
                                    const uriToFetch = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
                                    const response = await fetch(uriToFetch);
                                    const metadata = await response.json();
                                    
                                    if (metadata.name) name = metadata.name;
                                    if (metadata.address) propertyAddress = metadata.address;
                                }
                            } catch (uriError) {
                                console.warn('Could not fetch token metadata', uriError);
                            }
                            
                            // Add token to list
                            tokens.push({
                                name,
                                address: propertyAddress,
                                tokenId: tokenId.toString(),
                                symbol,
                                amount: 1 // NFTs have amount of 1
                            });
                        } catch (tokenError) {
                            console.error('Error fetching token data', tokenError);
                        }
                    }
                }
            }
            
            return tokens;
        } catch (error) {
            console.error('Error fetching ERC-721 tokens:', error);
            return [];
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
            
            window.ethereum.on('disconnect', () => {
                this.disconnectWallet();
            });
        }
    }

    showDashboard() {
        // Find the status card and hide it
        const statusCard = document.querySelector('.status-card');
        if (statusCard) statusCard.style.display = 'none';
        
        // Show the dashboard
        document.getElementById('walletDashboard').style.display = 'block';
    }

    disconnectWallet() {
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.network = null;
        this.connected = false;
        
        // Show status card
        const statusCard = document.querySelector('.status-card');
        if (statusCard) statusCard.style.display = 'block';
        
        // Hide dashboard
        document.getElementById('walletDashboard').style.display = 'none';
    }
    
    addDisconnectButton() {
        // Check if disconnect button already exists
        if (!document.querySelector('.disconnect-btn')) {
            const dashboardGrid = document.querySelector('.dashboard-grid');
            
            if (dashboardGrid) {
                // Create disconnect button
                const disconnectBtn = document.createElement('button');
                disconnectBtn.className = 'disconnect-btn';
                disconnectBtn.textContent = 'Disconnect Wallet';
                
                // Add click event
                disconnectBtn.addEventListener('click', () => {
                    this.disconnectWallet();
                });
                
                // Append to dashboard
                dashboardGrid.parentElement.appendChild(disconnectBtn);
            }
        }
    }
    
    formatAddress(address) {
        // Format address as xxxx...xxxx
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showNotification(message, type = 'info') {
        // Remove any existing notifications
        document.querySelectorAll('.notification').forEach(notif => {
            notif.remove();
        });
        
        const notifDiv = document.createElement('div');
        notifDiv.className = `notification ${type}`;
        notifDiv.textContent = message;
        
        // Add to page
        document.body.appendChild(notifDiv);
        
        // Remove after timeout
        setTimeout(() => {
            notifDiv.classList.add('fadeout');
            setTimeout(() => notifDiv.remove(), 500);
        }, 4500);
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

// Demo wallet functionality
function viewDemoWallet() {
    const walletDashboard = document.getElementById('walletDashboard');
    const walletStatus = document.getElementById('walletStatus');
    
    if (walletDashboard && walletStatus) {
        // Hide status, show dashboard
        walletStatus.style.display = 'none';
        walletDashboard.style.display = 'block';
        
        // Update UI with demo values
        populateDemoWallet();
    }
}

function populateDemoWallet() {
    // Set demo balance
    const balanceAmount = document.querySelector('.balance-amount');
    const usdBalance = document.querySelector('.usd-balance');
    if (balanceAmount) balanceAmount.textContent = '1.2345';
    if (usdBalance) usdBalance.textContent = '≈ $2,469.00 USD';
    
    // Add disconnect button for demo
    const dashboardGrid = document.querySelector('.dashboard-grid');
    if (dashboardGrid && !document.querySelector('.disconnect-btn')) {
        const disconnectBtn = document.createElement('button');
        disconnectBtn.className = 'disconnect-btn';
        disconnectBtn.textContent = 'Exit Demo';
        disconnectBtn.addEventListener('click', function() {
            document.getElementById('walletStatus').style.display = 'block';
            document.getElementById('walletDashboard').style.display = 'none';
            disconnectBtn.remove();
        });
        dashboardGrid.parentElement.appendChild(disconnectBtn);
    }
    
    // Add wallet address
    addDemoWalletInfo();
    
    // Add transactions
    addDemoTransactions();
    
    // Add property tokens
    addDemoTokens();
}

function addDemoWalletInfo() {
    const balanceCard = document.querySelector('.balance-card');
    if (!balanceCard) return;
    
    // Demo address
    if (!document.querySelector('.wallet-address')) {
        const addressDiv = document.createElement('div');
        addressDiv.className = 'wallet-address';
        addressDiv.innerHTML = `
            <div class="address-container">
                <span class="address-label">Wallet Address</span>
                <span class="address-value">0x71C7...F92b</span>
            </div>
            <button class="copy-address" title="Copy wallet address">
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002-2h8a2 2 0 012 2v12a2 2 0 01-2 2h-3"></path>
                    <path d="M16 3v4"></path>
                    <path d="M8 3v4"></path>
                    <path d="M3 11h16"></path>
                </svg>
                <span class="tooltip">Copy</span>
            </button>
        `;
        balanceCard.querySelector('.balance-info').after(addressDiv);
    }
    
    // Network info
    if (!document.querySelector('.network-info')) {
        const networkDiv = document.createElement('div');
        networkDiv.className = 'network-info';
        networkDiv.innerHTML = `
            <p class="network-label">Network:</p>
            <p class="network-name">Ethereum Mainnet (Chain ID: 1)</p>
        `;
        document.querySelector('.wallet-address').after(networkDiv);
    }
}

function addDemoTransactions() {
    const transactionList = document.querySelector('.transaction-list');
    if (!transactionList) return;
    
    // Create a wrapper with a specific background color for better visibility
    transactionList.style.backgroundColor = '#f8f9fa';
    transactionList.style.borderRadius = '8px';
    transactionList.style.border = '1px solid #e9ecef';
    
    const demoTransactions = [
        { type: 'received', amount: '0.5', date: '2023-03-01', hash: '0xabc' },
        { type: 'sent', amount: '0.1', date: '2023-02-25', hash: '0xdef' },
        { type: 'received', amount: '0.8', date: '2023-02-20', hash: '0xghi' },
        { type: 'sent', amount: '0.2', date: '2023-02-15', hash: '0xjkl' }
    ];
    
    transactionList.innerHTML = '';
    
    demoTransactions.forEach(tx => {
        const dateObj = new Date(tx.date);
        
        transactionList.innerHTML += `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-type">
                        <span class="transaction-icon ${tx.type}">
                            ${tx.type === 'received' ? '↓' : '↑'}
                        </span>
                        <span>${tx.type === 'received' ? 'Received' : 'Sent'}</span>
                    </div>
                    <div class="transaction-date">${dateObj.toLocaleDateString()}</div>
                </div>
                <div class="transaction-amount" style="color: ${tx.type === 'received' ? '#006400' : '#8B0000'}">
                    ${tx.type === 'received' ? '+' : '-'}${tx.amount} ETH
                </div>
                <a href="https://etherscan.io/tx/${tx.hash}" 
                   target="_blank" class="transaction-link" title="View on Etherscan">
                    <svg viewBox="0 0 24 24" width="14" height="14">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
                        <path d="M15 3h6v6"></path>
                        <path d="M10 14L21 3"></path>
                    </svg>
                </a>
            </div>
        `;
    });
    
    // Add a check for dark theme and adjust if needed
    const isDarkTheme = document.documentElement.classList.contains('dark-theme');
    if (isDarkTheme) {
        transactionList.style.backgroundColor = '#2d2d2d';
        transactionList.style.border = '1px solid #444';
        
        // Adjust transaction item colors for dark theme
        const items = transactionList.querySelectorAll('.transaction-item');
        items.forEach(item => {
            item.style.borderBottom = '1px solid #444';
        });
    }
}

function addDemoTokens() {
    const tokenList = document.querySelector('.token-list');
    if (!tokenList) return;
    
    const demoTokens = [
        { name: 'Luxury Villa #1', address: '123 Ocean Drive', amount: 5, symbol: 'PROP' },
        { name: 'Downtown Apartment', address: '456 Main St.', amount: 10, symbol: 'PROP' },
        { name: 'Commercial Building', address: '789 Business Ave.', amount: 2, symbol: 'PROP', tokenId: '1234' }
    ];
    
    tokenList.innerHTML = '';
    
    demoTokens.forEach(token => {
        tokenList.innerHTML += `
            <div class="token-item">
                <div class="token-info">
                    <span class="token-name">${token.name}</span>
                    <span class="token-address">${token.address}</span>
                    ${token.tokenId ? `<span class="token-id">Token ID: #${token.tokenId}</span>` : ''}
                </div>
                <div class="token-balance">
                    <span class="token-amount">${token.amount}</span>
                    <span class="token-symbol">${token.symbol}</span>
                </div>
            </div>
        `;
    });
} 