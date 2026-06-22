export function getPasswordStrength(pwd: string): number {
  if (pwd.length === 0) return 0;
  if (pwd.length < 6) return 1;
  if (pwd.length < 8) return 2;

  const hasMixed = /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd);
  if (pwd.length >= 8 && !hasMixed) return 3;
  if (pwd.length >= 8 && hasMixed) return 4;

  return 0;
}