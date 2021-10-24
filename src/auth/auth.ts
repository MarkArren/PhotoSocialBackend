import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { insertUser, loginUser } from '../services/authService';
import { Strategy as JwtStrategy, ExtractJwt, JwtFromRequestFunction } from 'passport-jwt';

passport.use(
    'login',
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            session: false,
        },
        async (email, password, done) => {
            try {
                const user = await loginUser(email, password);

                if (!user) {
                    return done(null, false, { message: 'Incorrect Password' });
                }

                return done(null, user, { message: 'Logged in Successfully' });
            } catch (error) {
                return done(error);
            }
        },
    ),
);

// Create options string literaly
let opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'TOP_SECRET',
    // issuer: 'photo_social',
    // audience: 'User',
};
passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
        return done(null, { id: jwt_payload.sub });
    }),
);
