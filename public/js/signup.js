const nomeInput    = document.getElementById('signup-nome');
const emailInput   = document.getElementById('signup-email');
const senhaInput   = document.getElementById('signup-password');
const toggleBtn    = document.getElementById('toggle-signup-password');
const nomeError    = document.getElementById('signup-nome-error');
const emailError   = document.getElementById('signup-email-error');
const senhaError   = document.getElementById('signup-password-error');
const form         = document.querySelector('.dg-login-form');
const criteriaItems = document.querySelectorAll('.dg-signup-criteria-item');

// ── Common passwords ────────────────────────────────────────────────────────
const commonPasswords = [
  '123456','123456789','qwerty','password','12345','12345678','111111',
  '1234567','abc123','password1','123123','admin','letmein','welcome',
  'monkey','1234567890','iloveyou','princess','rockyou','12345678910',
  'sunshine','qwerty123','football','baseball','superman','trustno1',
  'jennifer','jordan','harley','ranger','iwantu','andrew','tigger',
  'shadow','buster','robert','thomas','daniel','matthew',
  'hunter','michelle','william','christopher','samantha','michael',
  'ashley','joshua','pepper','11111111','jessica','nicole','anthony',
  'patrick','summer','jordan23','flower','taylor','bubbles','butterfly',
  'computer','dragon','whatever','mercedes','corvette','diamond',
  'ferrari','cheese','master','slipknot','snoopy','boomer',
  'smokey','guitar','nothing','batman','zaq1zaq1','qazwsx',
];

const commonDomains = [
  'gmail.com','outlook.com','hotmail.com','yahoo.com',
  'icloud.com','uol.com.br','bol.com.br',
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function levenshteinDistance(a, b) {
  const m = Array.from({ length: b.length + 1 }, () => []);
  for (let i = 0; i <= b.length; i++) m[i][0] = i;
  for (let j = 0; j <= a.length; j++) m[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      m[i][j] = Math.min(m[i-1][j]+1, m[i][j-1]+1, m[i-1][j-1]+cost);
    }
  }
  return m[b.length][a.length];
}

function suggestDomain(domain) {
  let bestMatch = null, bestDist = Infinity;
  for (const c of commonDomains) {
    const d = levenshteinDistance(domain, c);
    if (d < bestDist) { bestDist = d; bestMatch = c; }
  }
  return { match: bestMatch, distance: bestDist };
}

function isCommonPassword(pwd) {
  const lower = pwd.toLowerCase();
  if (commonPasswords.includes(lower)) return true;
  for (const c of commonPasswords) {
    if (lower.startsWith(c) && /^\d{1,3}$/.test(lower.slice(c.length))) return true;
  }
  return false;
}

function hasRepetitions(pwd) {
  return /(.)\1{3,}/.test(pwd);
}

function hasSequences(pwd) {
  return /123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(pwd);
}

// ── Criteria checks (order must match .dg-signup-criteria-item in HTML) ──────
// 0  A senha deve ter no mínimo 8 caracteres.
// 1  Deve conter ao menos 1 letra maiúscula.
// 2  Deve conter ao menos 1 número.
// 3  Deve conter ao menos 1 caractere especial.
// 4  Não use senhas comuns ou fáceis de adivinhar.
// 5  Evite repetições como 1111 ou aaaa.
// 6  Evite sequências como 123 ou abc.
const criteriaChecks = [
  (p) => p.length >= 8,
  (p) => /[A-Z]/.test(p),
  (p) => /[0-9]/.test(p),
  (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p),
  (p) => p.length > 0 && !isCommonPassword(p),
  (p) => p.length > 0 && !hasRepetitions(p),
  (p) => p.length > 0 && !hasSequences(p),
];

// ── Criteria fade ─────────────────────────────────────────────────────────────
function updateCriteria(pwd) {
  criteriaItems.forEach((item, i) => {
    if (criteriaChecks[i](pwd)) {
      item.classList.add('criterio-met');
    } else {
      item.classList.remove('criterio-met');
    }
  });
}

// ── Field helpers ─────────────────────────────────────────────────────────────
function setError(input, el, msg) {
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
  }
  input.classList.add('dg-input-error');
}

function clearError(input, el) {
  if (el) {
    el.textContent = '';
    el.style.display = 'none';
  }
  input.classList.remove('dg-input-error');
}

// ── Validators ────────────────────────────────────────────────────────────────
function validateNome() {
  const v = nomeInput.value.trim();
  if (!v)        { setError(nomeInput, nomeError, 'Digite seu nome.'); return false; }
  if (v.length < 3) { setError(nomeInput, nomeError, 'O nome deve ter pelo menos 3 caracteres.'); return false; }
  clearError(nomeInput, nomeError);
  return true;
}

function validateEmail() {
  const v = emailInput.value.trim();
  if (!v || !emailInput.validity.valid) {
    setError(emailInput, emailError, 'Digite um e-mail válido.');
    return false;
  }
  const [local, domain] = v.split('@');
  if (!domain) { setError(emailInput, emailError, 'Digite um e-mail com @ e domínio válido.'); return false; }
  const { match, distance } = suggestDomain(domain.toLowerCase());
  if (distance === 0) { clearError(emailInput, emailError); return true; }
  if (distance <= 3) {
    setError(emailInput, emailError, `Você quis dizer ${local}@${match}?`);
    return false;
  }
  setError(emailInput, emailError, `"${domain}" não reconhecido. Verifique o e-mail digitado.`);
  return false;
}

function validateSenha() {
  const v = senhaInput.value;
  if (!v) { setError(senhaInput, senhaError, 'Digite uma senha.'); return false; }
  const allMet = criteriaChecks.every((check) => check(v));
  if (!allMet) { setError(senhaInput, senhaError, 'A senha deve atender a todos os requisitos.'); return false; }
  clearError(senhaInput, senhaError);
  return true;
}

// ── Event listeners ───────────────────────────────────────────────────────────
toggleBtn.addEventListener('click', () => {
  senhaInput.type = senhaInput.type === 'password' ? 'text' : 'password';
});

senhaInput.addEventListener('input', () => {
  updateCriteria(senhaInput.value);
  if (senhaInput.classList.contains('dg-input-error')) clearError(senhaInput, senhaError);
});

nomeInput.addEventListener('input', () => {
  if (nomeInput.classList.contains('dg-input-error')) clearError(nomeInput, nomeError);
});

emailInput.addEventListener('input', () => {
  if (emailInput.classList.contains('dg-input-error')) clearError(emailInput, emailError);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  // use bitwise & so all three always run (all errors show at once)
  const valid = validateNome() & validateEmail() & validateSenha();
  if (valid) window.location.href = 'login.html';
});
