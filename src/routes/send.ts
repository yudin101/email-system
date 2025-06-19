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

    const failedEmails: { email: string; statusCode: number; error: string }[] =
      [];

    const addFailedEmail = (
      email: string,
      statusCode: number,
      error: string,
    ) => {
      failedEmails.push({ email, statusCode, error });
    };

    try {
      for (const receiverEmail of receiverEmails) {
        const encrypted_subject = encrypt(subject);
        const encrypted_body = encrypt(body);

        if (currentUserEmail === receiverEmail) {
          addFailedEmail(receiverEmail, 400, "Cannot mail yourself");
          continue;
        }

        const checkReceiverStmt = db.prepare(
          "SELECT * FROM users WHERE email = ?",
        );
        const receiverInfo = checkReceiverStmt.get(receiverEmail);

        if (!receiverInfo) {
          addFailedEmail(receiverEmail, 404, "Receiver Email Not Found");
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
            addFailedEmail(
              receiverEmail,
              404,
              "Cannot reply to non exixtent email",
            );
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

      // check for errors
      if (failedEmails.length > 0) {
        console.error(failedEmails);

        if (failedEmails.length === receiverEmails.length) {

          // if only one error, show the whole response as an error
          if (failedEmails.length === 1) {
            const { statusCode, error } = failedEmails[0];
            res.status(statusCode).send({ error: error });
            return;
          }

          res
            .status(400)
            .send({ message: "No emails sent!", errors: failedEmails });
          return;
        }

        // multiple errors will show competed with errors
        res
          .status(202)
          .send({ message: "Completed with errors", errors: failedEmails });
        return;
      }

      res.sendStatus(200);
      return;
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }
  },
);

export default router;
