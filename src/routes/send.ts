import { Request, Response, Router } from "express";
import { checkSchema, matchedData, validationResult } from "express-validator";
import { sendValidation } from "../utils/validationSchema";
import db from "../db";

const router = Router();
router.post(
  "/send",
  checkSchema(sendValidation),
  (req: Request, res: Response) => {
    if (!req.user) {
      res.sendStatus(401);
      return;
    }

    const result = validationResult(req);

    if (!result.isEmpty()) {
      res.status(400).send({ errors: result.array() });
      return;
    }

    const { receiverEmail, subject, body } = matchedData(req);
    const { id: senderId } = req.user;

    try {
      const checkStmt = db.prepare("SELECT * FROM users WHERE email = ?");
      const receiverInfo = checkStmt.get(receiverEmail);

      if (!receiverInfo) {
        res.status(404).send({ error: "Invalid Receiver Email" });
        return;
      }

      const { id: receiverId } = receiverInfo as { id: number };

      const insertStmt = db.prepare(
        "INSERT INTO mails (sender_id, receiver_id, subject, body) VALUES (?, ?, ?, ?)",
      );

      insertStmt.run(senderId, receiverId, subject, body);

      res.sendStatus(200);
      return;
    } catch (err) {
      res.sendStatus(500);
      console.log(err);
      return;
    }
  },
);

export default router;
