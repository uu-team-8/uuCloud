import { Router } from "express";

import { register, login, logout } from "./routes/auth";
import { getGateway, editGateway, deleteGateway } from "./routes/gateway";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/gateway", getGateway);
router.post("/gateway/edit", editGateway);
router.post("/gateway/delete/:id", deleteGateway);

export default router;