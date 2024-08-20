import { Router } from "express";

import {
  getAllAppointments,
  getAppointmentByUser,
} from "../controllers/appointments.controller";

const router = Router();
router.route("/:id").get(getAppointmentByUser);
router.route("/all/:id").get(getAllAppointments);
export default router;
