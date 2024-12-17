import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// for query purposes
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);
export default db;
