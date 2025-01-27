import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import  {getUserforSidebars, getUserProfilePic, getUserPopupData} from "../controllers/user.controllers.js";
const router = express.Router();

router.get("/", protectRoute, getUserforSidebars);
router.get('/:userId/profile-pic', getUserProfilePic);
router.get('/:userId/popup-data', getUserPopupData);
export default router;