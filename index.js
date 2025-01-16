import app from "./app.js";
import connectDB from "./utils/connectDB.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((error) => console.log(error?.message || "Failed to start server"));
