import "dotenv/config";
import { generate } from "../lib/gemini";

(async () => {
  try {
    const r = await generate({
      prompt: "Reply with the single word ONLINE and nothing else.",
    });
    console.log("Model used:", r.modelUsed);
    console.log("Text:", r.text.trim());
    if (r.attempts.length > 0) {
      console.log("Retries along the way:", r.attempts);
    }
  } catch (e) {
    console.error("Smoke test failed:", e);
    process.exit(1);
  }
})();
