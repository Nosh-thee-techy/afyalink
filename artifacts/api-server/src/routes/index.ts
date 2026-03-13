import { Router, type IRouter } from "express";
import healthRouter from "./health";
import patientsRouter from "./patients";
import consultationsRouter from "./consultations";
import referralsRouter from "./referrals";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(patientsRouter);
router.use(consultationsRouter);
router.use(referralsRouter);
router.use(dashboardRouter);

export default router;
