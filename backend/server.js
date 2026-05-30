const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const contactRoutes = require("./routes/contactRoutes");

app.use("/", contactRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});