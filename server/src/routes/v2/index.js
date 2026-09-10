import { Router } from "express";
import { router as userRoutes } from "./users.routes.js";
import { router as usersSupabaseRoutes } from "./users.supabase.routes.js";

export const routes = Router();

routes.use("/users", userRoutes);
routes.use("/auth", userRoutes);
routes.use("/users", usersSupabaseRoutes);

