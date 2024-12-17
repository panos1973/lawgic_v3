import { NextRequest, NextResponse } from "next/server";
import {Client} from "langsmith"

export async function POST(req: NextRequest) {
  try {
    const { runId, feedback, feedback_key } = await req.json();

    if (!runId || !feedback) {
      return NextResponse.json(
        { error: "Missing runId or feedback" },
        { status: 400 }
      );
    }

    const client = new Client()
    let score;
    if (feedback === "up") {
      score = 1;
    } else if (feedback === "down") {
      score = -1;
    } else if (feedback === "none") {
      score = 0;
    } else {
      // Handle unexpected feedback values
      console.error("Unexpected feedback value:", feedback);
      score = 0; // Default to 0 for unexpected values
    }
    await client.createFeedback(runId, feedback_key, {
      score: score,
      comment: feedback,
    });

    return NextResponse.json({ message: "Feedback logged successfully" });
  } catch (error) {
    console.error("Error logging feedback:", error);
    return NextResponse.json(
      { error: "Failed to log feedback" },
      { status: 500 }
    );
  }
}