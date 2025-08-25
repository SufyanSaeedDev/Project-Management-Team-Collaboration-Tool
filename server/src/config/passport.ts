import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // User lookup and creation will be handled in auth service
                return done(null, {
                    googleId: profile.id,
                    email: profile.emails?.[0]?.value,
                    fullName: profile.displayName,
                    avatarUrl: profile.photos?.[0]?.value,
                });
            } catch (error) {
                return done(error as Error);
            }
        }
    )
);

export default passport;
