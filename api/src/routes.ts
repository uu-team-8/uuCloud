import { Router } from "express";

import { register, login, logout } from "./routes/auth";
import { getGatewayData } from "./routes/gateway";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/gateway", getGatewayData);

export default router;