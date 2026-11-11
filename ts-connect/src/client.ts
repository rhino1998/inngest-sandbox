import { Inngest } from "inngest";
import { extendedTracesMiddleware, metadataMiddleware, scoreMiddleware } from "inngest/experimental";

export const inngest = new Inngest({
  id: "sandbox-ts-connect",
  env: process.env.INNGEST_ENV,
  middleware: [
    metadataMiddleware(),
    scoreMiddleware(),
    extendedTracesMiddleware(),
  ],
});
