import { NextResponse } from "next/server";
import { v1beta } from "@google-cloud/discoveryengine";

// Initialize client outside the handler for better performance
const client = new v1beta.ConversationalSearchServiceClient();

export async function POST(request: Request) {
  try {
    const { message, planId, planNumber, sessionId } = await request.json();

    const projectId = process.env.NEXT_PUBLIC_GCP_PROJECT_ID;
    const location = process.env.NEXT_PUBLIC_GCP_LOCATION || "global";
    const dataStoreId = process.env.NEXT_PUBLIC_DATA_STORE_ID;

    console.log("=== Vertex AI Search Request ===");
    console.log("Original Message:", message);
    console.log("Plan ID (Folder):", planId);
    console.log("Plan Number:", planNumber);

    if (!projectId || !dataStoreId) {
      return NextResponse.json(
        { error: "Missing configuration environment variables" },
        { status: 500 },
      );
    }

    const servingConfig = `projects/${projectId}/locations/${location}/collections/default_collection/engines/${dataStoreId}/servingConfigs/default_serving_config`;

    // Strict prompt modification to force focus on the specific plan number
    const enhancedMessage = `התמקד אך ורק במסמכים הקשורים לתכנית מספר ${planNumber}. 
אל תשתמש במידע מתכניות אחרות שאינן תכנית ${planNumber}. אם המידע לא נמצא במסמכי התכנית הזו, ציין זאת במפורש.
השאלה שלי היא: ${message}`;

    // Update filter to use plan_number (assuming this is the field name in your schema)
    const filter = `plan_number: ANY("${planNumber}")`;

    console.log("Enhanced Message:", enhancedMessage);
    console.log("Filter String:", filter);

    const apiRequest: any = {
      servingConfig,
      query: { text: enhancedMessage },
      searchConfig: {
        filter: filter,
      },
    };

    if (sessionId) {
      apiRequest.session = `projects/${projectId}/locations/${location}/collections/default_collection/engines/${dataStoreId}/sessions/${sessionId}`;
    }

    const [response] = await client.answerQuery(apiRequest);

    console.log("=== Vertex AI Search Response ===");
    console.log("Answer Length:", response.answer?.answerText?.length || 0);
    
    if (response.answer?.citations) {
      console.log("Citations count:", response.answer.citations.length);
      response.answer.citations.forEach((c: any, i: number) => {
        // Log source info to verify filtering
        console.log(`Citation ${i + 1} Source:`, c.sourceText || c.documentMetadata?.uri);
      });
    }
    console.log("==================================");

    return NextResponse.json({
      answer: response.answer?.answerText || "לא נמצאה תשובה במקורות המידע.",
      citations: response.answer?.citations || [],
      session: response.session,
    });
  } catch (error: any) {
    console.error("!!! Vertex AI Search Error !!!");
    console.error("Error Message:", error.message);
    console.error("Full Error JSON:", JSON.stringify(error, null, 2));

    return NextResponse.json(
      { error: error.message || "Failed to fetch response from AI" },
      { status: 500 },
    );
  }
}
