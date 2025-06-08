import { Request, Response, Router } from "express";

const router = Router();
router.get("/logout", (req: Request, res: Response) => {
  if (!req.user) {
    res.sendStatus(401);
    return;
  }

  req.session.destroy((err) => {
    if (err) {
      res.sendStatus(500);
      console.log(err);
      return;
    }

    res.clearCookie("connect.sid").sendStatus(200);
    return;
  });
});

export default router;
