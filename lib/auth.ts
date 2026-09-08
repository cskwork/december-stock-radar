import { timingSafeEqual } from 'node:crypto';
export function authorized(header: string | null, secret: string): boolean {
  const supplied = Buffer.from(header || '');
  const expected = Buffer.from(`Bearer ${secret}`);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
