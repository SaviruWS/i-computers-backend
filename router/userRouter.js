import express from "express"
import { changeUserPassword, createUser, getUser, loginUser, updateUserProfile } from "../controllers/userController.js"

const userRouter = express.Router()

userRouter.post("/",createUser)
userRouter.post("/login" , loginUser)
userRouter.post("/update-password", changeUserPassword)
userRouter.put("/", updateUserProfile)
userRouter.get("/profile",getUser)

export default userRouter