import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { envConfig } from './envConfig';
import * as userRepository from '../../repositories/users';
import User from '../models/User';

// Configure Passport Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: envConfig.googleClientId,
      clientSecret: envConfig.googleClientSecret,
      callbackURL: envConfig.googleCallbackUrl,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract user info from Google profile
        const userData = {
          googleId: profile.id,
          email: profile.emails?.[0]?.value || '',
          firstName: profile.name?.givenName || null,
          lastName: profile.name?.familyName || null,
          profileImage: profile.photos?.[0]?.value || null,
        };

        // Find or create user with Google credentials
        const user = await userRepository.findOrCreateGoogleUser(userData);

        // Update last login time
        await userRepository.updateLastLogin(user.id);

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  // Type assertion to access id property
  const userId = (user as Express.User).id;
  done(null, userId);
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
