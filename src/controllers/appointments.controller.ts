import { Request, Response } from "express";
import { getConnection } from "../database";
import { handleApiResponse } from "../helpers/HandleApiResponse";

export const getAppointmentByUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const conn = await getConnection();
    const user_id = req.params.id as string;
    if (!user_id) return handleApiResponse(res, 400, "Falta el id del usuario");
    if (user_id) {
      const [user]: any = await conn.query("SELECT * FROM users WHERE id = ?", [
        user_id,
      ]);
      if (user.length === 0) {
        return handleApiResponse(res, 404, "El usuario no existe");
      }
    }
    const query = "SELECT * FROM appointments WHERE user_id = ?";
    const [rows]: any = await conn.query(query, [user_id]);

    for (const appointment of rows) {
      const [service]: any = await conn.query(
        "SELECT * FROM spa_services WHERE id = ?",
        [appointment.service_id]
      );
      appointment.service = service[0];
    }

    return handleApiResponse(res, 200, "Lista de citas", rows);
  } catch (err) {
    console.error(err);
    return handleApiResponse(res, 500, "Error al obtener citas");
  }
};
