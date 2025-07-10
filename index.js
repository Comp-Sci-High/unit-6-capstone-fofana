const mongoose = require("mongoose");
const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public")); 
app.use("/indy", express.static(__dirname + "/public")); // Add this for /indy/ prefixed files
app.use(express.static(__dirname + '/public', {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));
app.use((req, res, next) => {
    console.log(`${req.method}: ${req.path}`);
    next();
});

const requestSchema = new mongoose.Schema(
    {
        Topic: {type: String, required: true},
        ProductName: { type: String, required: true },
        Website: { type: String, required: true },
        ProductType: { type: String, required: true },
        Description: { type: String, required: true },
        Price: { type: String, required: true },
        GradeLevel: { type: String, required: true },
        StandardAlignment: { type: String, required: false },
        SupportedLanguages: { type: String, required: false },
        // UPDATED: Allow null for pending status
        isApproved: { type: Boolean, required: false, default: null }, // null = pending, true = approved, false = rejected
    },
    { timestamps: true }
);

const Request = mongoose.model("Request", requestSchema, "Requests");

const commentSchema = new mongoose.Schema({
    RequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
    username: { type: String, required: true },
    comment: { type: String, required: true },
    organization: {type: String, required: false},
    role: {type: String, required: false},
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

// FIXED: Library route with proper rating calculations
app.get("/library", async (req, res) => {
    try {
        // Only get approved requests
        const requests = await Request.find({ isApproved: true }).lean();
        console.log(`Found ${requests.length} approved requests for library`);
        
        // Calculate ratings for each request
        const requestsWithRatings = await Promise.all(
            requests.map(async (request) => {
                try {
                    const comments = await Comment.find({ RequestId: request._id });
                    const ratingsWithScores = comments.filter(comment => 
                        comment.rating !== null && comment.rating !== undefined
                    );
                    
                    if (ratingsWithScores.length > 0) {
                        const averageRating = ratingsWithScores.reduce((sum, comment) => 
                            sum + comment.rating, 0) / ratingsWithScores.length;
                        
                        // Add rating data to the request object
                        request.ratingData = {
                            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
                            reviewCount: ratingsWithScores.length
                        };
                    } else {
                        request.ratingData = {
                            averageRating: 0,
                            reviewCount: 0
                        };
                    }
                    
                    return request;
                } catch (error) {
                    console.error(`Error processing ratings for request ${request._id}:`, error);
                    request.ratingData = {
                        averageRating: 0,
                        reviewCount: 0
                    };
                    return request;
                }
            })
        );
        
        console.log(`Processed ${requestsWithRatings.length} requests with ratings`);
        
        // Get all comments for backward compatibility (if needed by your EJS template)
        const Comments = await Comment.find({}).sort({ createdAt: -1 });
        
        res.render('library.ejs', { Requests: requestsWithRatings, Comments });
    } catch (error) {
        console.error('Error loading library with ratings:', error);
        res.status(500).send('Server error');
    }
});

// FIXED: Admin-specific routes with /admin prefix
app.patch("/admin/approve/:_id", async (req, res) => {
    try {
        console.log(`Approving request with ID: ${req.params._id}`);
        const response = await Request.findOneAndUpdate(
            {_id: req.params._id}, 
            {isApproved: true}, 
            {new: true}
        );
        if (!response) {
            console.log(`Request not found for ID: ${req.params._id}`);
            return res.status(404).json({ error: 'Request not found' });
        }
        console.log(`Successfully approved request: ${response.ProductName}`);
        res.json(response);
    } catch (error) {
        console.error('Error approving request:', error);
        res.status(500).json({ error: 'Failed to approve request' });
    }
});

app.patch("/admin/reject/:_id", async (req, res) => {
    try {
        console.log(`Rejecting request with ID: ${req.params._id}`);
        const response = await Request.findOneAndUpdate(
            {_id: req.params._id}, 
            {isApproved: false}, 
            {new: true}
        );
        if (!response) {
            console.log(`Request not found for ID: ${req.params._id}`);
            return res.status(404).json({ error: 'Request not found' });
        }
        console.log(`Successfully rejected request: ${response.ProductName}`);
        res.json(response);
    } catch (error) {
        console.error('Error rejecting request:', error);
        res.status(500).json({ error: 'Failed to reject request' });
    }
});

app.delete("/admin/delete/:_id", async (req, res) => {
    try {
        const response = await Request.findOneAndDelete({ _id: req.params._id });
        if (!response) {
            return res.status(404).json({ error: 'Request not found' });
        }
        res.json(response);
    } catch (error) {
        console.error('Error deleting request:', error);
        res.status(500).json({ error: 'Failed to delete request' });
    }
});

// Keep the old routes for backward compatibility
app.patch("/approve/:_id", async (req, res) => {
    try {
        console.log(`Approving request (legacy route) with ID: ${req.params._id}`);
        const response = await Request.findOneAndUpdate(
            {_id: req.params._id}, 
            {isApproved: true}, 
            {new: true}
        );
        if (!response) {
            return res.status(404).json({ error: 'Request not found' });
        }
        console.log(`Successfully approved request (legacy): ${response.ProductName}`);
        res.json(response);
    } catch (error) {
        console.error('Error approving request (legacy):', error);
        res.status(500).json({ error: 'Failed to approve request' });
    }
});

app.patch("/disapprove/:_id", async (req, res) => {
    try {
        const response = await Request.findOneAndUpdate(
            {_id: req.params._id}, 
            {isApproved: false}, 
            {new: true}
        );
        if (!response) {
            return res.status(404).json({ error: 'Request not found' });
        }
        res.json(response);
    } catch (error) {
        console.error('Error disapproving request:', error);
        res.status(500).json({ error: 'Failed to disapprove request' });
    }
});

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
            Topic: req.body.Topic,
            ProductName: req.body.ProductName,
            Website: req.body.Website,
            ProductType: req.body.ProductType,
            Description: req.body.Description,
            Price: req.body.Price,
            GradeLevel: req.body.GradeLevel,
            StandardAlignment: req.body.StandardAlignment,
            SupportedLanguages: req.body.SupportedLanguages,
            // FIXED: Remove the typo 'f' and set to null for pending status
            isApproved: null  // null = pending, true = approved, false = rejected
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

        // FIXED: Include organization and role in destructuring
        const { username, comment, rating, organization, role } = req.body;
        if (!username || !comment || !rating) {
            return res.status(400).json({ error: 'All required fields (username, comment, rating) are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const newComment = await new Comment({
            RequestId: req.params.id,
            username: username,
            organization: organization || '', // FIXED: Use the destructured variable
            role: role || '', // FIXED: Use the destructured variable
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

app.patch("/admin/edit/:_id", async (req, res) => {
    try {
        const {
            Topic,
            ProductName,
            Description,
            ProductType,
            Price,
            GradeLevel,
            StandardAlignment,
            SupportedLanguages,
            Website
        } = req.body;
        
        // Validate required fields (including Topic)
        if (!Topic || !ProductName || !Description || !ProductType || !Price || !GradeLevel || !Website) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }
        
        // Validate URL format
        try {
            new URL(Website);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid website URL format' });
        }
        
        const updateData = {
            Topic: Topic.trim(),
            ProductName: ProductName.trim(),
            Description: Description.trim(),
            ProductType: ProductType.trim(),
            Price: Price.trim(),
            GradeLevel: GradeLevel.trim(),
            StandardAlignment: StandardAlignment ? StandardAlignment.trim() : '',
            SupportedLanguages: SupportedLanguages ? SupportedLanguages.trim() : '',
            Website: Website.trim()
        };
        
        const response = await Request.findOneAndUpdate(
            { _id: req.params._id },
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!response) {
            return res.status(404).json({ error: 'Request not found' });
        }
        
        res.json({ message: 'Submission updated successfully', request: response });
        
    } catch (error) {
        console.error('Error updating submission:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: 'Invalid data provided' });
        }
        res.status(500).json({ error: 'Failed to update submission' });
    }
});

// FIXED: Remove duplicate comment update route and keep only one
app.patch("/comment/:_id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
            return res.status(400).json({ error: 'Invalid comment ID format' });
        }

        const { username, comment, rating, organization, role } = req.body;
        
        // Validate required fields
        if (!username || !comment || !rating) {
            return res.status(400).json({ error: 'All fields (username, comment, rating) are required' });
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const updateData = {
            username: username.trim(),
            comment: comment.trim(),
            rating: parseInt(rating),
            organization: organization ? organization.trim() : '',
            role: role ? role.trim() : ''
        };

        const response = await Comment.findOneAndUpdate(
            { _id: req.params._id }, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if (!response) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        
        res.json({ message: 'Comment updated successfully', comment: response });
    } catch (error) {
        console.error('Error updating comment:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: 'Invalid data provided' });
        }
        res.status(500).json({ error: 'Failed to update comment' });
    }
});

// ENHANCED: Delete comment route with better error handling
app.delete("/comment/:_id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
            return res.status(400).json({ error: 'Invalid comment ID format' });
        }

        const response = await Comment.findOneAndDelete({ _id: req.params._id });
        if (!response) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json({ message: 'Comment deleted successfully', comment: response });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
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

// ADDED: Debug route to check approved requests
app.get("/debug/approved", async (req, res) => {
    try {
        const approvedRequests = await Request.find({ isApproved: true });
        res.json({
            count: approvedRequests.length,
            requests: approvedRequests
        });
    } catch (error) {
        console.error('Error fetching approved requests:', error);
        res.status(500).json({ error: 'Failed to fetch approved requests' });
    }
});

// ADDED: Logout route for admin
app.post("/admin/logout", (req, res) => {
    // Clear any session data if you're using sessions
    // For now, just redirect to home
    res.redirect('/');
});

app.get("/admin/logout", (req, res) => {
    // Handle GET request for logout as well
    res.redirect('/');
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