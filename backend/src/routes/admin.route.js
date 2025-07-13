import { Router } from "express";
import { createSong , deleteSong, createAlbum , deleteAlbum , checkAdmin} from "../controller/admin.controller.js";
import { protectRoute, requireAdmin} from "../middleware/auth.middleware.js";

const router = Router();

// Check admin status - only requires authentication, not admin privileges
router.get("/check", protectRoute, checkAdmin);

// All other routes require admin privileges
router.use(protectRoute, requireAdmin);

router.post("/songs", createSong);
router.delete("/songs/:id", deleteSong);

router.post("/albums", createAlbum);
router.delete("/albums/:id", deleteAlbum);

export default router;