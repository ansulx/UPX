const API = "/api/v1";

function getToken() {
  return localStorage.getItem("token");
}

export async function signup(email: string, password: string, name?: string) {
  const res = await fetch(`${API}/user/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Signup failed");
  return data;
}

export async function signin(email: string, password: string) {
  const res = await fetch(`${API}/user/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Signin failed");
  return data;
}

export async function getPortfolio() {
  const res = await fetch(`${API}/portfolio`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch portfolio");
  return data;
}

export async function deposit(amount: number, paymentMethod: string, currency = "INR") {
  const res = await fetch(`${API}/payments/deposit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      amount,
      currency,
      payment_method: paymentMethod,
      payment_id: `sim_${Date.now()}`,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Deposit failed");
  return data;
}

export async function payFee() {
  const res = await fetch(`${API}/payments/fee`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Fee payment failed");
  return data;
}

export async function getNotifications() {
  const res = await fetch(`${API}/notifications`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch notifications");
  return data;
}

export async function markNotificationRead(id: number) {
  await fetch(`${API}/notifications/${id}/read`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}

export async function getAgentStatus() {
  const res = await fetch(`${API}/agent/status`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch agent status");
  return data;
}

export async function agentChat(message: string) {
  const res = await fetch(`${API}/agent/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ message }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Agent chat failed");
  return data;
}
