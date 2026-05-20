export type DocumentType = 'CPF' | 'CNPJ';

export function normalizeDocument(document: string): string {
  return document.replace(/\D/g, '');
}

export function getDocumentType(document: string): DocumentType | null {
  const normalized = normalizeDocument(document);

  if (normalized.length === 11) {
    return 'CPF';
  }

  if (normalized.length === 14) {
    return 'CNPJ';
  }

  return null;
}

export function isValidCpfOrCnpj(document: string): boolean {
  const normalized = normalizeDocument(document);

  if (normalized.length === 11) {
    return isValidCpf(normalized);
  }

  if (normalized.length === 14) {
    return isValidCnpj(normalized);
  }

  return false;
}

function isValidCpf(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf)) {
    /* istanbul ignore if */
    return false;
  }

  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const firstDigit = calculateCpfDigit(cpf.slice(0, 9), 10);
  const secondDigit = calculateCpfDigit(cpf.slice(0, 10), 11);

  return cpf[9] === String(firstDigit) && cpf[10] === String(secondDigit);
}

function calculateCpfDigit(base: string, factor: number): number {
  let total = 0;

  for (const digit of base) {
    total += Number(digit) * factor;
    factor -= 1;
  }

  const rest = (total * 10) % 11;

  return rest === 10 ? 0 : rest;
}

function isValidCnpj(cnpj: string): boolean {
  if (!/^\d{14}$/.test(cnpj)) {
    /* istanbul ignore if */
    return false;
  }

  if (/^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  const firstDigit = calculateCnpjDigit(
    cnpj.slice(0, 12),
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  const secondDigit = calculateCnpjDigit(
    cnpj.slice(0, 13),
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  return cnpj[12] === String(firstDigit) && cnpj[13] === String(secondDigit);
}

function calculateCnpjDigit(base: string, factors: number[]): number {
  const total = base
    .split('')
    .reduce((sum, digit, index) => sum + Number(digit) * factors[index], 0);

  const rest = total % 11;

  return rest < 2 ? 0 : 11 - rest;
}
