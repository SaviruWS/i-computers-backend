import express from "express"
import { blockOrUnblockUser, changeRole, changeUserPassword, createUser, getAllUsers, getUser, googleLogin, loginUser, sendOTP, updateUserProfile, verifyOTP } from "../controllers/userController.js"

const userRouter = express.Router()

userRouter.post("/",createUser)
userRouter.post("/login" , loginUser)
userRouter.post("/update-password", changeUserPassword)
userRouter.post("/send-otp",sendOTP)
userRouter.post("/verify-otp",verifyOTP)
userRouter.post("/google-login", googleLogin)
userRouter.post("/toggle-block", blockOrUnblockUser)
userRouter.post("/toggle-role", changeRole)
userRouter.put("/", updateUserProfile)
userRouter.get("/profile",getUser)
userRouter.get("/all/:pageSize/:pageNumber", getAllUsers)

export default userRouter