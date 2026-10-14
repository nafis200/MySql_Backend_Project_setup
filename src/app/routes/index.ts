import express, { Router } from "express";

const router = express.Router();

// Register feature modules here, e.g.
// { path: "/users", route: UserRoutes },
// { path: "/courses", route: CourseRoutes },
const moduleRoutes: { path: string; route: Router }[] = [];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
