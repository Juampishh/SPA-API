import { Request, Response } from "express";
import { getConnection } from "../database";
import { Login } from "../interfaces/Login";
import { Register } from "../interfaces/Register";
import { handleApiResponse } from "../helpers/HandleApiResponse"; // Asegúrate de ajustar la ruta según la ubicación real del archivo

export async function login(req: Request, res: Response): Promise<Response> {
  try {
    const data: Login = req.body;
    const conn = await getConnection();
    const [row]: any = await conn.query(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [data.username, data.password]
    );
    if (row.length === 0) {
      return handleApiResponse(res, 400, "Usuario o contraseña incorrectos");
    }

    return handleApiResponse(res, 200, "Usuario encontrado", row[0]);
  } catch (err) {
    return handleApiResponse(res, 500, "Error al buscar usuario");
  }
}

export async function register(req: Request, res: Response): Promise<Response> {
  const data: Register = req.body;
  if (data.type === undefined) {
    data.type = "client";
  }

  try {
    const conn = await getConnection();
    // Verifica si el usuario ya existe
    const [rows]: any[] = await conn.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [data.username, data.email]
    );

    if (rows.length > 0) {
      return handleApiResponse(res, 400, "El usuario ya existe");
    }

    // Inserta el nuevo usuario
    await conn.query("INSERT INTO users SET ?", [data]);
    return handleApiResponse(res, 201, "Usuario creado");
  } catch (err) {
    return handleApiResponse(res, 500, "Error al crear usuario");
  }
}
