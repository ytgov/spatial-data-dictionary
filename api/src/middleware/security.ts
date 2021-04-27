import { NextFunction, Request, Response } from "express";

export function RequiresAuthentication(req: Request, res: Response, next: NextFunction) {
    if (req.oidc.isAuthenticated()) {
        return next();
    }

    res.status(401).send("Not authenticated"); //;.redirect('/api/auth/login');
}
