const { getDb } = require("../database/connect");

// CREATE user
const createUser = async (req, res) => {
    const user = {
        username: req.body.username,
        password: req.body.password, // In a real app, hash this!
        // ... other user properties
    };

    try {
        const db = getDb();
        const existingUser = await db.collection("users").findOne({ username: user.username });
        if (existingUser) {
            return res.status(409).json({ error: "Username already exists" });
        }
        const response = await db.collection("users").insertOne(user);
        if (response.acknowledged) {
            res.status(201).json({ userId: response.insertedId });
        } else {
            res.status(500).json({ error: "Failed to create the user." });
        }
    } catch (error) {
        res.status(500).json({ error: "An error occurred: " + error.message });
    }
};

// LOGIN user  (POST is more common for login)
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const db = getDb();
        const user = await db.collection("users").findOne({ username });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" }); // Unauthorized
        }

        // In a real app, compare hashed passwords!
        if (user.password !== password) {  // Placeholder - Replace with secure password comparison
            return res.status(401).json({ error: "Invalid credentials" }); // Unauthorized
        }


        // Set up session (example using Express sessions - you'll need to configure this middleware in your main app file)
        req.session.user = user;
        res.status(200).json({ message: "Login successful", user: { username: user.username } });

    } catch (error) {
        res.status(500).json({ error: "An error occurred: " + error.message });
    }
};

// LOGOUT user
const logoutUser = async (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) {
                console.error("Error destroying session:", err);
                return res.status(500).json({ error: "Logout failed" });
            }
            res.clearCookie('connect.sid'); // Clear the session cookie (important!)
            res.status(200).json({ message: "Logout successful" });
        });


    } catch (error) {
        res.status(500).json({ error: "An error occurred: " + error.message });
    }
};



// GET user by username
const getUserByUsername = async (req, res) => {
    const username = req.params.username;

    try {
        const db = getDb();
        const user = await db.collection("users").findOne({ username });

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: "User not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "An error occurred: " + error.message });
    }
};

// UPDATE user
const updateUser = async (req, res) => {
    const username = req.params.username;
    const updatedUserData = {
        // ... properties to update (e.g., password, email, etc.)
    }; // Make sure to sanitize/validate input!

    try {
        const db = getDb();
        const response = await db.collection("users").updateOne(
            { username },
            { $set: updatedUserData }
        );


        if (response.modifiedCount > 0) {
            res.status(200).json({ message: "User updated successfully." });
        } else {
            res.status(404).json({ error: "User not found or no changes made." });
        }

    } catch (error) {
        res.status(500).json({ error: "An error occurred: " + error.message });
    }
};


// DELETE user
const deleteUser = async (req, res) => {
    const username = req.params.username;

    try {
        const db = getDb();
        const response = await db.collection("users").deleteOne({ username });

        if (response.deletedCount > 0) {
            res.status(200).json({ message: "User deleted successfully." });
        } else {
            res.status(404).json({ error: "User not found." });
        }
    } catch (error) {
        res.status(500).json({ error: "An error occurred: " + error.message });
    }
};


module.exports = {
    createUser,
    loginUser,
    logoutUser,
    getUserByUsername,
    updateUser,
    deleteUser,
};