import { Router } from "express";
import {
  createSpaReview,
  getSpaReviewById,
  getSpaReviews,
} from "../controllers/opinions.controller";

const router = Router();

router.route("/").get(getSpaReviews);
router.route("/:id").get(getSpaReviewById);
router.route("/").post(createSpaReview);

export default router;
