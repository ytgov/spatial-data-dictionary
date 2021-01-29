import { NextFunction, Request, Response } from "express";

export function RequiresAuthentication(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/api/auth/login');
}
