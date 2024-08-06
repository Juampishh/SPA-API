import { Request, Response } from "express";
import { User } from "../interfaces/User";
import { getConnection } from "../database";
export async function getUsers(req: Request, res: Response): Promise<Response> {
  const conn = await getConnection();
  const users = await conn.query("SELECT * FROM users");
  return res.json(users[0]);
}

export async function createUser(req: Request, res: Response) {
  const newUser: User = req.body;
  const conn = await getConnection();
  await conn.query("INSERT INTO users SET ?", [newUser]);
  return res.json({
    message: "Usuario Creado",
    code: 201,
  });
}

export async function getUser(req: Request, res: Response): Promise<Response> {
  const id = req.params.userId;
  const conn = await getConnection();
  const users = await conn.query("SELECT * FROM users WHERE id = ?", [id]);
  return res.json(users[0]);
}

export async function updateUser(
  req: Request,
  res: Response
): Promise<Response> {
  const id = req.params.userId;
  const updateUser: User = req.body;
  const conn = await getConnection();
  await conn.query("UPDATE users SET ? WHERE id = ?", [updateUser, id]);
  return res.json({
    message: "Usuario Actualizado",
    code: 200,
  });
}

export async function deleteUser(
  req: Request,
  res: Response
): Promise<Response> {
  const id = req.params.userId;
  const conn = await getConnection();
  await conn.query("DELETE FROM users WHERE id = ?", [id]);
  return res.json({
    message: "Usuario Eliminado",
    code: 200,
  });
}
