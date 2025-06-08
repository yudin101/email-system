import { Router } from "express";
import register from "./register";
import login from "./login";
import logout from "./logout";
import send from "./send"
import mails from "./mails"

const router = Router();

router.use(register);
router.use(login);
router.use(logout);
router.use(send);
router.use(mails);

export default router;
