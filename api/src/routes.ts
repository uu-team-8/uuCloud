import { Router } from "express";

import { register, login, logout } from "./routes/auth";
import { getTemperature } from "./routes/temperature";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/temperature", getTemperature);

export default router;