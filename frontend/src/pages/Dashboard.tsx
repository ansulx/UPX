import { useState, useEffect } from "react";
import { useAuth } from "../App";
import {
  getPortfolio,
  deposit,
  getNotifications,
  getAgentStatus,
  agentChat,
  payFee,
} from "../api";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [portfolio, setPortfolio] = useState<{
    total: number;
    expected_return_avg: number;
    allocations: Array<{ instrument_name: string; amount: number; expected_return: number }>;
    agent_explanation?: string;
  } | null>(null);
  const [notifications, setNotifications] = useState<
    Array<{ id: number; title: string; message: string; type: string; created_at: string }>
  >([]);
  const [agentStatus, setAgentStatus] = useState<{ provider: string; message: string } | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState<"upi" | "stripe" | "paypal">("upi");
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState("");
  const [agentMessage, setAgentMessage] = useState("");
  const [agentResponse, setAgentResponse] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);
  const [feeLoading, setFeeLoading] = useState(false);

  function loadData() {
    getPortfolio().then(setPortfolio).catch(console.error);
    getNotifications().then((d) => setNotifications(d.notifications)).catch(console.error);
    getAgentStatus().then(setAgentStatus).catch(console.error);
  }

  useEffect(() => loadData(), []);

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) {
      setDepositError("Enter a valid amount");
      return;
    }
    setDepositError("");
    setDepositLoading(true);
    try {
      await deposit(amt, depositMethod);
      setDepositAmount("");
      loadData();
    } catch (err) {
      setDepositError(err instanceof Error ? err.message : "Deposit failed");
    } finally {
      setDepositLoading(false);
    }
  }

  async function handleAgentChat(e: React.FormEvent) {
    e.preventDefault();
    if (!agentMessage.trim()) return;
    setAgentLoading(true);
    setAgentResponse("");
    try {
      const { response } = await agentChat(agentMessage);
      setAgentResponse(response);
      setAgentMessage("");
    } catch (err) {
      setAgentResponse(`Error: ${err instanceof Error ? err.message : "Request failed"}`);
    } finally {
      setAgentLoading(false);
    }
  }

  async function handlePayFee() {
    setFeeLoading(true);
    try {
      await payFee();
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Fee payment failed");
    } finally {
      setFeeLoading(false);
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>AI Financial Agent</h1>
        <div className="header-right">
          <span>{user?.email}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      {agentStatus && (
        <div className="agent-badge">
          {agentStatus.provider === "ollama"
            ? "Cursor mode: Using local Llama (no API key)"
            : `Using ${agentStatus.provider}`}
        </div>
      )}

      <main className="dashboard-main">
        <section className="card portfolio-card">
          <h2>Portfolio</h2>
          {portfolio ? (
            <>
              <div className="portfolio-summary">
                <p className="total">Total: ₹{portfolio.total.toLocaleString()}</p>
                <p>Expected return: {portfolio.expected_return_avg.toFixed(2)}%</p>
              </div>
              {portfolio.allocations.length > 0 ? (
                <ul className="allocations">
                  {portfolio.allocations.map((a, i) => (
                    <li key={i}>
                      {a.instrument_name}: ₹{a.amount.toLocaleString()} ({a.expected_return}%)
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No allocations yet. Make a deposit to start.</p>
              )}
              {portfolio.agent_explanation && (
                <div className="agent-explanation">
                  <strong>Agent:</strong> {portfolio.agent_explanation}
                </div>
              )}
            </>
          ) : (
            <p>Loading...</p>
          )}
        </section>

        <section className="card deposit-card">
          <h2>Deposit</h2>
          <form onSubmit={handleDeposit}>
            <input
              type="number"
              placeholder="Amount (INR)"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              min="100"
              step="100"
            />
            <select
              value={depositMethod}
              onChange={(e) => setDepositMethod(e.target.value as "upi" | "stripe" | "paypal")}
            >
              <option value="upi">UPI</option>
              <option value="stripe">Stripe (International)</option>
              <option value="paypal">PayPal</option>
            </select>
            {depositError && <p className="error">{depositError}</p>}
            <button type="submit" disabled={depositLoading}>
              {depositLoading ? "Processing..." : "Deposit"}
            </button>
          </form>
          <p className="muted">Simulated deposit. In production, integrates with UPI/Stripe/PayPal.</p>
        </section>

        <section className="card fee-card">
          <h2>Yearly Fee</h2>
          <p>Management fee: ₹999/year</p>
          <button onClick={handlePayFee} disabled={feeLoading}>
            {feeLoading ? "Paying..." : "Pay Fee"}
          </button>
        </section>

        <section className="card agent-card">
          <h2>Chat with Agent</h2>
          <form onSubmit={handleAgentChat}>
            <input
              type="text"
              placeholder="Ask about your portfolio..."
              value={agentMessage}
              onChange={(e) => setAgentMessage(e.target.value)}
            />
            <button type="submit" disabled={agentLoading}>
              {agentLoading ? "..." : "Send"}
            </button>
          </form>
          {agentResponse && <div className="agent-response">{agentResponse}</div>}
        </section>

        <section className="card notifications-card">
          <h2>Notifications</h2>
          {notifications.length === 0 ? (
            <p className="muted">No notifications yet.</p>
          ) : (
            <ul className="notifications">
              {notifications.map((n) => (
                <li key={n.id} className={n.type}>
                  <strong>{n.title}</strong>
                  <p>{n.message}</p>
                  <small>{new Date(n.created_at).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
