export const projectionLimits = Object.freeze({
  initialUsers: Object.freeze({ min: 1, max: 1_000_000 }),
  monthlyRate: Object.freeze({ min: -50, max: 50 }),
  months: Object.freeze({ min: 1, max: 36 }),
});

export function validateUserProjection({ initialUsers, monthlyRate, months }) {
  const errors = {};
  if (!Number.isInteger(initialUsers) || initialUsers < projectionLimits.initialUsers.min || initialUsers > projectionLimits.initialUsers.max) {
    errors.initialUsers = 'Informe uma base inteira entre 1 e 1.000.000 de usuários.';
  }
  if (!Number.isFinite(monthlyRate) || monthlyRate < projectionLimits.monthlyRate.min || monthlyRate > projectionLimits.monthlyRate.max) {
    errors.monthlyRate = 'Informe uma taxa mensal entre -50% e 50%.';
  }
  if (!Number.isInteger(months) || months < projectionLimits.months.min || months > projectionLimits.months.max) {
    errors.months = 'Informe um período inteiro entre 1 e 36 meses.';
  }
  return errors;
}

export function projectUsers(parameters) {
  const errors = validateUserProjection(parameters);
  if (Object.keys(errors).length) throw new RangeError(Object.values(errors).join(' '));
  const { initialUsers, monthlyRate, months } = parameters;
  // U(t) = U₀ × (1 + r/100)^t. Validate before allocation; round only for display.
  return Array.from({ length: months + 1 }, (_, month) => ({
    month,
    users: initialUsers * (1 + monthlyRate / 100) ** month,
  }));
}
