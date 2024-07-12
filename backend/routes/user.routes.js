import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import  {getUserforSidebars} from "../controllers/user.controllers.js";
const router = express.Router();

router.get("/", protectRoute, getUserforSidebars);

export default router;