import { Response } from "express";
import { ApiResponse } from "../interfaces/ApiResponse";
// Función genérica para manejar las respuestas de la API
export function handleApiResponse(
  res: Response,
  statusCode: number,
  message: string,
  data?: any
): Response<ApiResponse> {
  const response: ApiResponse = { message, code: statusCode };
  if (data) response.data = data;
  return res.status(statusCode).json(response);
}
