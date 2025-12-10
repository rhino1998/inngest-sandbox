import { Inngest } from "inngest";

import { extendedTracesMiddleware, metadataMiddleware } from "inngest/experimental";

export const inngest = new Inngest({
  id: "sandbox-ts-express",
  middleware: [metadataMiddleware(), extendedTracesMiddleware()],
});
