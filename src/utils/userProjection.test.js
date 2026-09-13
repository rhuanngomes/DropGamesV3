import test from 'node:test';
import assert from 'node:assert/strict';
import { projectUsers, validateUserProjection } from './userProjection.js';

const defaults = { initialUsers: 1000, monthlyRate: 5, months: 12 };

test('applies compound growth and includes the initial month', () => {
  const series = projectUsers(defaults);
  assert.equal(series.length, 13);
  assert.deepEqual(series[0], { month: 0, users: 1000 });
  assert.ok(Math.abs(series[12].users - 1795.85632602213) < 1e-9);
  assert.equal(Math.round(series[12].users), 1796);
});

test('supports stable and declining scenarios', () => {
  assert.ok(projectUsers({ ...defaults, monthlyRate: 0 }).every(({ users }) => users === 1000));
  const declining = projectUsers({ initialUsers: 1000, monthlyRate: -50, months: 2 });
  assert.deepEqual(declining.map(({ users }) => users), [1000, 500, 250]);
});

test('retains precision between months', () => {
  const series = projectUsers({ initialUsers: 1, monthlyRate: 50, months: 2 });
  assert.deepEqual(series.map(({ users }) => users), [1, 1.5, 2.25]);
});

test('accepts fractional rates', () => {
  const series = projectUsers({ initialUsers: 1000, monthlyRate: 2.5, months: 2 });
  assert.ok(Math.abs(series[2].users - 1050.625) < 1e-9);
});

test('rejects invalid inputs before allocating the series and identifies the field', () => {
  const invalid = {
    initialUsers: [0, -1, 1.5, 1_000_001, NaN, Infinity, '', '1000', null, undefined],
    monthlyRate: [-50.01, 50.01, NaN, Infinity, -Infinity, '', '5', null, undefined],
    months: [0, -1, 1.5, 37, 1e9, NaN, Infinity, '', '12', null, undefined],
  };
  for (const [field, values] of Object.entries(invalid)) {
    for (const value of values) {
      const parameters = { ...defaults, [field]: value };
      assert.deepEqual(Object.keys(validateUserProjection(parameters)), [field]);
      assert.throws(() => projectUsers(parameters), RangeError, `${field}: ${String(value)}`);
    }
  }
});

test('extreme valid scenarios remain positive, finite and within safe numeric range', () => {
  for (const initialUsers of [1, 1_000_000]) {
    for (const monthlyRate of [-50, 50]) {
      const series = projectUsers({ initialUsers, monthlyRate, months: 36 });
      assert.equal(series.length, 37);
      assert.ok(series.every(({ users }) => Number.isFinite(users) && users > 0 && users < Number.MAX_SAFE_INTEGER));
    }
  }
});
