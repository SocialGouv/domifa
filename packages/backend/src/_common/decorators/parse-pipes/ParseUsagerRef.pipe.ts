import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from "@nestjs/common";
import { parseStrictInt } from "./ParseStrictInt.pipe";

export const USAGER_REF_MAX = 100_000;

export function parseUsagerRef(value: unknown): number | null {
  return parseStrictInt(value, { min: 1, max: USAGER_REF_MAX });
}

// Custom decorator, not a pipe: see ParseStrictInt.pipe
export const UsagerRefParam = createParamDecorator(
  (_data: unknown, context: ExecutionContext): number => {
    const ref = parseUsagerRef(
      context.switchToHttp().getRequest().params?.usagerRef
    );
    if (ref === null) {
      throw new BadRequestException("USAGER_REF_INVALID");
    }
    return ref;
  }
);
