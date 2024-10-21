import { Request, Response } from "express";
import { User } from "../interfaces/User";
import { getConnection } from "../database";
import { handleApiResponse } from "../helpers/HandleApiResponse";
import { ApiResponse } from "../interfaces/ApiResponse";
// Obtener todos los usuarios
export async function getUsers(
  req: Request,
  res: Response
): Promise<Response<ApiResponse>> {
  try {
    const conn = await getConnection();
    const [users]: any = await conn.query("SELECT * FROM users");
    return handleApiResponse(
      res,
      users.length > 0 ? 200 : 204,
      users.length > 0 ? "Usuarios encontrados" : "No hay usuarios",
      users.length > 0 ? users : undefined
    );
  } catch (err) {
    return handleApiResponse(res, 500, "Error al buscar usuarios");
  }
}

// Crear un nuevo usuario
export async function createUser(
  req: Request,
  res: Response
): Promise<Response<ApiResponse>> {
  try {
    const newUser: User = req.body;
    console.log(newUser);

    const conn = await getConnection();
    const [user]: any = await conn.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [newUser.username, newUser.email]
    );
    if (user.length > 0) {
      return handleApiResponse(res, 400, "El usuario ya existe");
    }
    await conn.query("INSERT INTO users SET ?", [newUser]);
    return handleApiResponse(res, 201, "Usuario Creado", newUser);
  } catch (err) {
    console.log(err);

    return handleApiResponse(res, 500, "Error al crear usuario");
  }
}

// Obtener un usuario por ID
export async function getUser(
  req: Request,
  res: Response
): Promise<Response<ApiResponse>> {
  try {
    const id = req.params.userId;
    const conn = await getConnection();
    const [users]: any = await conn.query("SELECT * FROM users WHERE id = ?", [
      id,
    ]);
    return handleApiResponse(
      res,
      users.length > 0 ? 200 : 404,
      users.length > 0 ? "Usuario encontrado" : "El usuario no existe",
      users.length > 0 ? users : undefined
    );
  } catch (err) {
    return handleApiResponse(res, 500, "Error al buscar usuario");
  }
}

// Actualizar un usuario
export async function updateUser(
  req: Request,
  res: Response
): Promise<Response<ApiResponse>> {
  try {
    const id = req.params.userId;
    const updateUser: User = req.body;
    const conn = await getConnection();
    const [user]: any = await conn.query("SELECT * FROM users WHERE id = ?", [
      id,
    ]);
    if (user.length === 0) {
      return handleApiResponse(res, 400, "El usuario no existe");
    }
    await conn.query("UPDATE users SET ? WHERE id = ?", [updateUser, id]);
    return handleApiResponse(res, 200, "Usuario Actualizado");
  } catch (err) {
    return handleApiResponse(res, 500, "Error al actualizar usuario");
  }
}

// Eliminar un usuario
export async function deleteUser(
  req: Request,
  res: Response
): Promise<Response<ApiResponse>> {
  try {
    const id = req.params.userId;
    const conn = await getConnection();
    const [user]: any = await conn.query("SELECT * FROM users WHERE id = ?", [
      id,
    ]);
    if (user.length === 0) {
      return handleApiResponse(res, 400, "El usuario no existe");
    }
    await conn.query("DELETE FROM users WHERE id = ?", [id]);
    return handleApiResponse(res, 200, "Usuario Eliminado");
  } catch (err) {
    return handleApiResponse(res, 500, "Error al eliminar usuario");
  }
}

// Obtener todos los usuarios de tipo "client"
export async function getClientUsers(
  req: Request,
  res: Response
): Promise<Response<ApiResponse>> {
  try {
    const conn = await getConnection();
    const [clients]: any = await conn.query(
      "SELECT * FROM users WHERE type = 'client'"
    );
    return handleApiResponse(
      res,
      clients.length > 0 ? 200 : 204,
      clients.length > 0 ? "Clientes encontrados" : "No hay clientes",
      clients.length > 0 ? clients : undefined
    );
  } catch (err) {
    return handleApiResponse(res, 500, "Error al buscar clientes");
  }
}
