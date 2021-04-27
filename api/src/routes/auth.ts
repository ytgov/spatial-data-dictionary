import { Express, NextFunction, Request, Response } from "express"
import * as ExpressSession from "express-session";
import { AuthUser, Storage } from "../data";
import { AUTH_REDIRECT } from "../config";
import { RequiresData } from "../middleware";

import { auth } from "express-openid-connect";

export function configureAuthentication(app: Express) {
    app.use(ExpressSession.default({
        secret: 'supersecret',
        resave: true,
        saveUninitialized: true
    }));

    app.use(auth({
        authRequired: false,
        auth0Logout: false,
        authorizationParams: {
            response_type: 'code',
            audience: '',
            scope: 'openid profile email',
        },
        routes: {
            login: "/api/auth/login",
            //logout: "/api/auth/logout",
            postLogoutRedirect: "/custom-logout"
        }
    }));

    app.use("/", async (req: Request, res: Response, next: NextFunction) => {
        if (req.oidc.isAuthenticated()) {
            req.user = AuthUser.fromOpenId(req.oidc.user);
            (req.session as any).user = req.user;
        }

        next();
    });

    app.get("/", RequiresData, async (req: Request, res: Response) => {
        if (req.oidc.isAuthenticated()) {
            let user = AuthUser.fromOpenId(req.oidc.user) as AuthUser;
            req.user = user;

            let db = req.store as Storage;
            await db.Sessions.begin(req.user, req.sessionID);

            // Add them to the users list
            let userMatch = await db.Persons.getAll({ email: user.email })

            if (userMatch.length == 0)
                await db.Persons.create(user);

            res.redirect(AUTH_REDIRECT);
        }
    });

    app.get("/api/auth/isAuthenticated", (req: Request, res: Response) => {
        if (req.oidc.isAuthenticated()) {
            return res.send({ data: req.user });
        }

        return res.status(401).send();
    });

    app.get('/api/auth/logout', RequiresData, async (req: any, res) => {
        let db = req.store as Storage;
        await db.Sessions.end(req.sessionID);
        req.session.destroy();
        (res as any).oidc.logout({ returnTo: "/" });
    });
}
