# AI Financial Agent - Project Specification

## Overview

An AI-powered financial management agent that accepts UPI and international payments, manages user funds through a pooled investment strategy focused on stable, low-volatility instruments (government bonds, post office schemes, fixed deposits), and provides transparent notifications. The agent is accessible to everyone—including Cursor users without API keys—via multiple LLM backends.

## Core Features

### 1. Payment Acceptance
- **UPI** (India): Integration with UPI payment gateways
- **International**: Stripe, PayPal, or similar for global payments
- Users deposit specific amounts into their pool account

### 2. Finance Management Service
- Yearly fee as compensation for management
- Agent allocates funds across stable investment vehicles
- No volatile markets—government bonds, post office schemes, fixed deposits, sovereign funds

### 3. Investment Pool & Allocation
- User deposits go into a managed pool
- Agent distributes across:
  - Government securities (bonds, treasury bills)
  - Post office savings schemes (PPF, NSC, etc.)
  - Bank fixed deposits
  - Sovereign/stable mutual funds
- Goal: Positive portfolio returns, minimal risk

### 4. AI Agent
- Orchestrates allocation decisions
- Sends notifications for every action
- Transparent: user always knows what the agent is doing
- No negative surprises—stable markets only

### 5. Multi-LLM Support
- **OpenAI** (GPT-4, etc.)
- **Anthropic Claude**
- **Llama** (local/self-hosted)
- **Free services** (Gemini free tier, etc.)
- **Cursor mode**: Users without any API keys can use local Llama or free tiers—full functionality without paid APIs

### 6. Integrations
- Open source tools
- Collaborative—works with existing finance APIs
- Extensible architecture

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Web UI        │────▶│   Backend API    │────▶│   Database      │
│   (React/Vite)  │     │   (Express)      │     │   (SQLite/PG)   │
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
             ┌──────────┐ ┌──────────┐ ┌──────────┐
             │ Payments │ │ AI Agent │ │ Notify   │
             │ UPI/Intl │ │ Multi-LLM│ │ System   │
             └──────────┘ └──────────┘ └──────────┘
```

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **AI**: OpenAI, Anthropic, Ollama (Llama), free APIs
- **Payments**: Razorpay (UPI), Stripe (international)
- **Frontend**: React, Vite

## User Flow

1. User signs up → pays yearly management fee
2. User deposits via UPI or international payment
3. Agent allocates to stable instruments
4. User receives notifications for every allocation
5. User views portfolio and returns in dashboard

## Cursor/No-API Mode

- Default: Ollama with Llama (runs locally, no API key)
- Fallback: Free Gemini/other free tiers
- Full agent functionality without paid subscriptions
