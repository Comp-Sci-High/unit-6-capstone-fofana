const mongoose = require("mongoose");
const express = require("express");

const app = express();

app.use(express.static(__dirname + "/public"));

app.use(express.json());

app.set("view engine", "ejs");

app.use((req, res, next) => {
    console.log(`${req.method}: ${req.path}`);
    next();
});


const requestSchema = new mongoose.Schema(
    {
        ProductName: { type: String, required: true },
        Website: { type: String, required: true },
        ProductType: { type: String, required: true },
        Description: { type: String, required: true },
        Price: { type: String, required: true },
        GradeLevel: { type: Number, required: true },
        StandardsAssignment: { type: String, required: true },
        SupportedLanguages: { type: String, required: true },
        }
);


const Request = mongoose.model("Request", requestSchema, "Requests");

app.get("/", async (req, res) => {
    const Requests = await Request.find({});
    res.render("library.ejs", { requests });
});


async function startServer() {
    // Add your SRV string, make sure that the database is called SE12
    await mongoose.connect("mongodb+srv://SE12:CSH2025@cluster0.1ryzo.mongodb.net/Cap?retryWrites=true&w=majority&appName=Cluster0");


    app.listen(3000, () => {
        console.log(`Server running.`);
    });
}

startServer();