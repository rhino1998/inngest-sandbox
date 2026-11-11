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
    const userId = `user_${Math.random().toString(36).substring(2, 10)}`;
    console.log("This runs immediately when the function is invoked");
    await step.sendEvent("send-event", {
      name: 'demo/session-test',
      data: { conversationId, depth: 1 },
      meta: {
        sessions: { conversation_id: conversationId, user_id: userId },
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

// export const cronRateLimitTest = inngest.createFunction(
//   {
//     id: "cron-rate-limit-test",
//     name: "Cron Rate Limit Test",
//     triggers: { cron: "* * * * *" },
//     rateLimit: {
//       limit: 1,
//       period: "2m",
//       key: 'event.id',
//     },
//   },
//   async () => {
//     console.log("This runs on a 1-minute cron, rate limited to once per 2 minutes");
//     return { success: true, ranAt: new Date().toISOString() };
//   }
// )

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
  { model: "claude-haiku-4-5-20251001", provider: "anthropic" },
  { model: "gemini-2.5-pro", provider: "google" },
  { model: "some-unlisted-finetune-v3", provider: "openai" }, // unpriced on purpose
  { model: "llama-3.3-70b", provider: "meta" },
];

// Runs the single-model experiment shared by all ai-metadata-test functions:
// picks one fake model via group.experiment and emits its gen_ai.* span.
const runFakeAICall = async (
  experimentName: string,
  {
    step,
    tracer,
    group,
    score = false,
  }: { step: any; tracer: any; group: any; score?: boolean },
) => {
  const variants = Object.fromEntries(
    FAKE_AI_MODELS.map(({ model, provider }) => [
      model,
      async () => {
        await step.run(`fake-ai-call-${model}`, async () => {
          const inputTokens = 200 + Math.floor(Math.random() * 800);
          const outputTokens = 50 + Math.floor(Math.random() * 400);
          const latencyMs = 300 + Math.floor(Math.random() * 2200);

          await tracer.startActiveSpan(`chat ${model}`, async (span: any) => {
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

          if (score) {
            await inngest.score({ name: "guardrail-pass", value: Math.random() > 0.4 ? 1 : 0 });
            await inngest.score({ name: "bool-2", value: Math.random() > 0.5 ? 1 : 0 });
            await inngest.score({ name: "response-quality", value: Math.random() });
          }
        });

        if (score) {
          await step.score("latency-score", { name: "latency-score", value: Math.random() });
        }
      },
    ]),
  );

  return group.experiment(experimentName, {
    variants,
    select: experiment.weighted(
      Object.fromEntries(FAKE_AI_MODELS.map(({ model }) => [model, 1])),
    ),
  });
};

export const aiMetadataTest = inngest.createFunction(
  {
    id: "ai-metadata-test",
    name: "AI Metadata Test",
    triggers: { event: "ai-metadata-test" },
  },
  async ({ step, tracer, group }) => {
    const { variant } = await runFakeAICall("ai-metadata-model", {
      step,
      tracer,
      group,
      score: true,
    });

    return { success: true, model: variant };
  },
);

export const aiMetadataRagTest = inngest.createFunction(
  {
    id: "ai-metadata-rag-test",
    name: "AI Metadata RAG Test",
    triggers: { event: "ai-metadata-rag-test" },
  },
  async ({ step, tracer, group }) => {
    const { documents } = await step.run("retrieve-documents", async () => {
      await sleep(80 + Math.floor(Math.random() * 220));
      return { documents: 2 + Math.floor(Math.random() * 4) };
    });

    const { variant } = await runFakeAICall("ai-metadata-rag-model", {
      step,
      tracer,
      group,
    });

    await step.run("rerank-and-cache-response", async () => {
      await sleep(20 + Math.floor(Math.random() * 60));
    });

    return { success: true, model: variant, documents };
  },
);

export const aiMetadataModerationTest = inngest.createFunction(
  {
    id: "ai-metadata-moderation-test",
    name: "AI Metadata Moderation Test",
    triggers: { event: "ai-metadata-moderation-test" },
  },
  async ({ step, tracer, group }) => {
    await step.run("moderate-input", async () => {
      await sleep(50 + Math.floor(Math.random() * 100));
      return { flagged: false };
    });

    const { variant } = await runFakeAICall("ai-metadata-moderation-model", {
      step,
      tracer,
      group,
    });

    await step.run("score-response", async () => {
      await inngest.score({ name: "response-quality", value: Math.random() });
    });

    return { success: true, model: variant };
  },
);

export const aiMetadataToolCallTest = inngest.createFunction(
  {
    id: "ai-metadata-tool-call-test",
    name: "AI Metadata Tool Call Test",
    triggers: { event: "ai-metadata-tool-call-test" },
  },
  async ({ step, tracer, group }) => {
    await step.run("parse-user-request", async () => {
      await sleep(30 + Math.floor(Math.random() * 70));
      return { intent: "lookup-order-status" };
    });

    const { variant } = await runFakeAICall("ai-metadata-tool-call-model", {
      step,
      tracer,
      group,
    });

    const { toolResult } = await step.run("execute-tool-call", async () => {
      await sleep(100 + Math.floor(Math.random() * 300));
      return { toolResult: { status: "shipped" } };
    });

    await step.run("format-final-answer", async () => {
      await sleep(20 + Math.floor(Math.random() * 40));
    });

    return { success: true, model: variant, toolResult };
  },
);

export const aiMetadataSummarizationTest = inngest.createFunction(
  {
    id: "ai-metadata-summarization-test",
    name: "AI Metadata Summarization Test",
    triggers: { event: "ai-metadata-summarization-test" },
  },
  async ({ step, tracer, group }) => {
    const { chunks } = await step.run("chunk-document", async () => {
      await sleep(60 + Math.floor(Math.random() * 140));
      return { chunks: 4 + Math.floor(Math.random() * 6) };
    });

    const { variant } = await runFakeAICall("ai-metadata-summarization-model", {
      step,
      tracer,
      group,
    });

    await step.run("update-metadata", async () => {
      await inngest.metadata.update({ key: "summary-model", model: variant });
    });

    await step.run("persist-summary", async () => {
      await sleep(30 + Math.floor(Math.random() * 90));
    });

    return { success: true, model: variant, chunks };
  },
);

// Simulates a multi-turn chat session: each turn is throttled per
// conversation (like sessionTest/sessionTest2) and makes a fake AI model call
// via runFakeAICall so every turn emits gen_ai.* spans tied to the same
// session, letting the dashboard join sessions with AI metadata end-to-end.
export const aiSessionTest = inngest.createFunction(
  {
    id: "ai-session-test",
    name: "AI Session Test",
    triggers: { event: "ai-session-test" },
  },
  async ({ step, tracer, group }) => {
    const conversationId = Math.random().toString(36).substring(2, 15);
    const userId = `user_${Math.random().toString(36).substring(2, 10)}`;
    const maxDepth = Math.floor(Math.random() * 5) + 1; // Random max depth between 1 and 5

    await runFakeAICall("ai-session-kickoff-model", {
      step,
      tracer,
      group,
    });

    await step.sendEvent("send-event", {
      name: "demo/ai-session-turn",
      data: { conversationId, depth: 1, maxDepth: maxDepth },
      meta: {
        sessions: { conversation_id: conversationId, user_id: userId },
      },
    });
  },
);

export const aiSessionTurn = inngest.createFunction(
  {
    id: "ai-session-turn",
    name: "AI Session Turn",
    triggers: { event: "demo/ai-session-turn" },
  },
  async ({ step, tracer, group, event }) => {
    const { variant } = await runFakeAICall("ai-session-model", {
      step,
      tracer,
      group,
    });

    await step.run("update-session-metadata", async () => {
      await inngest.metadata.update({
        key: "ai-session-turn",
        model: variant,
        turn: event.data.depth,
      });
    });

    if (event.data.depth >= event.data.maxDepth) {
      await step.sendEvent("send-session-complete-event", {
        name: "demo/ai-session-complete",
        data: {
          conversationId: event.data.conversationId,
          totalTurns: event.data.depth,
        },
        meta: event.meta,
      });

      return
    }

    await inngest.send({
      name: "demo/ai-session-turn",
      data: { depth: event.data.depth + 1, conversationId: event.data.conversationId, maxDepth: event.data.maxDepth ?? 5 },
      meta: event.meta,
    });
  },
);

export const aiSessionFinalize = inngest.createFunction(
  {
    id: "ai-session-finalize",
    name: "AI Session Finalize",
    triggers: { event: "demo/ai-session-complete" },
  },
  async ({ step, tracer, group, event }) => {
    const { variant } = await runFakeAICall("ai-session-finalize-model", {
      step,
      tracer,
      group,
    });

    await step.run("finalize-session", async () => {
      await sleep(30 + Math.floor(Math.random() * 90));
      await inngest.metadata.update({
        key: "ai-session-turn",
        finalized: true,
        totalTurns: event.data.totalTurns,
        summaryModel: variant,
      });
    });
  },
);

