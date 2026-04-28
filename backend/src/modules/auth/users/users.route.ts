import { Router } from "express";
import { verifyAuthToken } from "../../../api/middlewares/auth.token";
import {
    createUser,
    deleteUser,
    getCurrentUser,
    getUserById,
    listUsers,
    loginUser,
    resetPassword,
    requestRecoveryCode,
    registerUser,
    updateUser,
    verifyRecoveryCode,
} from "./users.controller";

const usersRouter = Router();

usersRouter.post("/login", loginUser);
usersRouter.post("/register", registerUser);
usersRouter.post("/request-recovery-code", requestRecoveryCode);
usersRouter.post("/verify-recovery-code", verifyRecoveryCode);
usersRouter.post("/reset-password", resetPassword);
usersRouter.get("/me", verifyAuthToken, getCurrentUser);

usersRouter.get("/", listUsers);
usersRouter.get("/:id", getUserById);
usersRouter.post("/", createUser);
usersRouter.put("/:id", updateUser);
usersRouter.delete("/:id", deleteUser);

export default usersRouter;
