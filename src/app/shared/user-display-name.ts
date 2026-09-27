export function firstNameFrom(value: string | null | undefined, fallback: string): string {
  const firstName = value?.trim().split(/\s+/)[0];
  return firstName || fallback;
}

