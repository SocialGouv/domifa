import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from "@nestjs/common";

export type StrictIntBounds = { min?: number; max?: number };

// Digits only, no sign, no leading zero, no exponent / hex / decimal: one writing per number
const STRICT_INT_FORMAT = /^(0|[1-9]\d{0,14})$/;

export function parseStrictInt(
  value: unknown,
  { min = 0, max = Number.MAX_SAFE_INTEGER }: StrictIntBounds = {}
): number | null {
  if (typeof value !== "string" || !STRICT_INT_FORMAT.test(value)) {
    return null;
  }
  const num = Number(value);
  return num >= min && num <= max ? num : null;
}

// Custom decorator, not a pipe: the global ValidationPipe would convert the raw param ("1e3", "0x10") first
export const IntParam = createParamDecorator(
  (
    { name, ...bounds }: StrictIntBounds & { name: string },
    context: ExecutionContext
  ): number => {
    const num = parseStrictInt(
      context.switchToHttp().getRequest().params?.[name],
      bounds
    );
    if (num === null) {
      throw new BadRequestException(`${name.toUpperCase()}_INVALID`);
    }
    return num;
  }
);
