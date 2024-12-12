const { getDb } = require("../database/connect");

const createUser = async (req, res) => {
    const user = {
        username: req.body.username,
        password: req.body.password,
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

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const db = getDb();
        const user = await db.collection("users").findOne({ username });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" }); // Unauthorized
        }

        if (user.password !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }


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
            res.clearCookie('connect.sid');
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
        username: req.body.username,
        password: req.body.password,
    };

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

const getSession = (req) => {
    return req.session.user;
}

module.exports = {
    createUser,
    loginUser,
    logoutUser,
    getUserByUsername,
    updateUser,
    deleteUser,
    getSession
};