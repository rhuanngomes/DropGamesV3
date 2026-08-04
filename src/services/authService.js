export async function signupWithEmail(payload) {
  return authRequest('/api/auth/signup', {
    method: 'POST',
    body: payload,
  });
}

export async function loginWithEmail(payload) {
  return authRequest('/api/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export async function logoutEmailSession() {
  return authRequest('/api/auth/logout', { method: 'POST' });
}

export async function getEmailSession() {
  return authRequest('/api/auth/session');
}

export async function requestPasswordRecovery(email) {
  return authRequest('/api/auth/recover', {
    method: 'POST',
    body: { email },
  });
}

export async function exportAccountData() {
  return authRequest('/api/auth/export');
}

export async function deleteEmailAccount() {
  return authRequest('/api/auth/account', { method: 'DELETE' });
}

async function authRequest(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || 'GET',
    credentials: 'include',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Nao foi possivel concluir a operacao de seguranca.');
  }

  return data;
}
