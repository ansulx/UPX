# AI Financial Agent

AI-powered financial management agent that accepts UPI/international payments, manages funds through stable investments (government bonds, post office schemes), and works for everyone—**including Cursor users without API keys**.

## Quick Start

```bash
# Install all dependencies
npm run install:all

# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

Open http://localhost:5173

## Cursor Mode (No API Keys Required)

If you don't have OpenAI or Claude API keys, the agent uses **Ollama** (local Llama):

1. Install [Ollama](https://ollama.ai)
2. Run `ollama pull llama3.2`
3. Start backend — it will use Ollama automatically

```bash
# Optional: set if Ollama runs elsewhere
export OLLAMA_HOST=http://localhost:11434
npm run dev:backend
```

## With API Keys

Create `backend/.env`:

```
OPENAI_API_KEY=sk-...        # Uses GPT-4o-mini
# or
ANTHROPIC_API_KEY=sk-ant-... # Uses Claude
```

## Project Structure

```
├── backend/           # Express API
│   ├── src/
│   │   ├── router/    # user, payment, portfolio, agent, notifications
│   │   ├── services/  # llm, agent, investment, notifications
│   │   └── db/
├── frontend/          # React + Vite
├── PROJECT.md         # Full specification
└── README.md
```

## API Endpoints

- `POST /api/v1/user/signup` - Register
- `POST /api/v1/user/signin` - Login
- `POST /api/v1/payments/deposit` - Deposit (UPI/Stripe/PayPal)
- `POST /api/v1/payments/fee` - Pay yearly fee
- `GET /api/v1/portfolio` - Portfolio + agent explanation
- `GET /api/v1/notifications` - Notifications
- `GET /api/v1/agent/status` - LLM provider (Ollama/OpenAI/Claude)
- `POST /api/v1/agent/chat` - Chat with agent

## Requirements

- Node.js 18+
- For Cursor mode: [Ollama](https://ollama.ai) + `ollama pull llama3.2`

## License

ISC
