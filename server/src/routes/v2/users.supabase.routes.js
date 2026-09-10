import { Router } from "express";
import { supabase } from "../../config/supabase.js";

export const router = Router();

const PG_SELECT = "id, username, email, role, created_at, updated_at";

// Read users
router.get("/pg", async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("users").select(PG_SELECT);

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// Create user
router.post("/pg", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: "username, email and password are required",
      });
    }

    const { data, error } = await supabase
      .from("users")
      .insert({ username, email, password })
      .select(PG_SELECT)
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// Update user
router.put("/pg/:id", async (req, res, next) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: "User id is required" });
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: "username, email and password are required",
      });
    }

    const { data, error } = await supabase
      .from("users")
      .update({ username, email, password })
      .eq("id", req.params.id)
      .select(PG_SELECT)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// Delete user
router.delete("/pg/:id", async (req, res, next) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: "User id is required" });
    }

    const { data, error } = await supabase
      .from("users")
      .delete()
      .eq("id", req.params.id)
      .select(PG_SELECT)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
