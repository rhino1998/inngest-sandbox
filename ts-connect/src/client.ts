import { Inngest } from "inngest";
import { extendedTracesMiddleware, metadataMiddleware } from "inngest/experimental";

export const inngest = new Inngest({
  id: "sandbox-ts-connect",
  baseUrl: "http://localhost:8190",
  isDev: false,
  middleware: [metadataMiddleware(), extendedTracesMiddleware()],
});
