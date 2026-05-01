import Review from "../models/review.js";
import { isAdmin } from "./userController.js";
import { v4 as uuidv4 } from "uuid";

export async function createReview(req, res) {
	if (!req.user) {
		res.status(401).json({ message: "You must be logged in to leave a review." });
		return;
	}

	try {
		const { productId } = req.params;

		// One review per user per product (using email as identifier)
		const existing = await Review.findOne({
			productId: productId,
			userEmail: req.user.email,
		});

		if (existing) {
			res.status(400).json({ message: "You have already reviewed this product." });
			return;
		}

		if (!req.body.comment) {
			res.status(400).json({ message: "Review comment is required." });
			return;
		}

		if (!req.body.rating || req.body.rating < 1 || req.body.rating > 5) {
			res.status(400).json({ message: "Rating must be between 1 and 5." });
			return;
		}

		const data = {};
		data.reviewId = uuidv4();
		data.productId = productId;
		data.userEmail = req.user.email;
		// JWT has firstName + lastName
		data.userName = `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() || req.user.email;
		data.rating = req.body.rating;
		data.title = req.body.title || "";
		data.comment = req.body.comment;
		data.isVisible = true;

		const newReview = new Review(data);
		await newReview.save();

		res.status(201).json({ message: "Review submitted successfully.", review: newReview });
	} catch (error) {
		res.status(500).json({ message: "Error submitting review.", error: error });
	}
}

export async function getReviewsByProduct(req, res) {
	try {
		const { productId } = req.params;

		let reviews;
		if (isAdmin(req)) {
			reviews = await Review.find({ productId: productId }).sort({ createdAt: -1 });
		} else {
			reviews = await Review.find({ productId: productId, isVisible: true }).sort({ createdAt: -1 });
		}

		const avgRating =
			reviews.length > 0
				? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
				: 0;

		res.status(200).json({
			reviews,
			avgRating: Math.round(avgRating * 10) / 10,
			total: reviews.length,
		});
	} catch (error) {
		res.status(500).json({ message: "Error fetching reviews.", error: error });
	}
}

export async function deleteReview(req, res) {
	try {
		const { reviewId } = req.params;
		const review = await Review.findOne({ reviewId: reviewId });

		if (!review) {
			res.status(404).json({ message: "Review not found." });
			return;
		}

		// Only admin or the review author (matched by email) can delete
		if (!isAdmin(req) && req.user?.email !== review.userEmail) {
			res.status(403).json({ message: "Access denied." });
			return;
		}

		await Review.deleteOne({ reviewId: reviewId });
		res.status(200).json({ message: "Review deleted successfully." });
	} catch (error) {
		res.status(500).json({ message: "Error deleting review.", error: error });
	}
}

export async function toggleReviewVisibility(req, res) {
	if (!isAdmin(req)) {
		res.status(403).json({ message: "Access denied. Admins only." });
		return;
	}

	try {
		const { reviewId } = req.params;
		const review = await Review.findOne({ reviewId: reviewId });

		if (!review) {
			res.status(404).json({ message: "Review not found." });
			return;
		}

		await Review.updateOne({ reviewId: reviewId }, { isVisible: !review.isVisible });
		res.status(200).json({ message: "Review visibility updated." });
	} catch (error) {
		res.status(500).json({ message: "Error updating review.", error: error });
	}
}
