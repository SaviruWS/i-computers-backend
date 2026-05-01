import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
	{
		reviewId: {
			type: String,
			required: true,
			unique: true,
		},
		productId: {
			type: String,
			required: true,
		},
		userEmail: {
			// email used as unique user identifier (matches JWT payload)
			type: String,
			required: true,
		},
		userName: {
			type: String,
			required: true,
		},
		rating: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
		title: {
			type: String,
			default: "",
		},
		comment: {
			type: String,
			required: true,
		},
		isVisible: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
