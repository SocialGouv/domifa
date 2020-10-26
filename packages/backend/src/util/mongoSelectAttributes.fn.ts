export function mongoSelectAttributes<T>(...attributes: (keyof T)[]): string {
  return attributes.join(" ");
}
