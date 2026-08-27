require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/database");

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectToDB();
  const aiProviders = [
    process.env.OPENAI_API_KEY?.trim() && "OpenAI",
    process.env.GROQ_API_KEY?.trim() && "Groq fallback",
  ].filter(Boolean);
  if (aiProviders.length) console.log(`AI providers ready: ${aiProviders.join(" -> ")}`);
  else console.warn("AI features are disabled: configure OPENAI_API_KEY or GROQ_API_KEY.");
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
