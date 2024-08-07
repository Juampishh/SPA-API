import { Request, Response, NextFunction } from "express";
import { getConnection } from "../database";
import { Login } from "../interfaces/Login";
import { Register } from "../interfaces/Register";

export async function login(req: Request, res: Response): Promise<Response> {
  const data: Login = req.body;
  const conn = await getConnection();
  const [row]: any = await conn.query(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [data.username, data.password]
  );
  if (row.length === 0) {
    return res.status(400).json({
      message: "Usuario o contraseña incorrectos",
      code: 400,
    });
  }

  return res.json({
    message: "Usuario encontrado",
    data: row[0],
  });
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> {
  const data: Register = req.body;
  if (data.type === undefined) {
    data.type = "client";
  }

  try {
    const conn = await getConnection();
    // Verifica si el usuario ya existe
    const [rows]: any[] = await conn.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [data.username, [data.email]]
    );

    if (rows.length > 0) {
      return res.status(400).json({
        message: "Usuario ya existe",
        code: 400,
      });
    }

    // Inserta el nuevo usuario
    await conn.query("INSERT INTO users SET ?", [data]);
    return res.status(201).json({
      message: "Usuario creado",
      code: 201,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error al crear usuario",
      code: 500,
    });
  }
}
