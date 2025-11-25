# CO2 Emissions Certificate Trading Platform

A professional simulation of a CO2 emissions certificate trading platform. This application allows users to buy, convert, verify, and surrender carbon certificates.

## Features

- **Professional Trading Interface**: Modern UI for carbon certificate trading
- **CER to EUA Conversion**: Convert Chinese (CER) certificates to European (EUA) certificates
- **Certificate Verification**: Verify EUA certificates with external registries
- **Emissions Management**: Surrender certificates to offset CO2 emissions
- **Real-time Market Data**: Live updates of certificate prices and offers
- **Portfolio Management**: Track your certificates and their status
- **Interactive Dashboard**: Visualize your portfolio, market trends, and emissions compliance

## Technology Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Charts**: Chart.js
- **UI Components**: Headless UI & Heroicons
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Install dependencies
```bash
npm install
```

2. Start the development server
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Login Credentials

Use the following credentials to log in:
- Username: `Victor`
- Password: `VictorVic`

## Usage Guide

### Dashboard
The dashboard provides an overview of your portfolio, market prices, and emissions compliance status. You can view your certificate holdings, current market prices, trading volumes, and emissions data.

### Market
In the market section, you can browse available certificates for purchase. There are two types of certificates:
- **CER (Chinese)**: Typically cheaper but need conversion before use
- **EUA (European)**: Ready for verification and surrender

### Portfolio
The portfolio section displays all your certificates and their current status:
- **Available**: Certificates ready for use or conversion
- **Converting**: CER certificates being converted to EUA (takes 5 minutes)
- **Verified**: EUA certificates that have been verified and are ready for surrender

Actions you can take:
- Convert CER to EUA (costs €2 per certificate)
- Verify EUA certificates with external registries

### Emissions
The emissions section shows your CO2 emissions compliance status. Here you can:
- View your total emissions, surrendered amount, and remaining obligations
- Surrender verified EUA certificates to offset your emissions
- Track your compliance progress