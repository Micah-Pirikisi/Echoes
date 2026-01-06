import express from "express";
import session from "express-session";
import pgSession from "connect-pg-simple";
import passport from "./config/passport.js";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/uploads.js";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js";

dotenv.config();

const app = express();
const PgSession = pgSession(session);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: "session",
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/uploads", uploadRoutes);
app.use("/posts", postRoutes);
app.use("/users", userRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));

app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on :${port}`));
