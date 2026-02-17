import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { signin } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await signin(email, password);
      login(token, user);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signin failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>AI Financial Agent</h1>
        <p className="subtitle">Sign in to manage your stable investments</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p>
          No account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
