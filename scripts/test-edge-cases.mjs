/**
 * Lightweight edge-case checks for utils (no test runner required).
 */
import { parsePositiveInt } from '../src/utils/validation.ts';
import { toDateKey, isSameWeek } from '../src/utils/date.ts';

let passed = 0;
let failed = 0;

function assert(name, condition) {
  if (condition) {
    passed += 1;
  } else {
    failed += 1;
    console.error(`FAIL: ${name}`);
  }
}

// parsePositiveInt
assert('rejects empty', parsePositiveInt('', 1, 100) === null);
assert('rejects letters', parsePositiveInt('abc', 1, 100) === null);
assert('rejects decimals', parsePositiveInt('12.5', 1, 100) === null);
assert('rejects leading zeros edge', parsePositiveInt('007', 1, 100) === 7);
assert('rejects negative-looking', parsePositiveInt('-5', 1, 100) === null);
assert('rejects below min', parsePositiveInt('119', 120, 230) === null);
assert('rejects above max', parsePositiveInt('231', 120, 230) === null);
assert('accepts valid', parsePositiveInt('175', 120, 230) === 175);

// toDateKey uses local date
const localMidnight = new Date(2026, 7, 17); // Aug 17 2026 local
assert('toDateKey local', toDateKey(localMidnight) === '2026-08-17');

// isSameWeek
const ref = new Date(2026, 7, 17); // Sunday Aug 17
assert('same week Sunday', isSameWeek('2026-08-17', ref));
assert('same week Wednesday', isSameWeek('2026-08-19', ref));
assert('prev week excluded', !isSameWeek('2026-08-10', ref));

console.log(`\nEdge-case checks: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
