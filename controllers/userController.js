const { getDb } = require("../database/connect");
const jwt = require('jsonwebtoken');
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;

const createUser = async (req, res) => {
    const user = {
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
    }

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

        const token = jwt.sign({ id: user._id, username: user.username }, secretKey, { expiresIn: '2h' });

        req.session.user = user;
        res.status(200).json({ message: "Login successful", user: { username: user.username }, token });

    } catch (error) {
        res.status(500).json({ error: "An error occurred: " + error.message });
    }
};

// LOGOUT user
const logoutUser = async (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) {
                // console.error("Error destroying session:", err);
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
    const searchUsername = req.params.username;
    const username = req.user.username;

    if (searchUsername !== username) {
        return res.status(401).json({ error: "Unauthorized: Requesting someone elses data" });
    }

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
    const searchUsername = req.params.username;

    if (searchUsername !== username) {
        return res.status(401).json({ error: "Unauthorized: Requesting someone elses data" });
    }
    const updatedUserData = {
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
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
    const searchUsername = req.params.username;
    const username = req.user.username;

    if (searchUsername !== username) {
        return res.status(401).json({ error: "Unauthorized" });
    }

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

const authUserCallback = async ({ query: { code } }, res) => {
    const body = {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI
    }

    try {
        const fetch = (await import('node-fetch')).default;

        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error:", errorData);
            return res.status(response.status).json({ message: 'GitHub OAuth Error: ' + errorData.error_description });
        }
        const data = await response.json();
        const access_token = data.access_token;

        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `token ${access_token}`
            }
        });

        if (!userResponse.ok) {
            const errorData = await userResponse.json();
            console.error("Error:", errorData);
            return res.status(userResponse.status).json({ message: 'GitHub User Error: ' + errorData.message });
        }

        const user = await userResponse.json();
        const token = jwt.sign({ id: user.id, username: user.login }, secretKey, { expiresIn: '2h' });
        res.token = token;

        res.status(200).json({ message: "Login successful", user: { id: user.id, username: user.login }, token });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: 'GitHub OAuth Error: ' + error.message });
    }
}

module.exports = {
    createUser,
    loginUser,
    logoutUser,
    getUserByUsername,
    updateUser,
    deleteUser,
    getSession,
    authUserCallback,
};