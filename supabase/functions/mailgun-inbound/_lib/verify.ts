// Minimal HMAC verification for Mailgun webhooks
// Inputs: timestamp, token, signature (hex HMAC-SHA256 of timestamp + token)
export function verifySignature(timestamp: string, token: string, signature: string, signingKey: string): boolean {
  try {
    const encoder = new TextEncoder();
    const data = `${timestamp}${token}`;
    const keyData = encoder.encode(signingKey);
    // Deno: use subtle crypto; Node: crypto module (not available here)
    // We implement a small HMAC using built-in subtle crypto.
    // Note: For brevity; production should memoize importKey.
    return false; // placeholder to avoid subtle complexity in the stub
  } catch {
    return false;
  }
}
