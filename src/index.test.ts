import { expect, test } from 'vitest';
import { register } from './index';

test('register function works', () => {
  expect(register).toBeTypeOf('function');
});
