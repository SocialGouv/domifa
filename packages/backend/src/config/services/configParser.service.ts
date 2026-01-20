import { DomifaEnv, DomifaEnvKey } from "../model";

export const configParser = {
  parseBoolean,
  parseInteger,
  parseString,
  parseStringArray,
};

function parseBoolean(
  envConfig: Partial<DomifaEnv>,
  key: DomifaEnvKey,
  {
    required = true,
    defaultValue,
  }: {
    required?: boolean;
    defaultValue?: boolean;
  } = {
    required: true,
  }
): boolean {
  const value = parseString(envConfig, key, {
    required,
    defaultValue:
      defaultValue === true || defaultValue === false
        ? `${defaultValue}`
        : undefined,
  });
  return !!value && value.trim() === "true";
}

function parseInteger(
  envConfig: Partial<DomifaEnv>,
  key: DomifaEnvKey,
  {
    required = true,
    defaultValue,
  }: {
    required?: boolean;
    defaultValue?: number;
  } = {
    required: true,
  }
): number {
  const value = parseString(envConfig, key, {
    required,
    defaultValue:
      defaultValue !== null && defaultValue !== undefined
        ? `${defaultValue}`
        : undefined,
  });
  if (value !== undefined) {
    return parseIntegerFromString(value);
  }
  return undefined;
}
function parseStringArray(
  envConfig: Partial<DomifaEnv>,
  key: DomifaEnvKey,
  {
    required = true,
    defaultValue,
  }: {
    required?: boolean;
    defaultValue?: string[];
  } = {
    required: true,
  }
): string[] {
  const value = parseString(envConfig, key, {
    required,
    defaultValue:
      defaultValue !== null && defaultValue !== undefined
        ? `${defaultValue}`
        : undefined,
  });
  if (value !== undefined) {
    return value
      .split(",")
      .map((x) => x.trim())
      .filter((x) => x.length);
  }
  return [];
}

function parseString<T extends string>(
  envConfig: Partial<DomifaEnv>,
  key: DomifaEnvKey,
  {
    required = true,
    validValues,
    defaultValue,
  }: {
    required?: boolean;
    validValues?: T[];
    defaultValue?: T;
  } = {
    required: true,
  }
) {
  let value = envConfig[key] as T;

  if (value && !value.trim) {
    // eslint:disable-next-line: no-console
    console.error(
      `[configParser] unexpected value type "${value}" for ${key}"`
    );
    throw new Error(`Unexpected value type "${value}" for ${key}`);
  }

  if (!isStringValueSet(value)) {
    value = defaultValue;
  }

  if (!value && required) {
    // eslint:disable-next-line: no-console
    console.error(`[configParser] missing required env value "${key}"`);
    throw new Error(`Missing required env value ${key}`);
  }

  if (isStringValueSet(value) && validValues && !validValues.includes(value)) {
    // eslint:disable-next-line: no-console
    console.error(
      `[configParser] invalid env value "${key}": "${value}" (allowed: ${validValues
        .map((x) => `"${x}"`)
        .join(",")})`
    );
    throw new Error("Invalid env value");
  }
  return value;
}

function isStringValueSet(value: string): boolean {
  return !!value && value.trim && value.trim().length !== 0;
}

function parseIntegerFromString(value: string): number | undefined {
  if (value !== undefined && value !== null) {
    const num = parseInt(value.trim(), 10);
    if (isNaN(num)) {
      // eslint:disable-next-line: no-console
      console.error(`[configParser] invalid integer "${value}"`);
      throw new Error("Invalid integer");
    }
    return num;
  }
  return undefined;
}
