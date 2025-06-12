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
        GradeLevel: { type: String, required: true },
        StandardAlignment: { type: String, required: true },
        SupportedLanguages: { type: String, required: true },
        isApproved: {type: Boolean, required: true},
        }
);

// rating schema with a referenceID to the requestSchema. (1 to many relationship

const Request = mongoose.model("Request", requestSchema, "Requests");

app.get("/", async (req, res) => {
    const Requests = await Request.find({});
    console.log(Requests)
    res.render("index.ejs", { Requests });
});

app.get("/admin", async (req, res) => {
const Requests = await Request.find({})
res.render("admin.ejs", { Requests } )
})

app.get("/library", async (req, res) => {
    const Requests = await Request.find({});
    console.log(Requests)
    res.render("library.ejs", { Requests });
});

app.patch("/approve/:_id", async (req, res) => {
    const response = await Request.findOneAndUpdate({_id: req.params._id}, {isApproved: true}, {new: true}
    )
    res.json(response);
})

app.patch("/disapprove/:_id", async (req, res) => {
    const response = await Request.findOneAndUpdate({_id: req.params._id}, {isApproved: false}, {new: true}
    )
    res.json(response);
})

app.get("/indy", async (req, res) => {
    const Requests = await Request.find({});
    res.render("indy.ejs", { Requests });
});


app.get("/request", async (req, res) => {
    const Requests = await Request.find({});
    res.render("request.ejs", { Requests });
});


app.post("/request", async (req, res) => {
    try {
        const newRequest = await new Request({
            ProductName: req.body.ProductName,
            Website: req.body.Website,
            ProductType: req.body.ProductType,
            Description: req.body.Description,
            Price: req.body.Price,
            GradeLevel: req.body.GradeLevel,
            StandardAlignment: req.body.StandardAlignment,
            SupportedLanguages: req.body.SupportedLanguages,
            isApproved: req.body.isApproved || false // Default to false
        }).save();

        res.status(201).json(newRequest);
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ error: 'Failed to create resource' });
    }
});

app.delete("/delTool/:_id", async (req, res) => {
    const response = await Request.findOneAndDelete({ _id: req.params._id })
    res.json(response);
    });

 app.patch("/upTool/:_id", async (req, res) => {
    const response = await Request.findOneAndUpdate({ _id: req.params._id }, 
    req.body, {new: true})
    res.json(response);
    });


const insideSchema = new mongoose.Schema(
    {
    username: { type: String },
    comment: { type: String },
    rating: { type: Number },
        }
);

const Inside = mongoose.model("Inside", insideSchema, "Insides");

app.post("/add/comment", async (req, res) => {
  const newComment = await new Inside({
    username: req.body.username,
    comment: req.body.comment,
    rating: req.body.rating,
  }).save();

  res.json(newComment);
});

app.delete("/delete/:_id", async (req, res) => {
    const response = await Inside.findOneAndDelete({ _id: req.params._id })
    res.json(response);
    });

    app.patch("/update/:_id", async (req, res) => {
    const response = await Inside.findOneAndUpdate({ _id: req.params._id }, 
    req.body, {new: true})
    res.json(response);
    });

async function startServer() {
    // Add your SRV string, make sure that the database is called SE12
    await mongoose.connect("mongodb+srv://SE12:CSH2025@cluster0.1ryzo.mongodb.net/Cap?retryWrites=true&w=majority&appName=Cluster0");


    app.listen(3000, () => {
        console.log(`Server running.`);
    });
}

startServer();