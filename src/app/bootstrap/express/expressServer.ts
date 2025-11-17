import { Express } from 'express'
import cors from 'cors'
import express, { Request, Response, NextFunction } from 'express';
import { handleExpressError } from '../exceptions/handleExpressError';
import passport from 'passport';
import session from 'express-session';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';


export function expressServer(app: Express, PORT: number) {

    app.use(cors({
        origin: '*',
        credentials: false,
    }))

    app.use(express.json())
    app.use(express.urlencoded({ extended: true }));
    app.use(handleExpressError)

    app.get('/', (req: Request, res: Response) => {
        res.json({ message: 'NotebookLLM is running' });
    })





    const sess = {
        secret: process.env.COOKIE_KEY as string,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    };

    if (process.env.NODE_ENV === 'production') {
        app.set('trust proxy', 1) //trust first proxy
        sess.cookie.secure = true // serve secure cookies

    }

    app.use(session(sess))
    app.use(passport.initialize())
    app.use(passport.session())




    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID as string,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
                callbackURL: process.env.CALL_BACK_URL,
                // passReqToCallback: true,
            },
            async (accessToken: string, refreshToken: string, profile: any, done: any) => {
                console.log('create user : ', profile);
                return done(null, profile);
            }
        )
    );

    passport.serializeUser((user: any, done) => {
        console.log('user in seri: : : ', user)
        done(null, user);//storeonly the user ID
    });
    // . Called . on. every . request .that. uses .the .session.
    passport.deserializeUser(async (obj: any, done) => {
        try {
            // .here. check. if user exist in db
            done(null, obj);
        } catch (err) {
            done(err);

        }
    })


    app.get(
        "/auth/google",
        passport.authenticate("google",
            {
                scope: [
                    "profile",
                    "email",
                    "https://www.googleapis.com/auth/drive.readonly",
                    "https://www.googleapis.com/auth/drive.file",
                ],
                accessType: "offline",
                prompt: "consent",
            }
        )
    );

    app.get(
        "/auth/google/callback",
        passport.authenticate("google", {
            failureRedirect: "/auth/login",
            successRedirect: process.env.REACT_APP_URL, // frontend route
        })
    )

    app.get('/auth/me', (req: any, res: any) => {
        if (!req.user) return res.status(401).json({ error: 'Not logged in' });
        res.json(req.user);

    });








    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:8000`);
    });
}