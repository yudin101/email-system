import { Request, Response, Router } from "express";
import db from "../db";
import { decrypt } from "../utils/helpers";
import { Mail } from "../types/mail";

const router = Router();

const handleMails = (req: Request, res: Response, senderReceiver: string) => {
  const { id: receiverId } = req.user!;

  try {
    const stmt = db.prepare(`
      SELECT 
        mails.id,
        mails.is_reply_to AS isReplyTo,
        sender.email AS senderEmail,
        receiver.email AS receiverEmail,
        mails.subject, 
        mails.body, 
        mails.time 
        ${senderReceiver == "receiver" ? ", mails.read" : ""}
      FROM mails
      JOIN users AS sender ON mails.sender_id = sender.id
      JOIN users AS receiver ON mails.receiver_id = receiver.id
      WHERE mails.${senderReceiver}_id = ?
      AND mails.${senderReceiver}_deleted = 0
    `);

    const mails = stmt.all(receiverId) as Mail[];

    const decryptedMails = mails.map((mail: Mail) => {
      try {
        const decryptedSubject = decrypt(mail.subject);
        const decryptedBody = decrypt(mail.body);

        return {
          ...mail,
          subject: decryptedSubject,
          body: decryptedBody,
        } as Mail;
      } catch (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
    });

    res.status(200).send(decryptedMails);
    return;
  } catch (err) {
    res.sendStatus(500);
    console.error(err);
    return;
  }
};

router.get("/received", (req: Request, res: Response) => {
  handleMails(req, res, "receiver");
});

router.get("/sent", (req: Request, res: Response) => {
  handleMails(req, res, "sender");
});

router.get("/mail/:id", (req: Request, res: Response) => {
  const { id: mailId } = req.params;
  const { id: userId } = req.user!;

  try {
    const userIsReceiver = db
      .prepare("SELECT receiver_id FROM mails WHERE id = ?")
      .get(mailId) as { receiver_id: number } | undefined;

    const stmt = db.prepare(`
      SELECT 
        mails.id,
        mails.is_reply_to AS isReplyTo,
        sender.email AS senderEmail,
        receiver.email AS receiverEmail,
        mails.subject, 
        mails.body, 
        mails.time 
        ${userIsReceiver?.receiver_id === userId ? ", mails.read" : ""}
      FROM mails
      JOIN users AS sender ON mails.sender_id = sender.id
      JOIN users AS receiver ON mails.receiver_id = receiver.id
      WHERE mails.id = ? 
      AND (
        (
          receiver_id = ? 
          AND receiver_deleted = 0
        ) 
      OR (
          sender_id = ? 
          AND sender_deleted = 0
        )
      )
    `);
    const requestedMail = stmt.get(mailId, userId, userId) as Mail | undefined;

    if (!requestedMail) {
      res.sendStatus(404);
      return;
    }

    const decryptedSubject = decrypt(requestedMail.subject);
    const decryptedBody = decrypt(requestedMail.body);

    const decryptedRequestedMail = {
      ...requestedMail,
      subject: decryptedSubject,
      body: decryptedBody,
    };

    db.prepare("UPDATE mails SET read = 1 WHERE id = ?").run(mailId);

    res.status(200).send(decryptedRequestedMail);
    return;
  } catch (err) {
    res.sendStatus(500);
    console.error(err);
    return;
  }
});

export default router;
