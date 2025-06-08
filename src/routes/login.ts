import { Request, Response, Router } from "express";
import { checkSchema, validationResult } from "express-validator";
import passport from "passport";
import { loginValidation } from "../utils/validationSchema";

const router = Router();

router.post(
  "/login",
  checkSchema(loginValidation),
  passport.authenticate("local"),
  (req: Request, res: Response) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      res.status(400).send({ errors: result.array() });
      return;
    }

    res.sendStatus(200);
    return;
  },
);

export default router;
