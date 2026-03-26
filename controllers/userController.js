import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'

dotenv.config()

export function createUser(req, res) {
	const hashedPassword = bcrypt.hashSync(req.body.password, 10);

	const user = new User({
		email: req.body.email,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		password: hashedPassword,
	});
	user
		.save()
		.then(() => {
			res.json({ message: "User created successfully" });
		})
		.catch((error) => {
			res.json({ message: "Error creating user", error: error });
		});
}

export async function createUserAsync(req, res) {
	const hashedPassword = bcrypt.hashSync(req.body.password, 10);

	const user = new User({
		email: req.body.email,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		password: hashedPassword,
	});
	try {
		
		await user.save();
		res.json({ message: "User created successfully" });

	} catch (error) {

		res.json({ message: "Error creating user", error: error });

	}
}

export function loginUser(req, res) {
	User.findOne({
		email: req.body.email,
	})
		.then((user) => {
			if (user == null) {
				res.status(404).json({
					message: "User with given email not found",
				});
			} else {
				const isPasswordValid = bcrypt.compareSync(
					req.body.password,
					user.password
				);

				if (isPasswordValid) {
					//check if attempts are more that 3 times and if so, we do not send this token
					const token = jwt.sign(
						{
							email: user.email,
							firstName: user.firstName,
							lastName: user.lastName,
							role: user.role,
							image: user.image,
							isEmailVerified: user.isEmailVerified,
						},
						process.env.JWT_SECRET,
						{ expiresIn: req.body.rememberme ? "30d" : "48h" }
					);

					res.json({
						message: "Login successfull",
						token: token,
						role: user.role,
					});
				} else {
					res.status(401).json({
						message: "Invalid password",
						//we should add a record in data base of this failed attempt for the specific email
					});
				}
			}
		})
		.catch(() => {
			res.status(500).json({
				message: "Internal server error",
			});
		});
}

export function getUser(req,res){

	if(req.user == null){
		res.status(401).json({
			message: "Unauthorized"
		})
		return
	}

	res.json({
		email: req.user.email,
		firstName: req.user.firstName,
		lastName: req.user.lastName,
		role: req.user.role,
		image: req.user.image,
		isEmailVerified: req.user.isEmailVerified,
	})


}

export async function updateUserProfile(req,res){

	if(req.user == null){
		res.status(401).json({
			message: "Unauthorized"
		})
		return
	}
	try{
		await User.updateOne({ email : req.user.email }, { firstName : req.body.firstName, lastName : req.body.lastName, image : req.body.image })
		const user = await User.findOne({ email : req.user.email })
		const token = jwt.sign(
						{
							email: user.email,
							firstName: user.firstName,
							lastName: user.lastName,
							role: user.role,
							image: user.image,
							isEmailVerified: user.isEmailVerified,
						},
						process.env.JWT_SECRET,
						{ expiresIn: req.body.rememberme ? "30d" : "48h" }
					);
		res.json({ message : "Profile updated successfully", token : token })
	}catch(error){
		res.status(500).json({ message : "Error updating profile", error : error })
	}
}

export async function changeUserPassword(req,res){

	if(req.user == null){
		res.status(401).json({
			message: "Unauthorized"
		})
		return
	}

	try{

		const hashedPassword = bcrypt.hashSync(req.body.password, 10);

		await User.updateOne({ email : req.user.email }, { password : hashedPassword })
		res.json({ message : "Password changed successfully" })

	}catch(error){
		res.status(500).json({ message : "Error changing password", error : error })
	}
}

export function isAdmin(req){
	if(req.user == null){
		return false
	}
	if(req.user.role == "admin"){
		return true
	}else{
		return false
	}
}