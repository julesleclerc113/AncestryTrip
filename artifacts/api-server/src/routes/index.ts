import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tripsRouter from "./trips";
import businessRouter from "./business";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tripsRouter);
router.use(businessRouter);

export default router;
