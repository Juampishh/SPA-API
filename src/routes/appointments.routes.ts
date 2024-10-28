import { Router } from "express";

import {
  completeAppointment,
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
router.route("/complete/:id").put(completeAppointment);
router.route("/:id").get(getAppointmentByUser);
router.route("/all/:id").get(getAllAppointments);

export default router;
