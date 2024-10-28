import { Router } from "express";

import {
  createAppointment,
  getAllAppointments,
  getAppointmentByUser,
  getIncomeReport,
  getReservationsReport,
  getWeeklyPendingAppointments,
} from "../controllers/appointments.controller";

const router = Router();
router.route("/").post(createAppointment);
router.route("/report").post(getReservationsReport);
router.route("/weekly-pending").get(getWeeklyPendingAppointments);
router.route("/financial-report").post(getIncomeReport);
router.route("/:id").get(getAppointmentByUser);
router.route("/all/:id").get(getAllAppointments);

export default router;
