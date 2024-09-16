import { createPool, Pool } from "mysql2/promise";
import "dotenv/config";

let pool: Pool | undefined;

async function connect(): Promise<Pool> {
  if (!pool) {
    try {
      pool = await createPool({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        database: process.env.DB_NAME || "data_base_spa",
        password: process.env.DB_PASS || "",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
    } catch (error) {
      console.error("Error connecting to the database:", error);
      throw error;
    }
  }
  return pool;
}

export async function getConnection(): Promise<Pool> {
  return await connect();
}
