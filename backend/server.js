const app = require("./src/app");
const dotenv = require("dotenv");
const connectToDb = require("./config/database");
dotenv.config();
connectToDb();

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
