require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/database");

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectToDB();
  if (!process.env.OPENAI_API_KEY?.trim()) {
    console.warn("OpenAI features are disabled: add OPENAI_API_KEY to Backend/.env and restart.");
  }
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
