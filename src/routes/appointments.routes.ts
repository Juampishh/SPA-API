import { Router } from "express";

import {
  createAppointment,
  getAllAppointments,
  getAppointmentByUser,
  getReservationsReport,
} from "../controllers/appointments.controller";

const router = Router();
router.route("/").post(createAppointment);
router.route("/report").post(getReservationsReport);
router.route("/:id").get(getAppointmentByUser);
router.route("/all/:id").get(getAllAppointments);

export default router;
