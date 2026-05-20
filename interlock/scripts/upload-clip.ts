import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { setTimeout as sleep } from "node:timers/promises";

(async () => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  console.log("Uploading public/clips/deepfake.mp4 to Gemini Files API...");
  const file = await ai.files.upload({
    file: "public/clips/deepfake.mp4",
    config: {
      mimeType: "video/mp4",
      displayName: "interlock-deepfake-demo-clip",
    },
  });
  console.log("Uploaded. name:", file.name, "uri:", file.uri);
  console.log("Initial state:", file.state);

  // Wait until ACTIVE
  let state = file.state;
  let polls = 0;
  while (state !== "ACTIVE" && polls < 30) {
    await sleep(2000);
    const fresh = await ai.files.get({ name: file.name! });
    state = fresh.state;
    console.log("State:", state);
    polls++;
  }

  if (state !== "ACTIVE") {
    console.error("File never reached ACTIVE state. Aborting.");
    process.exit(1);
  }

  console.log("");
  console.log("=====================================================");
  console.log("Ready. Add this to .env.local and Vercel env:");
  console.log(`FORENSICS_FILE_URI=${file.uri}`);
  console.log("=====================================================");
})();
