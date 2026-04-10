require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/database");

// DB connect
connectToDB();

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});