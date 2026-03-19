export interface PortabilityEnvelope {
  formatVersion: string;
  exportedAt: string;
  payload: Record<string, unknown>;
}

export const PORTABILITY_FORMAT_VERSION = "1.0.0";

export function isSupportedPortabilityVersion(version: string): boolean {
  return version === PORTABILITY_FORMAT_VERSION;
}

export function validatePortabilityEnvelope(input: unknown): input is PortabilityEnvelope {
  if (typeof input !== "object" || input === null) return false;
  const parsed = input as Partial<PortabilityEnvelope>;
  return (
    typeof parsed.formatVersion === "string" &&
    typeof parsed.exportedAt === "string" &&
    typeof parsed.payload === "object" &&
    parsed.payload !== null
  );
}
