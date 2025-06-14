const mongoose = require("mongoose");
const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public")); 
app.use("/indy", express.static(__dirname + "/public")); // Add this for /indy/ prefixed files

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
        StandardAlignment: { type: String, required: false },
        SupportedLanguages: { type: String, required: false },
        isApproved: {type: Boolean, required: true, default: false},
    },
    { timestamps: true }
);

const Request = mongoose.model("Request", requestSchema, "Requests");

const commentSchema = new mongoose.Schema({
    RequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
    username: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
}, { timestamps: true });

const Comment = mongoose.model("Comment", commentSchema, "Comments");

app.get("/", async (req, res) => {
    const Requests = await Request.find({});
    console.log(Requests)
    res.render("index.ejs", { Requests });
});

app.get("/admin", async (req, res) => {
    const Requests = await Request.find({});
    console.log(Requests)
    res.render("admin.ejs", { Requests } );
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

// Single GET route for /indy/:id (removed duplicate)
app.get("/indy/:id", async (req, res) => {
    try {
        const Requests = await Request.find({});
        const Comments = await Comment.find({ RequestId: req.params.id }).sort({ createdAt: -1 });
        
        // Find the specific tool
        const currentTool = await Request.findById(req.params.id);
        
        if (!currentTool) {
            return res.status(404).send("Tool not found");
        }
    
        res.render("indy.ejs", { Requests, Comments, request: req, currentTool });
    } catch (error) {
        console.error('Error loading tool page:', error);
        res.status(500).send('Server error');
    }
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
            isApproved: req.body.isApproved || false
        }).save();

        res.status(201).json(newRequest);
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ error: 'Failed to create resource' });
    }
});

app.delete("/delete/:_id", async (req, res) => {
    const response = await Request.findOneAndDelete({ _id: req.params._id })
    res.json(response);
});

app.patch("/upTool/:_id", async (req, res) => {
    const response = await Request.findOneAndUpdate({ _id: req.params._id }, 
    req.body, {new: true})
    res.json(response);
});

// POST route for submitting comments
app.post("/indy/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid tool ID format' });
        }

        const tool = await Request.findById(req.params.id);
        if (!tool) {
            return res.status(404).json({ error: 'Tool not found' });
        }

        const { username, comment, rating } = req.body;
        if (!username || !comment || !rating) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const newComment = await new Comment({
            RequestId: req.params.id,
            username: username,
            comment: comment,
            rating: parseInt(rating),
        }).save();

        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// Route to get comments for a specific tool
app.get("/comments/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid tool ID format' });
        }

        const comments = await Comment.find({ RequestId: req.params.id })
            .sort({ createdAt: -1 })
            .populate('RequestId', 'ProductName');
        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// Delete comment route
app.delete("/comment/:_id", async (req, res) => {
    try {
        const response = await Comment.findOneAndDelete({ _id: req.params._id });
        if (!response) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json(response);
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

// Update comment route
app.patch("/comment/:_id", async (req, res) => {
    try {
        const response = await Comment.findOneAndUpdate(
            { _id: req.params._id }, 
            req.body, 
            { new: true }
        );
        if (!response) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json(response);
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Failed to update comment' });
    }
});

// Get average rating for a tool
app.get("/rating/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid tool ID format' });
        }

        const ratings = await Comment.aggregate([
            { $match: { RequestId: new mongoose.Types.ObjectId(req.params.id) } },
            { 
                $group: { 
                    _id: "$RequestId", 
                    averageRating: { $avg: "$rating" },
                    totalRatings: { $sum: 1 }
                }
            }
        ]);
        
        if (ratings.length > 0) {
            res.json({
                averageRating: Math.round(ratings[0].averageRating * 10) / 10,
                totalRatings: ratings[0].totalRatings
            });
        } else {
            res.json({ averageRating: 0, totalRatings: 0 });
        }
    } catch (error) {
        console.error('Error calculating rating:', error);
        res.status(500).json({ error: 'Failed to calculate rating' });
    }
});

app.use((req, res) => {
    res.status(404).send(`404 Not Found: ${req.originalUrl}`);
});

async function startServer() {
    // Add your SRV string, make sure that the database is called SE12
    await mongoose.connect("mongodb+srv://SE12:CSH2025@cluster0.1ryzo.mongodb.net/Cap?retryWrites=true&w=majority&appName=Cluster0");

    app.listen(3000, () => {
        console.log(`Server running.`);
    });
}

startServer();