import { Router } from "express";

import { getAppointmentByUser } from "../controllers/appointments.controller";

const router = Router();
router.route("/:id").get(getAppointmentByUser);
export default router;
