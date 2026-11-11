import { Inngest } from "inngest";

import { extendedTracesMiddleware, metadataMiddleware, scoreMiddleware } from "inngest/experimental";

export const inngest = new Inngest({
  id: "sandbox-ts-express",
  // baseUrl: process.env.INNGEST_BASE_URL || "http://localhost:8090/api",
  env: process.env.INNGEST_ENV,
  middleware: [
    metadataMiddleware(),
    scoreMiddleware(),
    extendedTracesMiddleware(),
  ],
});
