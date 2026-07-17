import { inngest } from "./client";
import { experiment, NonRetriableError } from "inngest";

const sleep = (duration = 1) => { return new Promise(resolve => setTimeout(resolve, duration))}

export const waitForEvent = inngest.createFunction(
  {
    id: "wait-for-event",
    triggers: { event: "some-event" },
  },
  async ({step, tracer}) => {
    console.log("This runs immediately when the function is invoked");
    await step.metadata("md").update({ key: "initial-value", 'number': 5 });
    await step.run("before-wait", async () => {
      await inngest.metadata.run().update({ key: "before-wait-run-value" });
      await inngest.metadata.update({ key: "before-wait-value" });
      await inngest.metadata.update({ key: "before-wait-value", 'number': 5 });
      await inngest.metadata.update({ key: "before-wait-value", 'complex': { nested: 'value' } });
      await inngest.metadata.update({ key: "before-wait-value", 'complex2': { nested: 'value', withOther: 5 } });
      console.log("This runs before waiting for the event");
      await tracer.startActiveSpan("before-wait-span", async (span) => {
        span.setAttribute("before-wait-attribute", "value");
        span.end();
      });
      await (await fetch("http://example.com")).text();
    });


    await step.run("step-2", async () => {
      // await sleep(1000);
      await inngest.metadata.update({ key: "before-wait-value", 'number': 5.5 });
      await inngest.metadata.update({ key: "before-wait-value", 'complex2': { nested: 'value', withOther: 'str', more: {deep: true} } });
      await inngest.metadata.update({ key: "before-wait-value", 'array': [1, 2, 3] });
      await tracer.startActiveSpan("step-2", async (span) => {
        span.setAttribute("step-2", "value");
      await tracer.startActiveSpan("nested", async (span) => {
        span.setAttribute("step-2", "value");
        span.end();
      });
        span.end();
      });
    })

    // const waiter = step.waitForEvent("wait-for-event", { event: "some-event", timeout: "30s" });

    await step.sendEvent("some-event", { name: "some-event", data: { hello: "world" } });

    // await waiter;
    return { success: true };
});

export const scoreTest = inngest.createFunction(
  {
    id: "score-test",
    name: "Score Test",
    triggers: { event: "score-test" },
  },
  async ({ step, event, group }) => {
    console.log("This runs immediately when the function is invoked");

    await group.experiment("score-test-experiment", {
      variants: {
        variantA: async () => {
          await step.run("variantA-step", async () => {
            await inngest.score({ name: "guardrail-pass", value: Math.random() > 0.4 ? 1 : 0 });
            await inngest.score({ name: "float-value", value: Math.random() });
          });
          await step.score("score3", { name: "score3", value: Math.random() });
        },
        variantB: async () => {
          await step.run("variantB-step", async () => {
            await inngest.score({ name: "guardrail-pass", value: Math.random() > 0.4 ? 1 : 0 });
            await inngest.score({ name: "float-value", value: Math.random()/10 + 0.7});
          });
          await step.score("score3", { name: "score3", value: Math.random() });
        },
        variantC: async () => {
          await step.run("variantC-step", async () => {
            await inngest.score({ name: "guardrail-pass", value: Math.random() > 0.4 ? 1 : 0 });
            await inngest.score({ name: "float-value", value: Math.random()/10 + 0.7});
          });
          await step.score("score3", { name: "score3", value: Math.random() });
        },
        variantD: async () => {
          await step.run("variantD-step", async () => {
            await inngest.score({ name: "guardrail-pass", value: Math.random() > 0.4 ? 1 : 0 });
            await inngest.score({ name: "float-value", value: Math.random()/10 + 0.7});
          });
          await step.score("score3", { name: "score3", value: Math.random() });
        },
        variantE: async () => {
          await step.run("variantE-step", async () => {
            await inngest.score({ name: "guardrail-pass", value: Math.random() > 0.4 ? 1 : 0 });
            await inngest.score({ name: "float-value", value: Math.random()/10 + 0.7});
          });
          await step.score("score3", { name: "score3", value: Math.random() });
        },
        variantF: async () => {
          await step.run("variantF-step", async () => {
            await inngest.score({ name: "guardrail-pass", value: Math.random() > 0.4 ? 1 : 0 });
            await inngest.score({ name: "float-value", value: Math.random()/10 + 0.7});
          });
          await step.score("score3", { name: "score3", value: Math.random() });
        },
        variantG: async () => {
          await step.run("variantG-step", async () => {
            await inngest.score({ name: "guardrail-pass", value: Math.random() > 0.4 ? 1 : 0 });
            await inngest.score({ name: "float-value", value: Math.random()/10 + 0.7});
          });
          await step.score("score3", { name: "score3", value: Math.random() });
        },
        "really long variant name with spaces": async () => {
          await step.run("variantG-step", async () => {
            await inngest.score({ name: "guardrail-pass", value: Math.random() > 0.4 ? 1 : 0 });
            await inngest.score({ name: "float-value", value: Math.random()/10 + 0.7});
          });
          await step.score("score3", { name: "score3", value: Math.random() });
        },
      },
      select: experiment.weighted({
        variantA: 1,
        variantB: 1,
        variantC: 1,
        variantD: 1,
        variantE: 1,
        variantF: 1,
        variantG: 1,
        "really long variant name with spaces": 1,
      }),
    });
  }
)


export const sessionTest = inngest.createFunction(
  {
    id: "session-test",
    name: "Session Test",
    triggers: { event: "session-test" },
  },
  async ({ step }) => {

    const conversationId = Math.random().toString(36).substring(2, 15);
    console.log("This runs immediately when the function is invoked");
    await step.sendEvent("send-event", {
      name: 'demo/session-test',
      data: { conversationId, depth: 1 },
      meta: {
        sessions: { conversation_id: conversationId },
      },
    });
  }
)

export const sessionTest2 = inngest.createFunction(
  {
    id: "session-test-2",
    name: "Session Test 2",
    triggers: { event: "demo/session-test" },
    throttle: {
      key: "event.meta.sessions.conversation_id",
      period: "1m",
      limit: 1
    },
  },
  async ({ event }) => {
    console.log("This runs immediately when the function is invoked");
    if (event.data.depth >= 5) {
      throw new NonRetriableError("Depth limit reached");
    }
    await inngest.send({
      name: 'demo/session-test',
      data: { depth: event.data.depth+1, conversationId: event.data.conversationId },
      meta: event.meta,
    });
  }
)

// Emits fake gen_ai.* OTel spans so the backend's AI metadata extractor
// (extractAIMetadataFromAttributes) picks them up — no real model call, just
// enough attributes to populate AIMetadata for testing the AI Overview
// dashboard end-to-end. LatencyMs is computed server-side from the span's
// actual start/end time, so we sleep for the fake latency before span.end();
// EstimatedCost is derived server-side from model + token counts, so some
// models are deliberately left out of realistic naming to exercise the
// "unpriced" path.
const FAKE_AI_MODELS = [
  { model: "gpt-4o", provider: "openai" },
  { model: "gpt-4o-mini", provider: "openai" },
  { model: "claude-3-5-sonnet-20241022", provider: "anthropic" },
  { model: "gemini-2.5-pro", provider: "google" },
  { model: "some-unlisted-finetune-v3", provider: "openai" }, // unpriced on purpose
];

export const aiMetadataTest = inngest.createFunction(
  {
    id: "ai-metadata-test",
    name: "AI Metadata Test",
    triggers: { event: "ai-metadata-test" },
  },
  async ({ step, tracer, event }) => {
    const callCount = event.data?.callCount ?? 8;

    for (let i = 0; i < callCount; i++) {
      const { model, provider } = FAKE_AI_MODELS[i % FAKE_AI_MODELS.length];

      await step.run(`fake-ai-call-${i}`, async () => {
        const inputTokens = 200 + Math.floor(Math.random() * 800);
        const outputTokens = 50 + Math.floor(Math.random() * 400);
        const latencyMs = 300 + Math.floor(Math.random() * 2200);

        await tracer.startActiveSpan(`chat ${model}`, async (span) => {
          span.setAttribute("gen_ai.operation.name", "chat");
          span.setAttribute("gen_ai.provider.name", provider);
          span.setAttribute("gen_ai.request.model", model);
          span.setAttribute("gen_ai.response.model", model);
          span.setAttribute("gen_ai.usage.input_tokens", inputTokens);
          span.setAttribute("gen_ai.usage.output_tokens", outputTokens);
          span.setAttribute(
            "gen_ai.usage.total_tokens",
            inputTokens + outputTokens,
          );
          span.setAttribute("gen_ai.response.finish_reasons", ["stop"]);

          await sleep(latencyMs);
          span.end();
        });
      });
    }

    return { success: true, calls: callCount };
  },
);

