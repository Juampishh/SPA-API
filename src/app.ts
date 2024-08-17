import express, { Application } from "express";
import morgan from "morgan";
import IndexRoutes from "./routes/index.routes";
import UserRoutes from "./routes/user.routes";
import AuthRoutes from "./routes/auth.routes";
import ServicesRoutes from "./routes/services.routes";
import AppointmentsRoutes from "./routes/appointments.routes";
var cors = require("cors");
export class App {
  private app: Application;
  constructor(private port?: number | string) {
    this.app = express();
    this.settings();
    this.middlewares();
    this.routes();
  }
  settings() {
    this.app.set("port", this.port || process.env.PORT || 3000);
  }
  middlewares() {
    this.app.use(morgan("dev"));
    this.app.use(express.json());
  }
  routes() {
    this.app.use(cors());
    this.app.use(IndexRoutes);
    this.app.use("/users", UserRoutes);
    this.app.use("/auth", AuthRoutes);
    this.app.use("/services", ServicesRoutes);
    this.app.use("/appointments", AppointmentsRoutes);
  }
  async listen() {
    await this.app.listen(this.app.get("port"));
    console.log("Server on port", this.app.get("port"));
  }
}
