import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import googleAuthRouter from "./google-auth";
import areasRouter from "./areas";
import routesRouter from "./routes";
import statsRouter from "./stats";
import badgesRouter from "./badges";
import tripsRouter from "./trips";
import aiRouter from "./ai";
import geoRouter from "./geo";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(googleAuthRouter);
router.use(areasRouter);
router.use(routesRouter);
router.use(statsRouter);
router.use(badgesRouter);
router.use(tripsRouter);
router.use(aiRouter);
router.use(geoRouter);

export default router;
