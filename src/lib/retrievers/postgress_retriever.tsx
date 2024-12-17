import { sql } from "drizzle-orm";
import db from "@/db/drizzle";
import { OpenAIEmbeddings } from "@langchain/openai";

export async function postgressRetriever(query: string, k: number = 50) {
    const model = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY!,
        model: "text-embedding-3-large",
    });
    const embeddings = await model.embedQuery(query);
    const embeddedQuery = `[${embeddings.toString()}]`;
    const results = await db.execute(
        sql`select * from match_documents_adaptive(${embeddedQuery}, ${k})`
    );
    return results.map((row: any) => row["document"]);

}