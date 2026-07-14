import type { TemplateFile } from '@stackchain/shared';

const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

export type VariableMap = Record<string, string | number | boolean | undefined>;

export function resolveVariables(input: string, variables: VariableMap): string {
  return input.replace(VARIABLE_PATTERN, (_match, key: string) => {
    const value = variables[key];
    if (value === undefined || value === null) {
      throw new Error(`Unresolved template variable: {{${key}}}`);
    }
    return String(value);
  });
}

export function resolveTemplateFile(file: TemplateFile, variables: VariableMap): TemplateFile {
  return {
    ...file,
    path: resolveVariables(file.path, variables),
    content: resolveVariables(file.content, variables),
  };
}

export function collectUnresolvedVariables(input: string): string[] {
  const found = new Set<string>();
  for (const match of input.matchAll(VARIABLE_PATTERN)) {
    const key = match[1];
    if (key) found.add(key);
  }
  return [...found];
}
