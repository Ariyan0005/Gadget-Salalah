import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import bannersRouter from "./banners";
import adminRouter from "./admin";
import setupRouter from "./setup";
import seedRouter from "./seed";

const router: IRouter = Router();

router.use(healthRouter);
router.use(setupRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(bannersRouter);
router.use(adminRouter);
router.use(seedRouter);

export default router;
