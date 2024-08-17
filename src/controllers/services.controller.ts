import { Request, Response } from "express";
import { getConnection } from "../database";
import { handleApiResponse } from "../helpers/HandleApiResponse";

export const getService = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const conn = await getConnection();
    const category = req.query.category as string;
    let query = "SELECT * FROM spa_services";
    const params: any[] = [];
    if (category) {
      if (category === "all") {
        const [rows] = await conn.query(query);
        return handleApiResponse(res, 200, "Lista de servicios", rows);
      }
      query += " WHERE category = ?";
      params.push(category);
    }

    const [rows] = await conn.query(query, params);
    return handleApiResponse(res, 200, "Lista de servicios", rows);
  } catch (err) {
    return handleApiResponse(res, 500, "Error al obtener servicios");
  }
};
