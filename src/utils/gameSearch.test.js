import test from 'node:test';
import assert from 'node:assert/strict';
import { expandGameSearchQuery } from './gameSearch.js';

test('expands common game acronyms', () => {
  assert.equal(expandGameSearchQuery('GTA'), 'Grand Theft Auto');
  assert.equal(expandGameSearchQuery('rdr2'), 'Red Dead Redemption 2');
  assert.equal(expandGameSearchQuery('CS2'), 'Counter-Strike 2');
});

test('preserves qualifiers typed after an acronym', () => {
  assert.equal(expandGameSearchQuery('gta 4'), 'Grand Theft Auto 4');
  assert.equal(expandGameSearchQuery('cod mw 3'), 'Call of Duty Modern Warfare 3');
});

test('keeps regular game names unchanged', () => {
  assert.equal(expandGameSearchQuery('Hollow Knight'), 'Hollow Knight');
});
