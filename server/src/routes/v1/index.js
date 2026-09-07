import { Router } from "express";
import { router as userRoutes } from "./users.routes.js";

export const routes = Router();

routes.use("/users", userRoutes);
