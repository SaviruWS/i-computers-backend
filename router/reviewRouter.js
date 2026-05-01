import express from "express";
import {
	createReview,
	getReviewsByProduct,
	deleteReview,
	toggleReviewVisibility,
} from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.get("/:productId", getReviewsByProduct);
reviewRouter.post("/:productId", createReview);
reviewRouter.delete("/:reviewId", deleteReview);
reviewRouter.patch("/:reviewId/visibility", toggleReviewVisibility);

export default reviewRouter;