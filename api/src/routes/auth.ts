import { Express, Request, Response } from "express"
import * as ExpressSession from "express-session";
import { AuthUser, Storage } from "../data";
import { AUTH_REDIRECT, VIVVO_CONFIG } from "../config";
import { RequiresData } from "../middleware";

let OidcStrategy = require('passport-openidconnect').Strategy;
let passport = require('passport');

export function configureAuthentication(app: Express) {
    app.use(ExpressSession.default({
        secret: 'supersecret',
        resave: true,
        saveUninitialized: true
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user: any, next: any) => {
        let authUser = AuthUser.fromPassport(user);
        next(null, authUser)
    });

    passport.deserializeUser((obj: any, next: any) => {
        next(null, obj)
    });

    passport.use('oidc', new OidcStrategy(VIVVO_CONFIG,
        (issuer: any, sub: any, profile: any, accessToken: any, refreshToken: any, done: any) => {
            return done(null, profile)
        }));

    app.use('/api/auth/login', passport.authenticate('oidc'));

    app.get('/api/auth/logout', RequiresData, async (req: any, res) => {
        let db = req.store as Storage;

        await db.Sessions.end(req.sessionID);
        req.logout();
        req.session.destroy();
        res.status(202).send();
    });

    app.use("/api/auth/isAuthenticated", (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            return res.send(req.user);
        }

        return res.status(401).send();
    });

    app.use('/authorization-code/callback', RequiresData,
        passport.authenticate('oidc', { failureRedirect: '/api/error' }),
        async (req, res) => {
            let db = req.store as Storage;
    
            await db.Sessions.begin(AuthUser.fromPassport(req.user), req.sessionID)
            res.redirect(AUTH_REDIRECT);
        }
    );

    app.use("/api/error", (req: Request, res: Response) => {
        console.error(req)
        res.status(500).send("Authentication error");
    });
}
