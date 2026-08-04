const commonDomains = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
  'live.com',
  'icloud.com',
  'proton.me',
  'uol.com.br',
  'terra.com.br',
  'bol.com.br',
];

export const passwordRules = [
  ['A senha deve ter no minimo 8 caracteres.', (password) => password.length >= 8],
  ['Use 12 caracteres ou mais para uma senha forte.', (password) => password.length >= 12],
  ['Deve conter ao menos 1 letra maiuscula.', (password) => /[A-Z]/.test(password)],
  ['Deve conter ao menos 1 letra minuscula.', (password) => /[a-z]/.test(password)],
  ['Deve conter ao menos 1 numero.', (password) => /[0-9]/.test(password)],
  ['Deve conter ao menos 1 caractere especial.', (password) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)],
  ['Nao use senhas comuns ou faceis de adivinhar.', (password) => password.length > 0 && !['123456', 'password', 'qwerty', 'admin'].includes(password.toLowerCase())],
  ['Evite repeticoes como 1111 ou aaaa.', (password) => password.length > 0 && !/(.)\1{3,}/.test(password)],
  ['Evite sequencias como 123 ou abc.', (password) => password.length > 0 && !/123|234|345|abc|bcd|cde/i.test(password)],
];

const leakedPasswordPatterns = [
  '123456',
  '123456789',
  'password',
  'qwerty',
  'admin',
  'senha',
  'dropgames',
  'happygame',
  'fiap123',
  'steam123',
];

export function validateEmail(value) {
  const email = value.trim();
  if (!email) return 'Digite seu email.';
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '';

  const suggestion = suggestDomain(email);
  return suggestion ? `Email invalido. Voce quis dizer ${suggestion}?` : 'Digite um email valido.';
}

export function validateRequiredName(value, label = 'nome') {
  const name = value.trim();
  if (!name) return `Digite seu ${label}.`;
  if (name.length < 3) return `O ${label} deve ter ao menos 3 caracteres.`;
  return '';
}

export function validatePhone(value) {
  const digits = value.replace(/\D/g, '');
  const normalized = digits.startsWith('55') ? digits.slice(2) : digits;

  if (!normalized) return 'Digite seu telefone.';
  if (!/^\d{10,11}$/.test(normalized)) return 'Telefone invalido. Use DDD e numero correto.';
  return '';
}

export function formatPhone(value) {
  const digits = value.replace(/\D/g, '').replace(/^55/, '').slice(0, 11);
  const ddd = digits.slice(0, 2);
  const part1 = digits.slice(2, 7);
  const part2 = digits.slice(7, 11);

  if (!ddd) return '';
  if (!part1) return `+55 (${ddd}`;
  if (!part2) return `+55 (${ddd}) ${part1}`;
  return `+55 (${ddd}) ${part1}-${part2}`;
}

export function validatePassword(value) {
  if (!value) return 'Digite sua senha.';
  const strength = getPasswordStrength(value);
  if (strength.isCompromised) return 'Esta senha aparece em padroes comuns ou vazados. Escolha outra.';
  if (strength.score < 65) return 'A senha nao atende ao nivel minimo de seguranca.';
  return '';
}

export function validatePasswordConfirmation(password, confirmation) {
  if (!confirmation) return 'Confirme sua senha.';
  if (password !== confirmation) return 'As senhas nao conferem.';
  return '';
}

export function getPasswordStrength(password = '') {
  const normalized = password.toLowerCase();
  const metRules = passwordRules.map(([, check]) => check(password));
  const isCompromised = leakedPasswordPatterns.some((pattern) => normalized.includes(pattern));
  const varietyScore = metRules.filter(Boolean).length * 10;
  const lengthBonus = Math.min(Math.max(password.length - 8, 0) * 3, 18);
  const uniqueBonus = new Set(password).size >= Math.min(password.length, 8) ? 8 : 0;
  const penalty = isCompromised ? 35 : 0;
  const score = Math.max(0, Math.min(100, varietyScore + lengthBonus + uniqueBonus - penalty));

  if (!password) {
    return {
      score: 0,
      level: 'empty',
      label: 'Digite uma senha',
      isCompromised: false,
      unmet: passwordRules.map(([label]) => label),
    };
  }

  if (score >= 82) {
    return {
      score,
      level: 'strong',
      label: 'Senha forte',
      isCompromised,
      unmet: getUnmetPasswordRules(password),
    };
  }

  if (score >= 65) {
    return {
      score,
      level: 'medium',
      label: 'Senha media',
      isCompromised,
      unmet: getUnmetPasswordRules(password),
    };
  }

  return {
    score,
    level: 'weak',
    label: 'Senha fraca',
    isCompromised,
    unmet: getUnmetPasswordRules(password),
  };
}

export function getAgeProtectionPolicy(ageGroup) {
  const policies = {
    under13: {
      label: 'Menor de 13 anos',
      canCreateAccount: false,
      text: 'Conta bloqueada neste prototipo. Jogos, recomendacoes e comunicacoes devem exigir responsavel legal.',
    },
    teen: {
      label: '13 a 17 anos',
      canCreateAccount: true,
      text: 'Recomendacoes sensiveis sao reduzidas, ofertas com conteudo adulto recebem aviso e dados sao tratados com minimizacao.',
    },
    adult: {
      label: '18 anos ou mais',
      canCreateAccount: true,
      text: 'Experiencia completa, mantendo transparencia, seguranca de sessao e controle sobre dados pessoais.',
    },
  };

  return policies[ageGroup] || policies.adult;
}

function getUnmetPasswordRules(password) {
  return passwordRules.filter(([, check]) => !check(password)).map(([label]) => label);
}

function suggestDomain(email) {
  if (!email.includes('@')) return '';
  const [localPart, domainPart] = email.toLowerCase().split('@');
  if (!localPart || !domainPart) return '';

  let bestMatch = null;

  for (const candidate of commonDomains) {
    const distance = getLevenshteinDistance(domainPart, candidate);
    if (distance === 0) return '';
    if (distance <= 2 && (!bestMatch || distance < bestMatch.distance)) {
      bestMatch = { candidate, distance };
    }
  }

  return bestMatch ? `${localPart}@${bestMatch.candidate}` : '';
}

function getLevenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}
