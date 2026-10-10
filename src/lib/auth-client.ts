import { createAuthClient } from "better-auth/react";

/** Browser-side Better Auth client. Uses the current origin by default. */
export const authClient = createAuthClient();
