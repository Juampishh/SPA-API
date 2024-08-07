import { createPool } from "mysql2/promise";

async function connect() {
  const connection = await createPool({
    host: "localhost",
    user: "root",
    database: "data_base_spa",
    password: "juampishh",
    connectionLimit: 10,
  });
  return connection;
}
export async function getConnection() {
  return await connect();
}
