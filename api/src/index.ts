import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import * as config from './config';
import { doHealthCheck } from "./utils/healthCheck";
import { userRouter } from "./routes";

const app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(helmet());

// very basic CORS setup
app.use(cors({
  origin: config.FRONTEND_URL,
  optionsSuccessStatus: 200,
  credentials: true
}));

// send a generic HTML page to show it's running
 app.get("/", (req: Request, res: Response) => {
  //res.sendFile("index.html", { root: "src/assets" });
  res.send("This is the SDD API")
}); 

 app.get("/api/healthCheck", (req: Request, res: Response) => {
  doHealthCheck(res);
}); 

app.use("/api/user", userRouter);

const PORT: number = parseInt(config.API_PORT as string);

app.listen(PORT, async () => {
  console.log(`Data Dictionary API listenting on port ${PORT}`);
});
