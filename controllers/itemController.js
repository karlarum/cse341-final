const { getDb } = require("../database/connect");
const { ObjectId } = require("mongodb");

// GET ITEMS
const getItem = async (req, res) => {
  try {
    const db = getDb();
    const items = await db.collection("item").find({}).toArray();

    if (items.length > 0) {
      res.status(200).json(items);
    } else {
      res.status(404).json({ message: "No items found." });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred: " + error.message });
  }
};

// GET items by ID
const getItemById = async (req, res) => {
  const itemId = req.params.id;

  try {
    const db = getDb();
    const item = await db.collection("item").findOne({ _id: new ObjectId(itemId) });

    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ error: "Item not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred: " + error.message });
  }
};

// CREATE item
const createItem = async (req, res) => {
  const item = {
    name: req.body.name,
    userId: req.body.userId || null,
    categoryId: req.body.categoryId || null,
    coverageId: req.body.coverageId || null,
    purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : new Date(),
    purchasePrice: req.body.purchasePrice || 0,
    description: req.body.description || ""
  };

  try {
    const db = getDb();
    const response = await db.collection("item").insertOne(item);
    if (response.acknowledged) {
      res.status(201).json({ ItemID: response.insertedId });
    } else {
      res.status(500).json({ error: "Failed to create the item." });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred: " + error.message });
  }
};

// UPDATE item
const updateItem = async (req, res) => {
  const itemId = req.params.id;

  const updatedItem = {
    name: req.body.name,
    userId: req.body.userId || null,
    categoryId: req.body.categoryId || null,
    coverageId: req.body.coverageId || null,
    purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : new Date(),
    purchasePrice: req.body.purchasePrice || 0,
    description: req.body.description || ""
  };

  try {
    const db = getDb();
    const response = await db.collection("item").updateOne(
      { _id: new ObjectId(itemId) }, 
      { $set: updatedItem }
    );

    console.log("response", response);

    if (response.modifiedCount > 0) {
      res.status(200).json({ message: "Item updated successfully." });
    } else if (response.matchedCount > 0) {
      res.status(200).json({ message: "No changes made to the item." });
    } else {
      res.status(404).json({ error: "Item not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred: " + error.message });
  }
};

// DELETE item
const deleteItem = async (req, res) => {
  const itemId = req.params.id;

  try {
    const db = getDb();
    const response = await db.collection("item").deleteOne({ _id: new ObjectId(itemId) });

    if (response.deletedCount > 0) {
      res.status(200).json({ message: "Item deleted successfully." });
    } else {
      res.status(404).json({ error: "No item found with that ID." });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred: " + error.message });
  }
};

module.exports = {
  getItem,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};