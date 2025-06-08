import { Request, Response, Router } from "express";
import db from "../db";

const router = Router();

router.get("/mails", (req: Request, res: Response) => {
  if (!req.user) {
    res.sendStatus(401);
    return;
  }

  const { id: receiverId } = req.user;

  try {
    const stmt = db.prepare(`
      SELECT 
        sender.email AS senderEmail,
        receiver.email AS receiverEmail,
        mails.subject, 
        mails.body, 
        mails.time 
      FROM mails
      JOIN users AS sender ON mails.sender_id = sender.id
      JOIN users AS receiver ON mails.receiver_id = receiver.id
      WHERE mails.receiver_id = ?
    `);

    const mails = stmt.all(receiverId);

    res.status(200).send(mails);
    return;
  } catch (err) {
    res.sendStatus(500);
    console.log(err);
    return;
  }
});
export default router;
