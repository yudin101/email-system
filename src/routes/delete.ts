import { Request, Response, Router } from "express";
import db from "../db";

const router = Router();

router.delete("/delete/:id", (req: Request, res: Response) => {
  const { id: mailId } = req.params;
  const { id: currentUserId } = req.user!;

  try {
    const getMailQuery = `SELECT 
        receiver_id, 
        sender_id, 
        receiver_deleted, 
        sender_deleted 
      FROM mails 
      WHERE id = ? 
      AND (
        sender_id = ? 
        OR receiver_id = ?
      )`;

    const getMailStmt = db.prepare(getMailQuery);
    const getMail = getMailStmt.get(mailId, currentUserId, currentUserId) as
      | {
          receiver_id: number;
          sender_id: number;
          receiver_deleted: 0 | 1;
          sender_deleted: 0 | 1;
        }
      | undefined;

    if (!getMail) {
      res.sendStatus(404);
      return;
    }

    // check: current user is sender or receiver
    const { receiver_id: receiverId, sender_id: senderId } = getMail;

    // make it such that the mail is not removed but the user cannot see it and other party can still see it
    if (currentUserId === receiverId) {
      db.prepare("UPDATE mails SET receiver_deleted = 1 WHERE id = ?").run(
        mailId,
      );
    } else if (currentUserId === senderId) {
      db.prepare("UPDATE mails SET sender_deleted = 1 WHERE id = ?").run(
        mailId,
      );
    }

    // delete the mail from db is both parties have deleted it
    const getUpdatedMailStmt = db.prepare(getMailQuery);
    const getUpdatedMail = getUpdatedMailStmt.get(
      mailId,
      currentUserId,
      currentUserId,
    ) as {
      receiver_id: number;
      sender_id: number;
      receiver_deleted: 0 | 1;
      sender_deleted: 0 | 1;
    };

    const { receiver_deleted: receiverDeleted, sender_deleted: senderDeleted } =
      getUpdatedMail;

    if (receiverDeleted === 1 && senderDeleted === 1) {
      db.prepare("DELETE FROM mails WHERE id = ?").run(mailId);
    }

    res.sendStatus(200);
    return;
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
    return;
  }
});

export default router;
