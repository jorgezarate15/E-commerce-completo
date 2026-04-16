import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

async function bootstrap() {
  await connectDatabase();
  app.listen(env.port, () => {
    console.log(`Backend running on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
