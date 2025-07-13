import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getAllUsers, getMessages } from "../controller/user.controller.js";

const router=Router();

router.get("/",protectRoute,getAllUsers)
router.get("/messages/:userid", protectRoute,getMessages);

export default router;