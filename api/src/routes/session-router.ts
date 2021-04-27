import express, { Request, Response } from "express";
import { param, validationResult } from "express-validator";
import { RequiresData, RequiresAuthentication } from "../middleware";
import { SessionService } from "../services";
import moment from "moment";

export const sessionRouter = express.Router();

sessionRouter.get("/", RequiresData, RequiresAuthentication, async (req: Request, res: Response) => {
    let db = req.store.Sessions as SessionService;
    //let query = { 'user.username': "datajohnson" };
    return res.json({ data: await db.getAll() });
});

sessionRouter.get("/summary", RequiresData, RequiresAuthentication, async (req: Request, res: Response) => {
    let db = req.store.Sessions as SessionService;
    //let query = { 'user.username': "datajohnson" };
    let data = await db.getAll({ duration: { $gt: 0 } })
    let detail = data.map(row => { return { username: row.user.username, duration: row.duration, start_date: row.start_date, date: moment(row.start_date).format("yyyy-MM-DD") } });
    let output = new Array<SumRow>();

    detail.forEach(item => {
        let io = output.filter(row => { return row.username == item.username && row.date == item.date });

        if (io.length == 0)
            output.push({ username: item.username, date: item.date, total: item.duration });
        else
            io[0].total += item.duration;
    });

    return res.json({ data: { detail, daily: output } });
});

sessionRouter.get("/:id", [param("id").notEmpty()], RequiresData, RequiresAuthentication,
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let db = req.store.Sessions as SessionService;
        let { id } = req.params;
        return res.json({ data: await db.getBySessionId(id) });
    });

interface SumRow {
    username: string;
    date: string;
    total: number;
}
