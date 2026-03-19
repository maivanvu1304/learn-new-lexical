export interface FocusRingOptions {
  enabled?: boolean;
}

export function focusRingClass(options: FocusRingOptions = {}): string {
  if (options.enabled === false) return "";
  return "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary";
}

export function keyboardActivationKeys(): string[] {
  return ["Enter", " "];
}
