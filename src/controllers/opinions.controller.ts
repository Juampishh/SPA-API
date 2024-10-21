import { Request, Response } from "express";
import { getConnection } from "../database";
import { handleApiResponse } from "../helpers/HandleApiResponse";
import { ApiResponse } from "../interfaces/ApiResponse";
import { ResultSetHeader, RowDataPacket } from "mysql2";

// Obtener todas las reseñas del spa
export async function getSpaReviews(
  req: Request,
  res: Response
): Promise<Response<ApiResponse>> {
  try {
    const conn = await getConnection();
    const [reviews]: [RowDataPacket[], any] = await conn.query(
      "SELECT * FROM spa_reviews"
    );
    return handleApiResponse(
      res,
      reviews.length > 0 ? 200 : 204,
      reviews.length > 0 ? "Reseñas encontradas" : "No hay reseñas",
      reviews.length > 0 ? reviews : undefined
    );
  } catch (err) {
    console.log(err);
    return handleApiResponse(res, 500, "Error al buscar reseñas");
  }
}

// Obtener una reseña por ID
export async function getSpaReviewById(
  req: Request,
  res: Response
): Promise<Response<ApiResponse>> {
  try {
    const conn = await getConnection();
    const [review]: [RowDataPacket[], any] = await conn.query(
      "SELECT * FROM spa_reviews WHERE id = ?",
      [req.params.id]
    );
    return handleApiResponse(
      res,
      review.length > 0 ? 200 : 404,
      review.length > 0 ? "Reseña encontrada" : "Reseña no encontrada",
      review.length > 0 ? review[0] : undefined
    );
  } catch (err) {
    return handleApiResponse(res, 500, "Error al buscar la reseña");
  }
}

// Crear una nueva reseña
export async function createSpaReview(
  req: Request,
  res: Response
): Promise<Response<ApiResponse>> {
  try {
    const { name = "anónimo", opinion, rating } = req.body;
    if (!opinion || !rating) {
      return handleApiResponse(res, 400, "Faltan datos requeridos");
    }

    const conn = await getConnection();
    const [result]: [ResultSetHeader, any] = await conn.query(
      "INSERT INTO spa_reviews (name, opinion, rating) VALUES (?, ?, ?)",
      [name, opinion, rating]
    );

    return handleApiResponse(res, 201, "Reseña creada con éxito", {
      id: result.insertId,
      name,
      opinion,
      rating,
    });
  } catch (err) {
    return handleApiResponse(res, 500, "Error al crear la reseña");
  }
}

// Actualizar una reseña existente
export async function updateSpaReview(
  req: Request,
  res: Response
): Promise<Response<ApiResponse>> {
  try {
    const { name = "anónimo", opinion, rating } = req.body;
    const { id } = req.params;

    if (!opinion || !rating) {
      return handleApiResponse(res, 400, "Faltan datos requeridos");
    }

    const conn = await getConnection();
    const [result]: [ResultSetHeader, any] = await conn.query(
      "UPDATE spa_reviews SET name = ?, opinion = ?, rating = ? WHERE id = ?",
      [name, opinion, rating, id]
    );

    return handleApiResponse(
      res,
      result.affectedRows > 0 ? 200 : 404,
      result.affectedRows > 0 ? "Reseña actualizada" : "Reseña no encontrada"
    );
  } catch (err) {
    return handleApiResponse(res, 500, "Error al actualizar la reseña");
  }
}

// Eliminar una reseña
export async function deleteSpaReview(
  req: Request,
  res: Response
): Promise<Response<ApiResponse>> {
  try {
    const { id } = req.params;

    const conn = await getConnection();
    const [result]: [ResultSetHeader, any] = await conn.query(
      "DELETE FROM spa_reviews WHERE id = ?",
      [id]
    );

    return handleApiResponse(
      res,
      result.affectedRows > 0 ? 200 : 404,
      result.affectedRows > 0 ? "Reseña eliminada" : "Reseña no encontrada"
    );
  } catch (err) {
    return handleApiResponse(res, 500, "Error al eliminar la reseña");
  }
}
