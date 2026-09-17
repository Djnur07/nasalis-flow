import { UserRejectedRequestError } from "viem";

/** Maps wallet connection failures to short, user-facing copy. */
export function getWalletErrorMessage(error: unknown): string {
  if (error instanceof UserRejectedRequestError) {
    return "Connection request was declined.";
  }

  const message = error instanceof Error ? error.message : "";

  if (/no.*provider|not.*found|not.*detected|not.*installed/i.test(message)) {
    return "No wallet extension detected. Install MetaMask or another browser wallet to connect.";
  }

  return "Could not connect wallet. Please try again.";
}
