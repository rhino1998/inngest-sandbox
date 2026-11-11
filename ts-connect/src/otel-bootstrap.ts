// Must load before any code that imports libraries we want OpenTelemetry to
// instrument (express, http, OpenAI/Anthropic/Google clients, etc.) — hence
// the dynamic import below instead of a static one.
import "@inngest/otel/node";

// No top-level await here: tsx's `-r` require-hook runs this file as CJS,
// which doesn't support top-level await. The dynamic import still only
// starts after the synchronous instrumentation setup above has run.
void import("./index");
