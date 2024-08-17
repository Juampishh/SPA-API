import { Router } from "express";
import { getService } from "../controllers/services.controller";
const router = Router();
router.route("/").get(getService);
export default router;
