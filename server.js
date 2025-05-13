require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
    .then(()=> {
        console.log("Database connect successfully")

        app.listen(PORT,() => {
            console.log(`Server is running on http://localhost:${PORT} `);
        });
    })
    .catch((err) => {
        console.log("Database connection failed :", err);
    });
