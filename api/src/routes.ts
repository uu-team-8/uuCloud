import { Router } from "express";

import { register } from "./routes/auth";

const router = Router();

router.post("/register", register);

export default router;