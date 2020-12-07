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
  console.log("parseString key", key);
  console.log("parseString envConfig", envConfig);
  let value = envConfig[key] as T;
  if (!value || value.trim().length === 0) {
    value = defaultValue;
  }

  if (!value && required) {
    // tslint:disable-next-line: no-console
    console.error(`[configParser] missing required env value "${key}"`);
    throw new Error("Missing required env value");
  }

  if (value && validValues && !validValues.includes(value)) {
    // tslint:disable-next-line: no-console
    console.error(
      `[configParser] invalid env value "${key}": "${value}" (allowed: ${validValues
        .map((x) => `"${x}"`)
        .join(",")})`
    );
    throw new Error("Invalid env value");
  }
  return value;
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
      // tslint:disable-next-line: no-console
      console.error(`[configParser] invalid delay value "${key}": "${value}"`);
      throw new Error("Invalid delay value");
    }
    const amount = parseIntegerFromString(chunks[0]);
    const unit = chunks[1] as DomifaConfigDelayUnit;
    if (!DOMIFA_CONFIG_DELAY_UNITS.includes(unit)) {
      // tslint:disable-next-line: no-console
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
      // tslint:disable-next-line: no-console
      console.error(`[configParser] invalid integer "${value}"`);
      throw new Error("Invalid integer");
    }
    return num;
  }
}
