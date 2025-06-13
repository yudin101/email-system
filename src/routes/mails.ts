import { Request, Response, Router } from "express";
import db from "../db";

const router = Router();

const handleMails = (req: Request, res: Response, senderReceiverId: string) => {
  const { id: receiverId } = req.user!;

  try {
    const stmt = db.prepare(`
      SELECT 
        mails.id,
        mails.is_reply_to,
        sender.email AS senderEmail,
        receiver.email AS receiverEmail,
        mails.subject, 
        mails.body, 
        mails.time 
      FROM mails
      JOIN users AS sender ON mails.sender_id = sender.id
      JOIN users AS receiver ON mails.receiver_id = receiver.id
      WHERE mails.${senderReceiverId} = ?
    `);

    const mails = stmt.all(receiverId);

    res.status(200).send(mails);
    return;
  } catch (err) {
    res.sendStatus(500);
    console.log(err);
    return;
  }
};

router.get("/received", (req: Request, res: Response) => {
  handleMails(req, res, "receiver_id");
});

router.get("/sent", (req: Request, res: Response) => {
  handleMails(req, res, "sender_id");
});

router.get("/mail/:id", (req: Request, res: Response) => {
  const { id: mailId } = req.params;
  const { id: userId } = req.user!;

  try {
    const stmt = db.prepare(`
      SELECT 
        mails.id,
        mails.is_reply_to,
        sender.email AS senderEmail,
        receiver.email AS receiverEmail,
        mails.subject, 
        mails.body, 
        mails.time 
      FROM mails
      JOIN users AS sender ON mails.sender_id = sender.id
      JOIN users AS receiver ON mails.receiver_id = receiver.id
      WHERE mails.id = ? AND (receiver_id = ? OR sender_id = ?)
    `);
    const requestedMail = stmt.get(mailId, userId, userId);

    res.status(200).send(requestedMail);
    return;
  } catch (err) {
    res.sendStatus(500);
    console.log(err);
    return;
  }
});

export default router;
