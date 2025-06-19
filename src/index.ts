import express, { Application } from "express";
import session from "express-session";
import dotenv from "dotenv";
import connectSqlite3 from "connect-sqlite3";
import passport from "passport";
import { loggingMiddleware } from "./utils/middlewares";
import routes from "./routes/index";
import "./strategies/localStrategy";

dotenv.config();
const app: Application = express();
app.use(express.json());

const SQLiteStore = connectSqlite3(session);

app.use(
  session({
    store: new SQLiteStore({
      db: "sessions.sqlite",
      dir: "./db",
    }) as session.Store,
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 60000 * 60,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use(loggingMiddleware);
app.use("/api", routes);

export default app;
