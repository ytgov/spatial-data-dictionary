import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import * as config from './config';
import { doHealthCheck } from "./utils/healthCheck";
import { userRouter } from "./routes";

const app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      'default-src': [ "'self'" ],
      'base-uri': [ "'self'" ],
      'block-all-mixed-content': [],
      'font-src': [ "'self'", 'https:', 'data:' ],
      'frame-ancestors': [ "'self'" ],
      'img-src': [ "'self'", 'data:' ],
      'object-src': [ "'none'" ],
      'script-src': [ "'self'", "'unsafe-eval'" ],
      'script-src-attr': [ "'none'" ],
      'style-src': [ "'self'", 'https:', "'unsafe-inline'" ]
    },
  })
);

// very basic CORS setup
app.use(cors({
  origin: config.FRONTEND_URL,
  optionsSuccessStatus: 200,
  credentials: true
}));

// send a generic HTML page to show it's running
/* app.get("/", (req: Request, res: Response) => {
  //res.sendFile("index.html", { root: "src/assets" });
  res.send("This is the SDD API")
}); */

app.get("/api/healthCheck", (req: Request, res: Response) => {
  doHealthCheck(res);
});

app.use("/api/user", userRouter);

app.use(express.static(path.join(__dirname, 'web')));

const PORT: number = parseInt(config.API_PORT as string);

app.listen(PORT, async () => {
  console.log(`Data Dictionary API listenting on port ${PORT}`);
});
