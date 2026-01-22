export const usuarioPattern = /^[a-zA-Z0-9_.]+$/;
export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getPasswordChecks = (password) => ({
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /\d/.test(password),
  symbol: /[^A-Za-z0-9]/.test(password),
});
