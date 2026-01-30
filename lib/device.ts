/**
 * Device detection and fingerprinting utilities
 */

/**
 * Get device type from user agent
 * Returns either "PC/Desktop" or "Mobile/Tablet"
 */
export const getDeviceType = (): string => {
  if (typeof window === "undefined") {
    return "Unknown";
  }

  const userAgent = navigator.userAgent;

  // Check for mobile/tablet devices
  if (
    /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Opera Mini|IEMobile|WPDesktop/i.test(
      userAgent,
    )
  ) {
    return "Mobile/Tablet";
  } else {
    return "PC/Desktop";
  }
};

/**
 * Generate a random device fingerprint for testing purposes
 * In production, use a proper fingerprinting library like FingerprintJS
 */
export const generateDeviceFingerprint = (): string => {
  // For testing: generate random fingerprint
  // In production, use: import FingerprintJS from '@fingerprintjs/fingerprintjs'

  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);

  return Array.from(randomBytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
};

/**
 * Get complete device information for authentication
 */
export const getDeviceInfo = () => {
  return {
    device_model: getDeviceType(),
    device_fingerprint: generateDeviceFingerprint(),
  };
};

/**
 * Get detailed user agent information (for debugging/logging)
 */
export const getUserAgentInfo = () => {
  if (typeof window === "undefined") {
    return {
      userAgent: "Server-side",
      platform: "Server",
      language: "en",
    };
  }

  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
  };
};
