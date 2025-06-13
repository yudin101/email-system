import { Router } from "express";
import { checkLogin } from "../utils/middlewares";
import register from "./register";
import login from "./login";
import logout from "./logout";
import send from "./send"
import mails from "./mails"

const router = Router();

router.use(register);
router.use(login);
router.use(checkLogin, logout);
router.use(checkLogin, send);
router.use(checkLogin, mails);

export default router;
