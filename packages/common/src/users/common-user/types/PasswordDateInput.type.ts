// Same shape everywhere it's used: the raw DB value (possibly serialized as
// a string over HTTP) or absent for accounts that never recorded a change.
export type PasswordDateInput = Date | string | null | undefined;
