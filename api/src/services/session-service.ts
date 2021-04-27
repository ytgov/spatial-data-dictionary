import { Collection, FilterQuery } from "mongodb";
import { AuthUser } from "../data"

export class SessionService {

    private _sessions: Collection;

    constructor(sessions: Collection) {
        this._sessions = sessions;
    }

    async begin(user: AuthUser, sessionId: string): Promise<any> {
        let existing = await this.getBySessionId(sessionId);

        if (!existing)
            return this._sessions.insertOne({ user, session_id: sessionId, start_date: new Date() });

        return existing;
    }

    async end(sessionId: string): Promise<any> {
        let now = new Date();
        let session = await this._sessions.findOne({ session_id: sessionId });

        if (session) {
            let duration = (now.getTime() - session.start_date.getTime()) / 1000;
            return this._sessions.findOneAndUpdate({ _id: session._id }, { $set: { end_date: now, duration } });
        }
    }

    async getAll(query?: FilterQuery<any>): Promise<any[]> {
        return this._sessions.find(query).toArray();
    }

    async getBySessionId(sessionId: string): Promise<any> {
        return this._sessions.findOne({ session_id: sessionId });
    }
}
