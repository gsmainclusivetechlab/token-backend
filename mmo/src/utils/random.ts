import crypto from 'crypto';

export function getRandom(length: number): number {
  const power = Math.pow(10, length-1);
  const random = crypto.randomBytes(4).readUInt32LE() / 0x100000000;
  const multiplier = Math.floor(random * power) + 1 * power;
  const timestamp = new Date().getTime();
  const stringNumber = String(multiplier * timestamp).substring(0, length);
  return parseInt(stringNumber);
}
