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
      const checkEmailStmt = db.prepare(
        "SELECT email FROM users WHERE email = ?",
      );
      const emailExists = checkEmailStmt.get(email);

      if (emailExists) {
        res.status(400).send({ error: "Email already exists!" });
        return;
      }

      const checkUserStmt = db.prepare(
        "SELECT username FROM users WHERE username = ?",
      );
      const userExists = checkUserStmt.get(username);

      if (userExists) {
        res.status(400).send({ error: "Username already exists!" });
        return;
      }

      const insertStmt = db.prepare(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      );
      insertStmt.run(username, email, hashPassword(password));

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
