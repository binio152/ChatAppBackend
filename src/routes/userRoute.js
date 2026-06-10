import { Router } from "express";
import { getProfile } from "../controllers/userController.js";

const route = Router();

route.get("/profile", getProfile);

export default route;
