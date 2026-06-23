/** @jest-environment node */
import { encrypt, decrypt } from './encryption';

test('encrypts and decrypts data', () => {
  const key = 'test-key';
  const text = 'secret message';
  const enc = encrypt(text, key);
  const dec = decrypt(enc, key);
  expect(dec).toBe(text);
});
