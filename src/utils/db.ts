import { MongoClient, Db } from "mongodb";

let cachedDb: Db | null = null;

export async function getDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGO_URI as string;
  const dbName = process.env.MONGODB_DB || "afrihub";
  const client = new MongoClient(uri, { serverApi: undefined });

  await client.connect();
  cachedDb = client.db(dbName);
  return cachedDb;
}
