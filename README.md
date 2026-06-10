# Web Scraper with AI

A powerful web scraper that uses Claude AI to intelligently extract and transform data from websites.

## Features

- 🌐 Web scraping with Puppeteer
- 🤖 AI-powered data extraction using Claude
- 📊 Excel export functionality
- 🚀 Express server with REST API
- 🔄 Data transformation pipeline

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/webscraper.git
cd webscraper
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Get Your Own Anthropic API Key

⚠️ **Important**: This project uses the Anthropic API. You need to use **your own API key** to avoid depleting the original developer's token quota.

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up for a free account (if you don't have one)
3. Navigate to API Keys in your account settings
4. Create a new API key

### 4. Set Up Environment Variables

Copy `.env.example` to `.env` and add your API key:

```bash
cp .env.example .env
```

Then edit `.env` and replace the placeholder with your actual API key:

```env
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

**⚠️ Never commit your `.env` file to version control!**

## Usage

### Start the Server

```bash
npm start
```

The server will run on `http://localhost:3000`

### API Endpoints

[Add your specific API endpoints here]

## Project Structure

```
webscraper/
├── public/              # Frontend files
│   ├── index.html
│   ├── main.js
│   └── style.css
├── src/                 # Backend logic
│   ├── ai.js           # AI integration
│   ├── scraper.js      # Web scraping logic
│   ├── transformer.js  # Data transformation
│   └── exporter.js     # Export functionality
├── server.js           # Express server
├── package.json
├── .env.example        # Environment variables template
└── .gitignore
```

## Development

To modify the scraper, edit files in the `src/` directory:

- `scraper.js` - Handles web scraping with Puppeteer
- `ai.js` - AI integration with Anthropic API
- `transformer.js` - Data transformation logic
- `exporter.js` - Export to various formats

## Contributing

Feel free to fork and contribute!

## License

ISC
