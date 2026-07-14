import { describe, expect, it } from 'vitest';
import {
  assertValidPackageIdentifier,
  buildPackageIdentifier,
  isValidPackageIdentifier,
  isValidProjectName,
  toPascalCase,
  toSnakeCase,
} from './identifiers.js';

describe('isValidPackageIdentifier', () => {
  it.each(['com.company.app', 'com.evenlogix.app', 'com.stackchain.product', 'com.company.my_app'])(
    'accepts %s',
    (id) => {
      expect(isValidPackageIdentifier(id)).toBe(true);
    },
  );

  it.each(['Company.App', 'my app', '123.company.app', 'company.app-name', 'com', ''])(
    'rejects %s',
    (id) => {
      expect(isValidPackageIdentifier(id)).toBe(false);
    },
  );
});

describe('buildPackageIdentifier', () => {
  it('builds reverse-DNS package id', () => {
    expect(buildPackageIdentifier('com.company', 'my_app')).toBe('com.company.my_app');
  });

  it('normalizes hyphens in app name', () => {
    expect(buildPackageIdentifier('com.company', 'my-app')).toBe('com.company.my_app');
  });
});

describe('assertValidPackageIdentifier', () => {
  it('throws on invalid', () => {
    expect(() => assertValidPackageIdentifier('Company.App')).toThrow(/Invalid package identifier/);
  });
});

describe('project names', () => {
  it('validates flutter-style names', () => {
    expect(isValidProjectName('banking_app')).toBe(true);
    expect(isValidProjectName('BankingApp')).toBe(false);
  });
});

describe('case helpers', () => {
  it('toPascalCase', () => {
    expect(toPascalCase('login_usecase')).toBe('LoginUsecase');
    expect(toPascalCase('user-api')).toBe('UserApi');
  });

  it('toSnakeCase', () => {
    expect(toSnakeCase('LoginUseCase')).toBe('login_use_case');
  });
});
