import { Request, Response, Router } from "express";
import { checkSchema, matchedData, validationResult } from "express-validator";
import { sendValidation } from "../utils/validationSchema";
import db from "../db";
import { encrypt } from "../utils/helpers";

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

    const { isReplyTo, receiverEmails, subject, body } = matchedData(req);
    const { id: currentUserId, email: currentUserEmail } = req.user!;

    const failedEmails: { email: string; error: string }[] = [];

    const addFailedEmail = (email: string, error: string) => {
      failedEmails.push({ email, error });
    };

    try {
      for (const receiverEmail of receiverEmails) {
        const encrypted_subject = encrypt(subject);
        const encrypted_body = encrypt(body);

        if (currentUserEmail === receiverEmail) {
          addFailedEmail(receiverEmail, "Cannot mail yourself");
          continue;
        }

        const checkReceiverStmt = db.prepare(
          "SELECT * FROM users WHERE email = ?",
        );
        const receiverInfo = checkReceiverStmt.get(receiverEmail);

        if (!receiverInfo) {
          addFailedEmail(receiverEmail, "Invalid Receiver Email");
          continue;
        }

        const { id: receiverId } = receiverInfo as { id: number };

        // setting the id in mailInfo to null so that it works without having to provide isReplyTo
        let mailInfo: { id: number | null } = { id: null };

        // Checking if the mail which the user is trying to reply to exixts only if the user provided isReplyTo
        // check: mail was sent to current user by the email to which the current user is trying to send the mail
        if (isReplyTo) {
          const checkMailExixtenceStmt = db.prepare(
            "SELECT id FROM mails WHERE id = ? AND receiver_id = ? AND sender_id = ?",
          );
          mailInfo = checkMailExixtenceStmt.get(
            isReplyTo,
            currentUserId,
            receiverId,
          ) as {
            id: number | null;
          };

          if (!mailInfo) {
            addFailedEmail(receiverEmail, "Cannot reply to non exixtent email");
            continue;
          }
        }

        const { id: parentId } = mailInfo; // id will be null if isReplyTo was not provided

        const insertStmt = db.prepare(
          "INSERT INTO mails (is_reply_to, sender_id, receiver_id, subject, body) VALUES (?, ?, ?, ?, ?)",
        );

        insertStmt.run(
          parentId,
          currentUserId,
          receiverId,
          encrypted_subject,
          encrypted_body,
        );
      }

      if (failedEmails.length > 0) {
        console.log(failedEmails);
        res
          .status(202)
          .send({ message: "Completed with errors", errors: failedEmails });
        return;
      }

      res.sendStatus(200);
      return;
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
  },
);

export default router;
