import {
  getDocumentType,
  isValidCpfOrCnpj,
  normalizeDocument,
} from './document.validator';

describe('document.validator', () => {
  describe('normalizeDocument', () => {
    it('should remove non-numeric characters from CPF', () => {
      expect(normalizeDocument('529.982.247-25')).toBe('52998224725');
    });

    it('should remove non-numeric characters from CNPJ', () => {
      expect(normalizeDocument('11.222.333/0001-81')).toBe('11222333000181');
    });

    it('should return only numbers when document is already normalized', () => {
      expect(normalizeDocument('52998224725')).toBe('52998224725');
    });
  });

  describe('getDocumentType', () => {
    it('should return CPF when document has 11 digits', () => {
      expect(getDocumentType('52998224725')).toBe('CPF');
    });

    it('should return CNPJ when document has 14 digits', () => {
      expect(getDocumentType('11222333000181')).toBe('CNPJ');
    });

    it('should return null when document length is invalid', () => {
      expect(getDocumentType('123')).toBeNull();
    });
  });

  describe('isValidCpfOrCnpj', () => {
    it('should return true for a valid CPF without punctuation', () => {
      expect(isValidCpfOrCnpj('52998224725')).toBe(true);
    });

    it('should return true for a valid CPF with punctuation', () => {
      expect(isValidCpfOrCnpj('529.982.247-25')).toBe(true);
    });

    it('should return false for an invalid CPF', () => {
      expect(isValidCpfOrCnpj('12345678900')).toBe(false);
    });

    it('should return false for CPF with repeated digits', () => {
      expect(isValidCpfOrCnpj('11111111111')).toBe(false);
    });

    it('should return true for a valid CNPJ without punctuation', () => {
      expect(isValidCpfOrCnpj('11222333000181')).toBe(true);
    });

    it('should return true for a valid CNPJ with punctuation', () => {
      expect(isValidCpfOrCnpj('11.222.333/0001-81')).toBe(true);
    });

    it('should return false for an invalid CNPJ', () => {
      expect(isValidCpfOrCnpj('11222333000180')).toBe(false);
    });

    it('should return false for CNPJ with repeated digits', () => {
      expect(isValidCpfOrCnpj('00000000000000')).toBe(false);
    });

    it('should return false for document with invalid length', () => {
      expect(isValidCpfOrCnpj('123')).toBe(false);
    });
  });

  describe('document.validator additional branches', () => {
    it('should return null when document type is neither CPF nor CNPJ', () => {
      expect(getDocumentType('123')).toBeNull();
      expect(getDocumentType('123456789012')).toBeNull();
    });

    it('should return false for documents that are neither CPF nor CNPJ length', () => {
      expect(isValidCpfOrCnpj('123')).toBe(false);
      expect(isValidCpfOrCnpj('123456789012')).toBe(false);
    });

    it('should return false for CPF with invalid check digits', () => {
      expect(isValidCpfOrCnpj('52998224724')).toBe(false);
    });

    it('should return false for CNPJ with invalid check digits', () => {
      expect(isValidCpfOrCnpj('11222333000180')).toBe(false);
    });

    it('should normalize document by removing non-numeric characters', () => {
      expect(normalizeDocument('529.982.247-25')).toBe('52998224725');
      expect(normalizeDocument('11.222.333/0001-81')).toBe('11222333000181');
    });
  });

  it('should reject CPF with all repeated digits', () => {
    expect(isValidCpfOrCnpj('00000000000')).toBe(false);
    expect(isValidCpfOrCnpj('11111111111')).toBe(false);
  });

  it('should reject CNPJ with all repeated digits', () => {
    expect(isValidCpfOrCnpj('00000000000000')).toBe(false);
    expect(isValidCpfOrCnpj('11111111111111')).toBe(false);
  });

  it('should reject CPF with repeated digits', () => {
    expect(isValidCpfOrCnpj('00000000000')).toBe(false);
    expect(isValidCpfOrCnpj('11111111111')).toBe(false);
  });

  it('should reject CNPJ with repeated digits', () => {
    expect(isValidCpfOrCnpj('00000000000000')).toBe(false);
    expect(isValidCpfOrCnpj('11111111111111')).toBe(false);
  });

  it('should reject non-numeric CPF with invalid normalized length', () => {
    expect(isValidCpfOrCnpj('abc.def.ghi-jk')).toBe(false);
  });

  it('should reject non-numeric CNPJ with invalid normalized length', () => {
    expect(isValidCpfOrCnpj('ab.cde.fgh/ijkl-mn')).toBe(false);
  });
});
