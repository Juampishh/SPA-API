import { Router } from "express";

import {
  createAppointment,
  getAllAppointments,
  getAppointmentByUser,
  getReservationsReport,
} from "../controllers/appointments.controller";

const router = Router();
router.route("/report").post(getReservationsReport);
router.route("/:id").get(getAppointmentByUser);
router.route("/all/:id").get(getAllAppointments);
router.route("/").post(createAppointment);

export default router;
