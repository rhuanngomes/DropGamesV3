// Validações comuns usadas por login, signup e suporte.

// Lista de domínios comuns para sugestão de e-mail
const commonDomains = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
  'live.com',
  'icloud.com',
  'aol.com',
  'proton.me',
  'uol.com.br',
  'terra.com.br',
  'bol.com.br',
  'globo.com',
  'r7.com',
  'msn.com',
  'hotmail.com.br',
  'yahoo.com.br'
];

// Remove erro visual e mensagem
function clearError(input, errorElement) {
  if (!input || !errorElement) return;
  input.classList.remove('dg-input-error');
  errorElement.textContent = '';
  errorElement.style.display = 'none';
}

// Exibe erro visual e mensagem
function setError(input, errorElement, message) {
  if (!input || !errorElement) return false;
  input.classList.add('dg-input-error');
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  return false;
}

// Validação de e-mail com sugestão de domínio
function validateEmail(input, errorElement) {
  const value = input.value.trim();
  if (!value) {
    return setError(input, errorElement, 'Digite seu email.');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    const suggestion = suggestDomain(value);
    const message = suggestion
      ? `Email inválido. Você quis dizer ${suggestion}?`
      : 'Digite um email válido.';
    return setError(input, errorElement, message);
  }
  clearError(input, errorElement);
  return true;
}

// Sugere domínio de e-mail mais próximo
function suggestDomain(email) {
  if (!email || !email.includes('@')) return '';
  const parts = email.toLowerCase().split('@');
  if (parts.length !== 2) return '';
  const [localPart, domainPart] = parts;
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

// Distância de Levenshtein para sugestão de domínio
function getLevenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => []);
  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

// Validação de nome (mínimo 3 caracteres)
function validateNome(input, errorElement) {
  const value = input.value.trim();
  if (!value) {
    return setError(input, errorElement, 'Digite seu nome.');
  }
  if (value.length < 3) {
    return setError(input, errorElement, 'O nome deve ter ao menos 3 caracteres.');
  }
  clearError(input, errorElement);
  return true;
}

// Validação de campo obrigatório para nome
function validateNomeObrigatorio(input, errorElement, message = 'Digite seu nome.') {
  const value = input.value.trim();
  if (!value) {
    return setError(input, errorElement, message);
  }
  clearError(input, errorElement);
  return true;
}

// Validação de telefone brasileiro
function validateTelefone(input, errorElement) {
  const value = input.value.replace(/\D/g, '');
  if (!value) {
    return setError(input, errorElement, 'Digite seu telefone.');
  }
  const normalized = value.startsWith('55') ? value.slice(2) : value;
  if (!/^\d{10,11}$/.test(normalized)) {
    return setError(input, errorElement, 'Telefone inválido. Use DDD e número correto.');
  }
  clearError(input, errorElement);
  return true;
}

// Formata telefone para padrão brasileiro
function formatPhone(value) {
  const digits = value.replace(/\D/g, '');
  let cleaned = digits;
  if (cleaned.startsWith('55')) {
    cleaned = cleaned.slice(2);
  }
  const ddd = cleaned.slice(0, 2);
  const part1 = cleaned.slice(2, 7);
  const part2 = cleaned.slice(7, 11);
  if (!ddd) return '';
  if (!part1) return `+55 (${ddd}`;
  if (!part2) return `+55 (${ddd}) ${part1}`;
  return `+55 (${ddd}) ${part1}-${part2}`;
}

// Validação de senha forte
function validateSenha(input, errorElement) {
  const value = input.value.trim();
  if (!value) {
    return setError(input, errorElement, 'Digite sua senha.');
  }
  if (value.length < 8) {
    return setError(input, errorElement, 'A senha deve ter ao menos 8 caracteres.');
  }
  if (!/[A-Z]/.test(value)) {
    return setError(input, errorElement, 'A senha deve conter ao menos 1 letra maiúscula.');
  }
  if (!/[0-9]/.test(value)) {
    return setError(input, errorElement, 'A senha deve conter ao menos 1 número.');
  }
  if (!/[!@#$%^&*(),.?"{}|<>_\-]/.test(value)) {
    return setError(input, errorElement, 'A senha deve conter ao menos 1 caractere especial.');
  }
  const weakPatterns = [
    '12345678',
    'senha1234',
    'password',
    'qwerty',
    '11111111',
    '12341234'
  ];
  if (weakPatterns.some((item) => value.toLowerCase().includes(item))) {
    return setError(input, errorElement, 'Escolha uma senha mais forte.');
  }
  clearError(input, errorElement);
  return true;
}

// Atualiza critérios visuais de senha forte
function updateCriteria(input, items) {
  const value = input.value;
  const rules = [
    value.length >= 8,
    /[A-Z]/.test(value),
    /[0-9]/.test(value),
    /[!@#$%^&*(),.?"{}|<>_\-]/.test(value),
    !/(.)\1{2,}/.test(value),
    !/(123|234|345|456|567|678|789|abc|bcd|cde)/i.test(value),
    value.trim().length > 0
  ];
  items.forEach((item, index) => {
    if (!item) return;
    if (rules[index]) {
      item.classList.add('dg-signup-criteria-item--active');
    } else {
      item.classList.remove('dg-signup-criteria-item--active');
    }
  });
}

// Exibe mensagem de erro centralizada usando switch case
// tipoErro pode ser: 'required', 'email', 'senha', 'telefone', etc.
function mostrarMensagemErro(tipoErro, input, errorElement) {
  let mensagem;
  switch (tipoErro) {
    case 'required':
      mensagem = 'Este campo é obrigatório.';
      break;
    case 'email':
      mensagem = 'Digite um email válido.';
      break;
    case 'senha':
      mensagem = 'A senha não atende aos requisitos.';
      break;
    case 'telefone':
      mensagem = 'Telefone inválido.';
      break;
    default:
      mensagem = 'Erro desconhecido.';
  }
  setError(input, errorElement, mensagem);
}
