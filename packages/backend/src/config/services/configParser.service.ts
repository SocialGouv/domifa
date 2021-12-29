import {
  DomifaConfigDelayUnit,
  DomifaEnv,
  DomifaEnvKey,
  DOMIFA_CONFIG_DELAY_UNITS,
} from "../model";

export const configParser = {
  parseBoolean,
  parseInteger,
  parseString,
  parseStringArray,
  parseDelay,
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
    deprecatedKey,
  }: {
    required?: boolean;
    validValues?: T[];
    defaultValue?: T;
    deprecatedKey?: DomifaEnvKey;
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

  if (!isStringValueSet(value) && deprecatedKey) {
    // use deprecated key
    value = parseString(envConfig, deprecatedKey, {
      required: false,
    });
    if (value) {
      console.warn(
        `[configParser] "${deprecatedKey}" env variable is deprecated: use "${key}" instead`
      );
    }
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

function parseDelay<T extends string>(
  envConfig: Partial<DomifaEnv>,
  key: DomifaEnvKey,
  {
    required = true,
    defaultValue,
  }: {
    required?: boolean;
    defaultValue?: T;
  } = {
    required: true,
  }
) {
  const value = parseString(envConfig, key, {
    defaultValue,
    required,
  });
  if (value) {
    const chunks = value.split(" ");
    if (chunks.length !== 2) {
      // eslint:disable-next-line: no-console
      console.error(`[configParser] invalid delay value "${key}": "${value}"`);
      throw new Error("Invalid delay value");
    }
    const amount = parseIntegerFromString(chunks[0]);
    const unit = chunks[1] as DomifaConfigDelayUnit;
    if (!DOMIFA_CONFIG_DELAY_UNITS.includes(unit)) {
      // eslint:disable-next-line: no-console
      console.error(
        `[configParser] invalid delay unit "${key}": "${unit}"(allowed: ${DOMIFA_CONFIG_DELAY_UNITS.map(
          (x) => `"${x}"`
        ).join(",")})`
      );
      throw new Error("Invalid delay unit");
    }
    return { amount, unit };
  }
}
function parseIntegerFromString(value: string) {
  if (value !== undefined && value !== null) {
    const num = parseInt(value.trim(), 10);
    if (isNaN(num)) {
      // eslint:disable-next-line: no-console
      console.error(`[configParser] invalid integer "${value}"`);
      throw new Error("Invalid integer");
    }
    return num;
  }
}
