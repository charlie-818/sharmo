// Smart Contract Generator Script
document.addEventListener('DOMContentLoaded', function() {
    // Get URL parameters to fetch property data
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('propertyId');
    const propertyAddress = urlParams.get('address');
    const propertyCity = urlParams.get('city');
    const propertyState = urlParams.get('state');
    const propertyValue = urlParams.get('value');
    const tokenPotential = urlParams.get('potential');
    
    // Get DOM elements
    const summaryAddress = document.getElementById('summaryAddress');
    const summaryValue = document.getElementById('summaryValue');
    const summaryPotential = document.getElementById('summaryPotential');
    const summarySupply = document.getElementById('summarySupply');
    const contractNameInput = document.getElementById('contractName');
    const tokenSymbolInput = document.getElementById('tokenSymbol');
    const contractStandardSelect = document.getElementById('contractStandard');
    const governanceTypeSelect = document.getElementById('governanceType');
    const generateContractBtn = document.getElementById('generateContractBtn');
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    const downloadCodeBtn = document.getElementById('downloadCodeBtn');
    const deployBtn = document.getElementById('deployBtn');
    const codeContent = document.getElementById('codeContent');
    const lineNumbers = document.getElementById('lineNumbers');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const codeEditor = document.querySelector('.code-editor');
    
    // Set default property data
    let propertyData = {
        address: propertyAddress || '123 Main Street',
        city: propertyCity || 'San Francisco',
        state: propertyState || 'CA',
        estimatedValue: propertyValue ? parseInt(propertyValue) : 750000,
        tokenPotential: tokenPotential || 'High'
    };
    
    // Initialize property summary
    function initializePropertySummary() {
        const fullAddress = `${propertyData.address}, ${propertyData.city}, ${propertyData.state}`;
        summaryAddress.textContent = fullAddress;
        
        // Format value as currency
        const formattedValue = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(propertyData.estimatedValue);
        summaryValue.textContent = formattedValue;
        
        // Set token potential with color coding
        summaryPotential.textContent = propertyData.tokenPotential;
        if (propertyData.tokenPotential === 'High') {
            summaryPotential.style.color = '#10b981';
        } else if (propertyData.tokenPotential === 'Medium') {
            summaryPotential.style.color = '#f59e0b';
        } else {
            summaryPotential.style.color = '#ef4444';
        }
        
        // Calculate token supply (1 token = $10)
        const tokenSupply = Math.floor(propertyData.estimatedValue / 10);
        summarySupply.textContent = tokenSupply.toLocaleString() + ' tokens';
    }
    
    // If we have propertyId, fetch property data from API
    if (propertyId) {
        fetch(`/api/property/${propertyId}`)
            .then(response => response.json())
            .then(data => {
                propertyData = data.propertyData;
                initializePropertySummary();
            })
            .catch(error => {
                console.error('Error fetching property data:', error);
                initializePropertySummary(); // Initialize with default values on error
            });
    } else {
        initializePropertySummary(); // Initialize with default or URL values
    }
    
    // Generate line numbers for code editor
    function updateLineNumbers(codeString) {
        const linesCount = codeString.split('\n').length;
        let lineNumbersHTML = '';
        
        // Create line numbers with the same line height as the code
        for (let i = 1; i <= linesCount; i++) {
            lineNumbersHTML += `<div class="line-number">${i}</div>`;
        }
        
        lineNumbers.innerHTML = lineNumbersHTML;
        
        // Ensure line numbers and code are in sync
        setTimeout(() => {
            alignLineNumbers();
        }, 50);
    }
    
    // Ensure line numbers align with code lines
    function alignLineNumbers() {
        const codeLines = codeContent.querySelectorAll('.code-line');
        const numberLines = lineNumbers.querySelectorAll('.line-number');
        
        // Make sure code lines and line numbers are properly aligned
        if (codeLines.length === numberLines.length) {
            codeLines.forEach((line, index) => {
                const height = line.offsetHeight;
                numberLines[index].style.height = `${height}px`;
            });
        }
    }
    
    // Apply syntax highlighting to code
    function applySyntaxHighlighting(code) {
        // Split code into lines and maintain line endings
        const lines = code.split('\n');
        
        // Process each line for syntax highlighting
        const highlightedLines = lines.map(line => {
            // Apply highlighting to each line
            return highlightLine(line);
        });
        
        // Create line-wrapped spans for proper alignment
        return highlightedLines
            .map(line => `<span class="code-line">${line}</span>`)
            .join('\n');
    }
    
    // Highlight a single line of code
    function highlightLine(line) {
        // Replace Solidity keywords
        const keywords = ['pragma', 'contract', 'function', 'public', 'private', 'internal', 'external', 
                         'view', 'pure', 'returns', 'memory', 'storage', 'calldata', 'payable',
                         'constructor', 'event', 'emit', 'indexed', 'if', 'else', 'for', 'while',
                         'return', 'mapping', 'struct', 'enum', 'address', 'uint', 'int', 'bool',
                         'string', 'bytes', 'import', 'from', 'using', 'library', 'interface',
                         'is', 'override', 'virtual', 'abstract', 'modifier', 'constant', 'immutable'];
                         
        const types = ['address', 'uint256', 'uint8', 'bytes32', 'string', 'bool', 'mapping'];
        
        // Create a regex pattern for the keywords
        const keywordPattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
        const typePattern = new RegExp(`\\b(${types.join('|')})\\b`, 'g');
        
        // Replace keywords, strings, comments in order of precedence
        let highlighted = line
            // Handle comments first (to prevent highlighting keywords in comments)
            .replace(/\/\/(.*)$/, '<span class="comment">// $1</span>')
            // Handle strings
            .replace(/"([^"]*)"/g, '<span class="string">"$1"</span>')
            .replace(/'([^']*)'/g, '<span class="string">\'$1\'</span>')
            // Handle numbers
            .replace(/\b(\d+)\b/g, '<span class="number">$1</span>')
            // Handle keywords
            .replace(keywordPattern, '<span class="keyword">$1</span>')
            // Handle types
            .replace(typePattern, '<span class="type">$1</span>')
            // Handle function declarations
            .replace(/function\s+([a-zA-Z0-9_]+)/g, 'function <span class="function">$1</span>')
            // Handle common Solidity built-ins
            .replace(/\b(msg|block|tx|abi|require|assert|revert)\b/g, '<span class="keyword">$1</span>');
            
        // If line is empty, ensure it still takes up space
        if (highlighted.trim() === '') {
            highlighted = '&nbsp;';
        }
        
        return highlighted;
    }
    
    // Generate smart contract based on options
    function generateSmartContract() {
        loadingIndicator.style.display = 'block';
        codeContent.parentElement.style.display = 'none';
        
        // Get values from inputs
        const contractName = contractNameInput.value.trim() || 'PropertyToken';
        const tokenSymbol = tokenSymbolInput.value.trim() || 'PROP';
        const contractStandard = contractStandardSelect.value;
        const governanceType = governanceTypeSelect.value;
        
        // Update file tab name to match contract name
        document.querySelector('.file-tab').textContent = `${contractName}.sol`;
        
        // Calculate token values
        const tokenSupply = Math.floor(propertyData.estimatedValue / 10);
        const formattedAddress = propertyData.address.replace(/[^a-zA-Z0-9]/g, '');
        
        // Generate a timestamp for unique identifier
        const timestamp = Date.now();
        
        // Create code based on selected contract standard
        let code = '';
        
        if (contractStandard === 'erc20') {
            code = generateERC20Contract(contractName, tokenSymbol, tokenSupply, formattedAddress, governanceType, timestamp);
        } else if (contractStandard === 'erc721') {
            code = generateERC721Contract(contractName, tokenSymbol, formattedAddress, governanceType, timestamp);
        } else if (contractStandard === 'erc1155') {
            code = generateERC1155Contract(contractName, tokenSymbol, formattedAddress, governanceType, timestamp);
        }
        
        // Simulate a delay for loading indicator
        setTimeout(() => {
            loadingIndicator.style.display = 'none';
            codeContent.parentElement.style.display = 'flex';
            
            // Update line numbers and code content
            codeContent.innerHTML = applySyntaxHighlighting(code);
            updateLineNumbers(code);
            
            // Enable horizontal scrolling on code content
            codeContent.addEventListener('scroll', function() {
                // The line numbers don't need to scroll horizontally
                lineNumbers.scrollTop = this.scrollTop;
            });
            
            // Ensure proper rendering of multi-line comments
            processMultiLineComments();
        }, 1500);
    }
    
    // Process multi-line comments after rendering
    function processMultiLineComments() {
        const codeText = codeContent.innerHTML;
        
        // Find and wrap multi-line comments
        const wrappedText = codeText.replace(
            /\/\*[\s\S]*?\*\//g, 
            match => `<span class="comment">${match}</span>`
        );
        
        if (wrappedText !== codeText) {
            codeContent.innerHTML = wrappedText;
        }
    }
    
    // Generate ERC20 contract for property tokenization
    function generateERC20Contract(name, symbol, supply, addressIdentifier, governance, timestamp) {
        const fullAddress = `${propertyData.address}, ${propertyData.city}, ${propertyData.state}`;
        
        return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title ${name}
 * @dev Real Estate Tokenization Contract for property at ${fullAddress}
 * @custom:property-id ${addressIdentifier}${timestamp}
 * @custom:property-value ${propertyData.estimatedValue}
 * @custom:token-potential ${propertyData.tokenPotential}
 */
contract ${name} is ERC20, ERC20Burnable, Ownable, ERC20Permit {
    // Property details
    string public propertyAddress = "${fullAddress}";
    uint256 public propertyValue = ${propertyData.estimatedValue};
    uint256 public propertyTokenizationDate;
    
    // Property documents hash (IPFS or other storage)
    string public propertyDocumentsHash;
    
    // Governance parameters
    uint256 public votingThreshold = 51; // Percentage required for proposals to pass
    mapping(address => bool) public authorizedAppraiser;
    
    // Events
    event PropertyRevalued(uint256 oldValue, uint256 newValue, address appraiser);
    event DocumentsUpdated(string newDocumentsHash);
    event DividendDistributed(uint256 amount);
${governance === 'dao' ? `
    // DAO Governance structures
    struct Proposal {
        uint256 id;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
        address proposer;
        mapping(address => bool) hasVoted;
    }
    
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    
    event ProposalCreated(uint256 proposalId, string description, address proposer);
    event VoteCast(uint256 proposalId, address voter, bool support, uint256 votes);
    event ProposalExecuted(uint256 proposalId);` : ''}
${governance === 'multisig' ? `
    // Multi-signature governance
    mapping(address => bool) public signatories;
    uint256 public required;
    
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 sigCount;
    }
    
    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;
    
    event TransactionSubmitted(uint256 transactionId, address submitter);
    event TransactionConfirmed(uint256 transactionId, address signatory);
    event TransactionExecuted(uint256 transactionId);` : ''}

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor()
        ERC20("${name}", "${symbol}")
        Ownable(msg.sender)
        ERC20Permit("${name}")
    {
        propertyTokenizationDate = block.timestamp;
        
        // Mint initial supply
        _mint(msg.sender, ${supply} * 10 ** decimals());
        
        // Set the contract creator as an authorized appraiser
        authorizedAppraiser[msg.sender] = true;
        
${governance === 'multisig' ? `
        // Initialize multi-signature governance
        signatories[msg.sender] = true;
        required = 1; // Initially only one confirmation required` : ''}
    }

    /**
     * @dev Mints new tokens when additional property value is recognized
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Set the property documents hash (legal docs, inspection reports, etc.)
     * @param hash The IPFS or other storage hash containing property documentation
     */
    function setPropertyDocuments(string calldata hash) external onlyOwner {
        propertyDocumentsHash = hash;
        emit DocumentsUpdated(hash);
    }
    
    /**
     * @dev Update property value based on new appraisal
     * @param newValue The updated property value
     */
    function updatePropertyValue(uint256 newValue) external {
        require(authorizedAppraiser[msg.sender], "Only authorized appraisers can update");
        uint256 oldValue = propertyValue;
        propertyValue = newValue;
        emit PropertyRevalued(oldValue, newValue, msg.sender);
    }
    
    /**
     * @dev Add or remove an address as an authorized appraiser
     * @param appraiser The address to modify
     * @param status True to authorize, false to revoke
     */
    function setAppraiser(address appraiser, bool status) external onlyOwner {
        authorizedAppraiser[appraiser] = status;
    }
    
    /**
     * @dev Distribute dividends to token holders (e.g., rental income)
     * Must be implemented with a dividend distribution mechanism
     */
    function distributeDividend() external payable onlyOwner {
        require(msg.value > 0, "Must send ETH to distribute");
        emit DividendDistributed(msg.value);
        // Implementation would distribute ETH to all token holders proportionally
    }
    
${governance === 'dao' ? `
    /**
     * @dev Create a new proposal for token holders to vote on
     * @param description Description of the proposal
     * @param durationDays Voting period in days
     */
    function createProposal(string calldata description, uint256 durationDays) external {
        require(balanceOf(msg.sender) > 0, "Must hold tokens to propose");
        uint256 proposalId = proposalCount++;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.description = description;
        proposal.deadline = block.timestamp + (durationDays * 1 days);
        proposal.proposer = msg.sender;
        
        emit ProposalCreated(proposalId, description, msg.sender);
    }
    
    /**
     * @dev Cast a vote on a proposal
     * @param proposalId The ID of the proposal
     * @param support True for yes/for, false for no/against
     */
    function castVote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp < proposal.deadline, "Voting period ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(!proposal.executed, "Proposal already executed");
        
        uint256 votes = balanceOf(msg.sender);
        require(votes > 0, "Must hold tokens to vote");
        
        proposal.hasVoted[msg.sender] = true;
        
        if (support) {
            proposal.votesFor += votes;
        } else {
            proposal.votesAgainst += votes;
        }
        
        emit VoteCast(proposalId, msg.sender, support, votes);
    }
    
    /**
     * @dev Execute a proposal that has passed
     * @param proposalId The ID of the proposal to execute
     */
    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.deadline, "Voting period not ended");
        require(!proposal.executed, "Proposal already executed");
        
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        uint256 forPercentage = (proposal.votesFor * 100) / totalVotes;
        
        require(forPercentage >= votingThreshold, "Proposal did not pass");
        
        proposal.executed = true;
        emit ProposalExecuted(proposalId);
        
        // Implementation would execute the proposal's action
    }` : ''}
${governance === 'multisig' ? `
    /**
     * @dev Add a new signatory for multi-signature governance
     * @param signatory The address to add as a signatory
     */
    function addSignatory(address signatory) external onlyOwner {
        require(!signatories[signatory], "Already a signatory");
        signatories[signatory] = true;
    }
    
    /**
     * @dev Remove a signatory
     * @param signatory The address to remove
     */
    function removeSignatory(address signatory) external onlyOwner {
        require(signatories[signatory], "Not a signatory");
        signatories[signatory] = false;
    }
    
    /**
     * @dev Change the number of required confirmations
     * @param _required The new number of required confirmations
     */
    function changeRequirement(uint256 _required) external onlyOwner {
        required = _required;
    }
    
    /**
     * @dev Submit a new transaction for approval
     * @param to Destination address
     * @param value Amount of ETH to send
     * @param data Transaction data
     * @return transactionId The ID of the submitted transaction
     */
    function submitTransaction(address to, uint256 value, bytes calldata data) 
        external 
        returns (uint256 transactionId) 
    {
        require(signatories[msg.sender], "Not a signatory");
        
        transactionId = transactions.length;
        transactions.push(Transaction({
            to: to,
            value: value,
            data: data,
            executed: false,
            sigCount: 0
        }));
        
        confirmTransaction(transactionId);
        emit TransactionSubmitted(transactionId, msg.sender);
        return transactionId;
    }
    
    /**
     * @dev Confirm a pending transaction
     * @param transactionId The ID of the transaction to confirm
     */
    function confirmTransaction(uint256 transactionId) public {
        require(signatories[msg.sender], "Not a signatory");
        require(transactionId < transactions.length, "Transaction does not exist");
        require(!confirmations[transactionId][msg.sender], "Already confirmed");
        
        confirmations[transactionId][msg.sender] = true;
        transactions[transactionId].sigCount += 1;
        
        emit TransactionConfirmed(transactionId, msg.sender);
        
        if (transactions[transactionId].sigCount >= required) {
            executeTransaction(transactionId);
        }
    }
    
    /**
     * @dev Execute a confirmed transaction
     * @param transactionId The ID of the transaction to execute
     */
    function executeTransaction(uint256 transactionId) public {
        require(transactionId < transactions.length, "Transaction does not exist");
        Transaction storage transaction = transactions[transactionId];
        
        require(!transaction.executed, "Transaction already executed");
        require(transaction.sigCount >= required, "Not enough confirmations");
        
        transaction.executed = true;
        
        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "Transaction execution failed");
        
        emit TransactionExecuted(transactionId);
    }` : ''}
}`;
    }
    
    // Generate ERC721 contract (NFT) for property tokenization
    function generateERC721Contract(name, symbol, addressIdentifier, governance, timestamp) {
        const fullAddress = `${propertyData.address}, ${propertyData.city}, ${propertyData.state}`;
        
        return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ${name}
 * @dev NFT Real Estate Tokenization Contract for property at ${fullAddress}
 * @custom:property-id ${addressIdentifier}${timestamp}
 * @custom:property-value ${propertyData.estimatedValue}
 * @custom:token-potential ${propertyData.tokenPotential}
 */
contract ${name} is ERC721, ERC721URIStorage, Ownable {
    // Property details
    string public propertyAddress = "${fullAddress}";
    uint256 public propertyValue = ${propertyData.estimatedValue};
    uint256 public propertyTokenizationDate;
    
    // Token counter for minting
    uint256 private _nextTokenId;
    
    // Property documents hash (IPFS or other storage)
    string public propertyDocumentsHash;
    
    // Metadata URI for the property
    string public baseURI;
    
    // Events
    event PropertyRevalued(uint256 oldValue, uint256 newValue);
    event DocumentsUpdated(string newDocumentsHash);
    event RoyaltyDistributed(uint256 amount);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor()
        ERC721("${name}", "${symbol}")
        Ownable(msg.sender)
    {
        propertyTokenizationDate = block.timestamp;
    }
    
    /**
     * @dev Creates a new token representing a share of the property
     * @param to The address that will receive the minted token
     * @param uri The token metadata URI
     */
    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }
    
    /**
     * @dev Set the property documents hash (legal docs, inspection reports, etc.)
     * @param hash The IPFS or other storage hash containing property documentation
     */
    function setPropertyDocuments(string calldata hash) external onlyOwner {
        propertyDocumentsHash = hash;
        emit DocumentsUpdated(hash);
    }
    
    /**
     * @dev Update property value based on new appraisal
     * @param newValue The updated property value
     */
    function updatePropertyValue(uint256 newValue) external onlyOwner {
        uint256 oldValue = propertyValue;
        propertyValue = newValue;
        emit PropertyRevalued(oldValue, newValue);
    }
    
    /**
     * @dev Set the base URI for token metadata
     * @param newBaseURI The new base URI
     */
    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        baseURI = newBaseURI;
    }
    
    /**
     * @dev Distribute royalties to token owners
     * Must be implemented with a royalty distribution mechanism
     */
    function distributeRoyalty() external payable onlyOwner {
        require(msg.value > 0, "Must send ETH to distribute");
        emit RoyaltyDistributed(msg.value);
        // Implementation would distribute ETH to all token holders
    }

    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}`;
    }
    
    // Generate ERC1155 contract (Multi Token) for property tokenization
    function generateERC1155Contract(name, symbol, addressIdentifier, governance, timestamp) {
        const fullAddress = `${propertyData.address}, ${propertyData.city}, ${propertyData.state}`;
        
        return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

/**
 * @title ${name}
 * @dev Multi-Token Real Estate Tokenization Contract for property at ${fullAddress}
 * @custom:property-id ${addressIdentifier}${timestamp}
 * @custom:property-value ${propertyData.estimatedValue}
 * @custom:token-potential ${propertyData.tokenPotential}
 */
contract ${name} is ERC1155, Ownable, ERC1155Supply {
    // Property details
    string public propertyAddress = "${fullAddress}";
    uint256 public propertyValue = ${propertyData.estimatedValue};
    uint256 public propertyTokenizationDate;
    string public name = "${name}";
    string public symbol = "${symbol}";
    
    // Token types
    uint256 public constant EQUITY_TOKEN = 0;
    uint256 public constant RENTAL_TOKEN = 1;
    uint256 public constant VOTING_TOKEN = 2;
    
    // Property documents hash (IPFS or other storage)
    string public propertyDocumentsHash;
    
    // Events
    event PropertyRevalued(uint256 oldValue, uint256 newValue);
    event DocumentsUpdated(string newDocumentsHash);
    event RevenueDistributed(uint256 tokenId, uint256 amount);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     * @param uri_ The base metadata URI for tokens
     */
    constructor(string memory uri_)
        ERC1155(uri_)
        Ownable(msg.sender)
    {
        propertyTokenizationDate = block.timestamp;
    }
    
    /**
     * @dev Mint tokens of a specific type
     * @param account The address that will receive the minted tokens
     * @param id The token type ID
     * @param amount The quantity of tokens to mint
     * @param data Additional data to pass during minting
     */
    function mint(address account, uint256 id, uint256 amount, bytes memory data) public onlyOwner {
        _mint(account, id, amount, data);
    }
    
    /**
     * @dev Mint multiple token types in a batch
     * @param to The recipient address
     * @param ids Array of token type IDs
     * @param amounts Array of quantities to mint
     * @param data Additional data to pass during minting
     */
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public onlyOwner {
        _mintBatch(to, ids, amounts, data);
    }
    
    /**
     * @dev Set the property documents hash (legal docs, inspection reports, etc.)
     * @param hash The IPFS or other storage hash containing property documentation
     */
    function setPropertyDocuments(string calldata hash) external onlyOwner {
        propertyDocumentsHash = hash;
        emit DocumentsUpdated(hash);
    }
    
    /**
     * @dev Update property value based on new appraisal
     * @param newValue The updated property value
     */
    function updatePropertyValue(uint256 newValue) external onlyOwner {
        uint256 oldValue = propertyValue;
        propertyValue = newValue;
        emit PropertyRevalued(oldValue, newValue);
    }
    
    /**
     * @dev Distribute revenue to token holders of a specific token type
     * @param tokenId The token type ID to distribute revenue to
     */
    function distributeRevenue(uint256 tokenId) external payable onlyOwner {
        require(msg.value > 0, "Must send ETH to distribute");
        require(tokenId <= VOTING_TOKEN, "Invalid token ID");
        emit RevenueDistributed(tokenId, msg.value);
        // Implementation would distribute ETH to all holders of the specified token type
    }
    
    /**
     * @dev Set new URI for all token types
     * @param newuri The new base URI
     */
    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    // Override required functions
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }
}`;
    }
    
    // Copy code to clipboard
    function copyToClipboard() {
        // Get the raw code without HTML formatting
        const code = codeContent.textContent || codeContent.innerText;
        
        navigator.clipboard.writeText(code)
            .then(() => {
                // Show success feedback
                copyCodeBtn.classList.add('success');
                copyCodeBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Copied</span>
                `;
                
                // Reset after 2 seconds
                setTimeout(() => {
                    copyCodeBtn.classList.remove('success');
                    copyCodeBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                        </svg>
                        <span>Copy</span>
                    `;
                }, 2000);
            })
            .catch(err => {
                console.error('Error copying to clipboard:', err);
                alert('Failed to copy code to clipboard. Please try again.');
            });
    }
    
    // Download contract file
    function downloadContractFile() {
        // Get the raw code without HTML formatting
        const code = codeContent.textContent || codeContent.innerText;
        const contractName = contractNameInput.value.trim() || 'PropertyToken';
        const fileName = `${contractName}.sol`;
        
        // Create a blob with the code
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        // Create a temporary link to download the file
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    }
    
    // Connect wallet function (simplified for demo)
    function connectWallet() {
        if (typeof window.ethereum !== 'undefined') {
            window.ethereum.request({ method: 'eth_requestAccounts' })
                .then(accounts => {
                    deployBtn.textContent = 'Deploy Contract';
                    deployBtn.disabled = false;
                    alert(`Connected: ${accounts[0]}`);
                })
                .catch(error => {
                    console.error('Connection error:', error);
                    alert('Failed to connect wallet. Please try again.');
                });
        } else {
            alert('MetaMask not found. Please install MetaMask to use this feature.');
        }
    }
    
    // Add event listeners
    generateContractBtn.addEventListener('click', generateSmartContract);
    copyCodeBtn.addEventListener('click', copyToClipboard);
    downloadCodeBtn.addEventListener('click', downloadContractFile);
    deployBtn.addEventListener('click', connectWallet);
    
    // Handle window resize to realign lines
    window.addEventListener('resize', function() {
        if (codeContent.childNodes.length > 0) {
            alignLineNumbers();
        }
    });
    
    // Generate initial contract on page load
    generateSmartContract();
}); 