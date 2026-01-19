import { Inngest } from "inngest";
import { extendedTracesMiddleware, metadataMiddleware } from "inngest/experimental";

export const inngest = new Inngest({
  id: "sandbox-ts-connect",
  baseUrl: "https://api.inngest.net",
  isDev: false,
  middleware: [metadataMiddleware(), extendedTracesMiddleware()],
});
