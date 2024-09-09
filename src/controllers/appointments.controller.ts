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
export const getAllAppointments = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const conn = await getConnection();
    const user_id = req.params.id as string;
    if (!user_id) return handleApiResponse(res, 400, "Falta el id del usuario");

    // Verifica la existencia del usuario
    const [user]: any = await conn.query("SELECT * FROM users WHERE id = ?", [
      user_id,
    ]);
    if (user.length === 0) {
      return handleApiResponse(res, 404, "El usuario no existe");
    }

    // Consulta optimizada con JOIN
    const query = `
      SELECT a.*, s.*
      FROM appointments a
      LEFT JOIN spa_services s ON a.service_id = s.id
    `;
    const [rows]: any = await conn.query(query);

    // Formatea los datos para incluir el servicio en cada cita
    const appointments = rows.map((row: any) => ({
      ...row,
    }));

    return handleApiResponse(res, 200, "Lista de citas", appointments);
  } catch (err) {
    console.error(err);
    return handleApiResponse(res, 500, "Error al obtener citas");
  }
};
export const createAppointment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const conn = await getConnection();
    const { user_id, service_id, appointment_date } = req.body;
    console.log(req.body);

    if (!user_id || !service_id || !appointment_date) {
      return handleApiResponse(res, 400, "Faltan datos");
    }
    const [user]: any = await conn.query("SELECT * FROM users WHERE id = ?", [
      user_id,
    ]);
    if (user.length === 0) {
      return handleApiResponse(res, 404, "El usuario no existe");
    }
    const [service]: any = await conn.query(
      "SELECT * FROM spa_services WHERE id = ?",
      [service_id]
    );
    if (service.length === 0) {
      return handleApiResponse(res, 404, "El servicio no existe");
    }
    const query =
      "INSERT INTO appointments (user_id, service_id, appointment_date,status) VALUES (?, ?, ?, 'pending')";
    await conn.query(query, [user_id, service_id, appointment_date]);
    return handleApiResponse(res, 201, "Cita creada");
  } catch (err) {
    console.error(err);
    return handleApiResponse(res, 500, "Error al crear cita");
  }
};
