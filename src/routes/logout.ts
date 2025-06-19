import { Request, Response, Router } from "express";

const router = Router();
router.get("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }

    res.clearCookie("connect.sid").sendStatus(200);
    return;
  });
});

export default router;
