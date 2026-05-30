import { NextResponse } from "next/server";
import { v1beta } from "@google-cloud/discoveryengine";

function makeSearchClient() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    return new v1beta.ConversationalSearchServiceClient({ credentials });
  }
  return new v1beta.ConversationalSearchServiceClient();
}

const client = makeSearchClient();

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    const projectId = process.env.GCP_PROJECT_ID;
    const location = process.env.GCP_LOCATION || "global";
    const engineId = process.env.GCP_ENGINE_ID;

    if (!projectId || !engineId) {
      return NextResponse.json(
        { error: "Missing GCP_PROJECT_ID or GCP_ENGINE_ID environment variables" },
        { status: 500 }
      );
    }

    const servingConfig = `projects/${projectId}/locations/${location}/collections/default_collection/engines/${engineId}/servingConfigs/default_search`;

    const apiRequest: any = {
      servingConfig,
      query: { text: message },
      queryExpansionSpec: { condition: "AUTO" },
      spellCorrectionSpec: { mode: "AUTO" },
      languageCode: "he",
    };

    const [response] = await client.answerQuery(apiRequest);

    return NextResponse.json({
      answer: response.answer?.answerText || "לא נמצאה תשובה.",
      citations: response.answer?.citations || [],
    });
  } catch (error: any) {
    console.error("Agent Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to fetch response" },
      { status: 500 }
    );
  }
}
