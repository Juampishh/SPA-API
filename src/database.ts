import { createPool } from "mysql2/promise";
import "dotenv/config";

async function connect() {
  try {
    const connection = await createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      database: process.env.DB_NAME || "data_base_spa",
      password: process.env.DB_PASS || "",
    });

    return connection;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
}

export async function getConnection() {
  return await connect();
}
