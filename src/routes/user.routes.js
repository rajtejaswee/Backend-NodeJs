import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";


const router = Router()

//using middleware in the route
router.route("/register").post(
    upload.field([
        {
            name: "avatar",
            maxcount: 1
        },
        {
            name: "coverImage",
            maxcount: 1
        }
    ]),
    registerUser)

export default router