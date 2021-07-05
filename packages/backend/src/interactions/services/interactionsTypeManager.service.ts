import {
  InteractionBaseDirectionalType,
  InteractionDirection,
  InteractionType,
} from "../../_common/model/interaction";

export const interactionsTypeManager = {
  getDirection,
  getOppositeDirection,
  getOppositeDirectionalType,
  getBaseDirectionalType,
};

function getOppositeDirectionalType({
  type,
  direction: optionalDirection,
}: {
  type: InteractionType;
  direction?: InteractionDirection;
}): InteractionType {
  const direction = optionalDirection ?? getDirection({ type });

  const baseType = getBaseDirectionalType({ type, direction });
  if (baseType) {
    const oppositeDirection = getOppositeDirection(direction);
    if (oppositeDirection) {
      return `${baseType}${oppositeDirection
        .substring(0, 1)
        .toUpperCase()}${oppositeDirection.substring(1)}` as InteractionType;
    }
  }

  return undefined;
}

function getBaseDirectionalType({
  type,
  direction: optionalDirection,
}: {
  type: InteractionType;
  direction?: InteractionDirection;
}): InteractionBaseDirectionalType {
  const len = type.length;

  const direction = optionalDirection ?? getDirection({ type });

  const baseType =
    direction === "in" || direction === "out"
      ? (type.substring(
          0,
          len - direction.length
        ) as InteractionBaseDirectionalType)
      : undefined;

  return baseType;
}

function getDirection({
  type,
}: {
  type: InteractionType;
}): InteractionDirection {
  const len = type.length;

  const interactionOut = type.substring(len - 3) === "Out";
  if (interactionOut) {
    return "out";
  }

  const interactionIn = type.substring(len - 2) === "In";
  if (interactionIn) {
    return "in";
  }
  return "other";
}

function getOppositeDirection(
  direction: InteractionDirection
): InteractionDirection {
  return direction === "out" ? "in" : direction === "in" ? "out" : undefined;
}
