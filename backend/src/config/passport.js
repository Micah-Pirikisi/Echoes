import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { prisma } from "./prisma.js";

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return done(null, false, { message: "Invalid email" });
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match)
          return done(null, false, { message: "Invalid password" });
        return done(null, { id: user.id });
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return done(null, false);
    done(null, { id: user.id, email: user.email, name: user.name });
  } catch (err) {
    done(err);
  }
});

export default passport;
