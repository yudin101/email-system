import { Request, Response, Router } from "express";
import { checkSchema, matchedData, validationResult } from "express-validator";
import { sendValidation } from "../utils/validationSchema";
import db from "../db";

const router = Router();
router.post(
  "/send",
  checkSchema(sendValidation),
  (req: Request, res: Response) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      res.status(400).send({ errors: result.array() });
      return;
    }

    const { isReplyTo, receiverEmail, subject, body } = matchedData(req);
    const { id: senderId, email: senderEmail } = req.user!;

    try {
      if (senderEmail === receiverEmail) {
        res.status(400).send({ error: "Cannot mail yourself!" });
        return;
      }

      const checkReceiverStmt = db.prepare(
        "SELECT * FROM users WHERE email = ?",
      );
      const receiverInfo = checkReceiverStmt.get(receiverEmail);

      if (!receiverInfo) {
        res.status(404).send({ error: "Invalid Receiver Email" });
        return;
      }

      // setting the id in mailInfo to null so that it works without having to provide isReplyTo
      let mailInfo: { id: number | null } = { id: null };

      // Checking if the mail which the user is trying to reply to exixts only if the user provided isReplyTo
      // also making sure that parent mail was sent to the currently logged in user
      if (isReplyTo) {
        const checkMailExixtenceStmt = db.prepare(
          "SELECT id FROM mails WHERE id = ? AND receiver_id = ?",
        );
        mailInfo = checkMailExixtenceStmt.get(isReplyTo, senderId) as {
          id: number | null;
        };

        if (!mailInfo) {
          res.status(404).send({ error: "Cannot reply to non existent email" });
          return;
        }
      }

      const { id: receiverId } = receiverInfo as { id: number };
      const { id: parentId } = mailInfo; // id will be null if isReplyTo was not provided

      const insertStmt = db.prepare(
        "INSERT INTO mails (is_reply_to, sender_id, receiver_id, subject, body) VALUES (?, ?, ?, ?, ?)",
      );

      insertStmt.run(parentId, senderId, receiverId, subject, body);

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
