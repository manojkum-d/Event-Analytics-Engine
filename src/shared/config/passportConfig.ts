import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { envConfig } from './envConfig';
import * as userRepository from '../../repositories/users';

// Configure Passport Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: envConfig.googleClientId,
      clientSecret: envConfig.googleClientSecret,
      callbackURL: envConfig.googleCallbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await userRepository.findUserByGoogleId(profile.id);

        if (!user) {
          // Create new user if doesn't exist
          user = await userRepository.createUser({
            email: profile.emails?.[0]?.value || '',
            googleId: profile.id,
            firstName: profile.name?.givenName || null,
            lastName: profile.name?.familyName || null,
            profileImage: profile.photos?.[0]?.value || null,
            isVerified: true,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userRepository.findUserById(id);
    done(null, user);
  } catch (error) {
    done(error as Error);
  }
});

export default passport;
