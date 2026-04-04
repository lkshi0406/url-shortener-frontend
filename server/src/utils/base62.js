const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = BigInt(ALPHABET.length);
const MIN_LENGTH = 6; // Minimum code length for aesthetics

export const encodeBase62 = (input) => {
  let value = BigInt(input);

  if (value < 0n) {
    throw new Error('Base62 encoding only supports non-negative integers.');
  }

  if (value === 0n) {
    return ALPHABET[0].repeat(MIN_LENGTH);
  }

  let output = '';
  while (value > 0n) {
    const remainder = Number(value % BASE);
    output = ALPHABET[remainder] + output;
    value /= BASE;
  }

  // Pad to minimum length for aesthetics
  return output.padStart(MIN_LENGTH, '0');
};
