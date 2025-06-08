import { Request, Response, Router } from "express";
import { checkSchema, matchedData, validationResult } from "express-validator";
import db from "../db";
import { registerValidation } from "../utils/validationSchema";
import { hashPassword } from "../utils/helpers";

const router = Router();

router.post(
  "/register",
  checkSchema(registerValidation),
  (req: Request, res: Response) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      res.status(400).send({ errors: result.array() });
      return;
    }

    const { username, email, password } = matchedData(req);

    try {
      const stmt = db.prepare(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      );
      stmt.run(username, email, hashPassword(password));

      res.sendStatus(201);
      return;
    } catch (err) {
      res.sendStatus(500);
      console.log(err);
      return;
    }
  },
);
export default router;
