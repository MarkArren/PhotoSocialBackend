import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { insertUser, loginUser } from '../services/authService';
import { Strategy as JwtStrategy, ExtractJwt, JwtFromRequestFunction } from 'passport-jwt';

// passport.use(
//     new LocalStrategy(function (email, password, done) {
//         User.findOne({ email: email }, function (err, user) {
//             if (err) {
//                 return done(err);
//             }
//             if (!user) {
//                 return done(null, false);
//             }
//             if (!user.verifyPassword(password)) {
//                 return done(null, false);
//             }
//             return done(null, user);
//         });
//     }),
// );

// // ...

// passport.use(
//     'signup',
//     new LocalStrategy(
//         {
//             usernameField: 'email',
//             passwordField: 'password',
//             session: false,
//         },
//         async (email, password, done) => {
//             try {
//                 const user = await UserModel.create({ email, password });
//                 const user = await insertUser(email, password);

//                 return done(null, user);
//             } catch (error) {
//                 done(error);
//             }
//         },
//     ),
// );

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
        const issuedAt = new Date(jwt_payload.iat);
        // Check how age of jwt
        if (Date.now() - issuedAt.getTime() > 3.6e6) {
            // Should return 401 unauthorized
            return done('JWT expired', false);
        }
    }),
);
