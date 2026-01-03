import { Express, Router } from 'express'
import cors from 'cors'
import express, { Request, Response, NextFunction } from 'express';
import { handleExpressError } from '../exceptions/handleExpressError';
import passport from 'passport';
import session from 'express-session';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserRepository } from '@/app/http/controllers/auth/repository/userRepository';
import { Token } from 'parse5';
import { apiV1 } from '@/routes/apiV1';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import { cwd } from 'process';
import path from 'path/win32';


export function expressServer(app: Express, PORT: number) {

    const router = Router()

    app.use(cors({
        origin: process.env.REACT_APP_URL || 'http://localhost:5173',
        credentials: true,
    }))

    const currentDir = cwd() 
    app.use(express.static(path.join(currentDir, "public")));


    app.use(express.json())
    app.use(express.urlencoded({ extended: true }));
    app.use(handleExpressError)

    app.get('/', (req: Request, res: Response) => {
        res.json({ message: 'NotebookLLM is running' });
    })


    // Enable trust proxy for Codespaces/reverse proxy environments
    app.set('trust proxy', 1);

    const sess: session.SessionOptions = {
        // Use Mongoose client so the session store writes to the same DB (not default `test`)
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/notebooklm',
            dbName: process.env.MONGO_DB_NAME || 'notebooklm',
            collectionName: "sessions",
        }),

        secret: process.env.COOKIE_KEY as string,
        resave: false,
        saveUninitialized: false,
        cookie: { 
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            // Use 'none' only in production (where cookies are Secure). For local dev use 'lax'
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    };

    app.use(session(sess))
    app.use(passport.initialize())
    app.use(passport.session())

    // Register API routes AFTER session middleware
    apiV1(app, router)


    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID as string,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
                callbackURL: process.env.CALL_BACK_URL || 'http://localhost:8000/auth/google/callback',
                // passReqToCallback: true,
            },
            async (accessToken: string, refreshToken: string, profile: any, done: any) => {
                const userRepo = UserRepository.getInstance()
                const user = await userRepo.createUser(profile, { accessToken, refreshToken })
                console.log('create user : ', profile);
                return done(null, user);
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
            successRedirect: "/test", // Redirect to test page after login
        })
    )

    app.get('/auth/me', (req: any, res: any) => {
        if (!req.user) return res.status(401).json({ error: 'Not logged in' });
        res.json(req.user);
    });

    // Test page to verify session and make authenticated requests
    app.get('/test', (req: any, res: any) => {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Session Test</title>
                <style>
                    body { font-family: Arial; padding: 20px; max-width: 800px; margin: 0 auto; }
                    button { padding: 10px 20px; margin: 10px 5px; cursor: pointer; }
                    pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
                    .success { color: green; }
                    .error { color: red; }
                </style>
            </head>
            <body>
                <h1>🔐 Authentication Test Page</h1>
                
                <h2>Step 1: Authenticate</h2>
                <button onclick="authenticate()">Login with Google</button>
                
                <h2>Step 2: Check Session</h2>
                <button onclick="checkAuth()">Check Auth Status</button>
                <div id="auth-result"></div>
                
                <h2>Step 3: Get Drive Files</h2>
                <button onclick="getFiles()">Get My Drive Files</button>
                <div id="files-result"></div>
                
                <script>
                    function authenticate() {
                        window.location.href = '/auth/google';
                    }
                    
                    async function checkAuth() {
                        const result = document.getElementById('auth-result');
                        try {
                            const response = await fetch('/auth/me', { credentials: 'include' });
                            const data = await response.json();
                            if (response.ok) {
                                result.innerHTML = '<p class="success">✅ Authenticated!</p><pre>' + JSON.stringify(data, null, 2) + '</pre>';
                            } else {
                                result.innerHTML = '<p class="error">❌ Not authenticated: ' + data.error + '</p>';
                            }
                        } catch (err) {
                            result.innerHTML = '<p class="error">❌ Error: ' + err.message + '</p>';
                        }
                    }
                    
                    async function getFiles() {
                        const result = document.getElementById('files-result');
                        result.innerHTML = '<p>Loading...</p>';
                        try {
                            const response = await fetch('/api/v1/users/files', { credentials: 'include' });
                            const data = await response.json();
                            if (response.ok) {
                                result.innerHTML = '<p class="success">✅ Files retrieved!</p><pre>' + JSON.stringify(data, null, 2) + '</pre>';
                            } else {
                                result.innerHTML = '<p class="error">❌ Error: ' + JSON.stringify(data, null, 2) + '</p>';
                            }
                        } catch (err) {
                            result.innerHTML = '<p class="error">❌ Error: ' + err.message + '</p>';
                        }
                    }
                    
                    // Auto-check auth on page load
                    window.onload = () => checkAuth();
                </script>
            </body>
            </html>
        `);
    });


    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:8000`);
    });
}