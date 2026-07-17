import { inngest } from "./client";

export const metadataExampleOne = inngest.createFunction(
  { id: "metadata-inside-step-context-target-undefined" },
  { event: "metadata/inside/undefined-target" },
  async ({ event, step }) => {
    const result = await step.run("example-step", async () => {
      await inngest.metadata.update({ key: "metadata/inside/undefined-target" });
      await inngest.metadata.run().update({ key: "metadata/inside/undefined-target" });
      await inngest.metadata.attempt().update({ key: "metadata/inside/undefined-target" });
      await inngest.metadata.step().update({ key: "metadata/inside/undefined-target" });

      await (await fetch("https://example.com")).text();
      await (await fetch("https://example.com")).text();


      let parts: any[][] = []
      for (let i = 0; i < 10; i++) {
        parts.push([`key-${i}`, i]);
      }

      await inngest.metadata.update(Object.fromEntries(parts), 'large-payload-test');

      return { success: true, ...Object.fromEntries(parts) };
    });

    return result;
  },
);

export const metadataExampleThree = inngest.createFunction(
  { id: "metadata-inside-step-context-target-defined" },
  { event: "metadata/inside/defined-target" },
  async ({ event, step }) => {
    const result = await step.run("example-step", async () => {
      await inngest.metadata.run("01KEAHYZBREEMCTAAGCXGD0A8V").update({ key: `inside/defined-target/timestamp-${Date.now()}` });

      return { success: true };
    });

    await step.sleep('sleep-for-a-bit', "15s");

    return result;
  },
);
