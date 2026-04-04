import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const passwordService = {
  async hashPassword(plainPassword) {
    try {
      const hash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
      return hash;
    } catch (error) {
      console.error('Password hashing failed:', error);
      throw error;
    }
  },

  async verifyPassword(plainPassword, hash) {
    try {
      const isValid = await bcrypt.compare(plainPassword, hash);
      return isValid;
    } catch (error) {
      console.error('Password verification failed:', error);
      return false;
    }
  },
};
