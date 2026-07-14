/** Reverse-DNS style package identifiers used for Android applicationId and iOS bundle ID. */

const PACKAGE_ID_PATTERN = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;

export interface PackageIdentifierParts {
  organization: string;
  application: string;
  packageId: string;
}

export function isValidPackageSegment(segment: string): boolean {
  return /^[a-z][a-z0-9_]*$/.test(segment);
}

/**
 * Validates a full reverse-DNS package identifier.
 * Allowed: com.company.app, com.bank.mobile
 * Rejected: Company.App, my app, 123.company.app, company.app-name
 */
export function isValidPackageIdentifier(identifier: string): boolean {
  if (!identifier || identifier.length > 255) {
    return false;
  }
  if (identifier.includes('-') || identifier.includes(' ')) {
    return false;
  }
  if (!PACKAGE_ID_PATTERN.test(identifier)) {
    return false;
  }
  const segments = identifier.split('.');
  if (segments.length < 2) {
    return false;
  }
  return segments.every(isValidPackageSegment);
}

export function assertValidPackageIdentifier(identifier: string): void {
  if (!isValidPackageIdentifier(identifier)) {
    throw new Error(
      `Invalid package identifier "${identifier}". ` +
        `Use reverse-DNS format with lowercase letters, digits, and underscores only ` +
        `(e.g. com.company.my_app).`,
    );
  }
}

export function buildPackageIdentifier(organization: string, application: string): string {
  const org = organization.trim();
  const app = application.trim().replace(/-/g, '_').toLowerCase();

  if (!isValidPackageIdentifier(org) && !org.split('.').every(isValidPackageSegment)) {
    throw new Error(`Invalid organization identifier "${organization}". Expected e.g. com.company`);
  }

  if (!isValidPackageSegment(app) && !/^[a-z][a-z0-9_]*$/.test(app)) {
    throw new Error(
      `Invalid application identifier "${application}". Use lowercase letters, digits, underscores.`,
    );
  }

  // org may be "com.company" — validate as prefix (at least 2 segments preferred)
  const orgSegments = org.split('.');
  if (orgSegments.length < 2 || !orgSegments.every(isValidPackageSegment)) {
    throw new Error(
      `Invalid organization identifier "${organization}". Expected reverse-DNS e.g. com.company`,
    );
  }

  const packageId = `${org}.${app}`;
  assertValidPackageIdentifier(packageId);
  return packageId;
}

export function parsePackageIdentifier(packageId: string): PackageIdentifierParts {
  assertValidPackageIdentifier(packageId);
  const segments = packageId.split('.');
  const application = segments[segments.length - 1]!;
  const organization = segments.slice(0, -1).join('.');
  return { organization, application, packageId };
}

/** Flutter/Dart project names: lowercase, underscores, start with letter. */
export function isValidProjectName(name: string): boolean {
  return /^[a-z][a-z0-9_]*$/.test(name);
}

/** npm / web project names: lowercase, hyphens or underscores. */
export function isValidNpmProjectName(name: string): boolean {
  return /^[a-z][a-z0-9_-]*$/.test(name);
}

export function assertValidProjectName(name: string, style: 'dart' | 'npm' = 'dart'): void {
  if (style === 'npm') {
    if (!isValidNpmProjectName(name)) {
      throw new Error(
        `Invalid project name "${name}". Use lowercase letters, digits, hyphens, or underscores; must start with a letter.`,
      );
    }
    return;
  }
  if (!isValidProjectName(name)) {
    throw new Error(
      `Invalid project name "${name}". Use lowercase letters, digits, and underscores; must start with a letter.`,
    );
  }
}

/** Convert snake_case / kebab to PascalCase for Dart types. */
export function toPascalCase(value: string): string {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^(.)/, (_, c: string) => c.toUpperCase())
    .replace(/\s/g, '');
}

/** Convert to snake_case. */
export function toSnakeCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}

/** Convert to camelCase. */
export function toCamelCase(value: string): string {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
