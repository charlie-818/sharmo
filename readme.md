# Sharmo - Tokenized Real Estate Investment Platform

Sharmo transforms property ownership through blockchain technology, enabling fractional ownership, instant liquidity, and global accessibility.

## Overview

Sharmo is a modern platform that converts real estate into digital tokens on the Ethereum blockchain, allowing fractional ownership with minimal investment. Users can buy, sell, and trade property shares instantly while benefiting from real asset security.

## Features

- **Fractional Ownership**: Invest in high-value properties with as little as $100
- **Instant Liquidity**: Trade property tokens 24/7 on decentralized exchanges
- **Smart Income Distribution**: Receive rental income automatically through smart contracts
- **Portfolio Diversification**: Build a diverse real estate portfolio across multiple locations
- **Transparent Transactions**: All property details and transaction history are recorded on the blockchain
- **Global Accessibility**: Access real estate investments from anywhere in the world

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Ethereum Blockchain
- Solidity Smart Contracts

## Blockchain Standards

- **ERC-20**: Fungible tokens representing equal shares of a property
- **ERC-721**: Non-fungible tokens for unique property identifiers
- **ERC-1155**: Hybrid protocol supporting both fungible and non-fungible tokens

## Getting Started

1. Clone this repository
2. Open `index.html` in your browser to view the site locally

## Folder Structure

```
sharmo/
├── css/                  # Stylesheets
│   ├── components/       # Component-specific styles
│   └── sections/         # Section-specific styles
├── js/                   # JavaScript files
├── images/               # Images and icons
│   └── ethereum/         # Ethereum-related icons
├── components/           # Reusable HTML components
├── index.html            # Main landing page
└── site.webmanifest      # Web app manifest
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or inquiries, please use the contact form on the website.

## Whitepaper Setup

The website includes a link to the Sharmo whitepaper in the footer navigation. To properly set up the whitepaper:

1. Convert the Markdown file `shrmo-whitepaper (1).md` to PDF format:
   - Option 1: Use an online Markdown to PDF converter like [md2pdf.com](https://md2pdf.com/)
   - Option 2: Use a desktop app like Typora, Pandoc, or VS Code with a PDF export extension
   - Option 3: Use command-line tools:
     ```bash
     # Using Pandoc (requires installation)
     pandoc "shrmo-whitepaper (1).md" -o docs/sharmo-whitepaper.pdf --pdf-engine=wkhtmltopdf
     
     # Using npm markdown-pdf package
     npm install -g markdown-pdf
     markdown-pdf "shrmo-whitepaper (1).md" -o docs/sharmo-whitepaper.pdf
     ```

2. Ensure the PDF is properly formatted and includes any necessary branding elements
3. Place the generated PDF in the `docs` directory as `sharmo-whitepaper.pdf`
4. The whitepaper will be accessible via the URL: `https://yourdomain.com/docs/sharmo-whitepaper.pdf`

Note: The whitepaper link in the footer is set to open in a new tab, allowing users to view the PDF directly in their browser rather than downloading it. If you need to change the URL or behavior, you can edit the link in the `components/footer.html` file.
