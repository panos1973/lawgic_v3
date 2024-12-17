"use server";

import { anthropic } from "@ai-sdk/anthropic";
import { createAnthropicVertex } from 'anthropic-vertex-ai';
import { GoogleAuth } from 'google-auth-library';


export async function getLLMModel(
  modelName: string,
) {
  const useVertex = process.env.USE_VERTEX === "true";
  if (modelName.includes("claude")) {
    console.log("using anthropic with vertex", useVertex);
    if (useVertex) {
      const credential = JSON.parse(
        Buffer.from(process.env.GOOGLE_SERVICE_KEY ?? "", "base64").toString()
      );
      const auth = new GoogleAuth({
        credentials: {
          client_email: credential.client_email,
          client_id: credential.client_id,
          private_key: credential.private_key,
        },
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });

      const anthropicVertex = createAnthropicVertex({
        region: process.env.GOOGLE_VERTEX_REGION!,
        projectId: credential.project_id,
        googleAuth: auth,
      });
      return anthropicVertex(modelName);
    } else {
      return anthropic(modelName.replace("@", "-"));
    }
  }
  return anthropic("claude-3-haiku-20240307");
}