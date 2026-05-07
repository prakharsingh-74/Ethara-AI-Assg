import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { errorHandler, routeNotFound } from "./middleware/errorMiddleware.js";
import routes from "./routes/index.js";
import { testSupabaseConnection } from "./utils/supabase.js";

dotenv.config();

const port = process.env.PORT || 5000;

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "https://ethara-ai-assg.vercel.app"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api", routes);

app.use(routeNotFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
  testSupabaseConnection();
});
