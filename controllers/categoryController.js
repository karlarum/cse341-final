const { getDb } = require("../database/connect");
const { ObjectId } = require("mongodb");

const getCategories = async (req, res) => {
  try {
    const db = getDb();
    const categoryCollection = db.collection("category");
    const count = await categoryCollection.countDocuments();
    console.log("Number of documents in Categorys collection:", count);

    // Fetch all Categorys from the collection
    const categories = await categoryCollection.find().toArray();

    // Respond with the fetched Categorys
    res.status(200).json(categories);
  } catch (error) {
    // console.error("Error fetching Categories:", error);
    res.status(500).json({ error: "Failed to fetch Categories" });
  }
};

// Function to get a single Category by ID
const getCategoryById = async (req, res) => {
  const objectId = new ObjectId(req.params.id);

  // Check if the contactId is a valid ObjectId
  if (!ObjectId.isValid(objectId)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  try {
    const db = getDb();
    const categoryCollection = db.collection("category");
    const category = await categoryCollection.findOne({ _id: objectId });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    // console.error("Error fetching Category:", error);
    res.status(500).json({ error: "Failed to fetch Category" });
  }
};

/* CREATE Category */
const createCategory = async (req, res) => {
  const category = {
    name: req.body.name,
    description: req.body.description,
    parent_id: req.body.parent_id || null,
  };
  try {
    const db = getDb();
    const response = await db.collection("category").insertOne(category);
    if (response.acknowledged) {
      res.status(201).json({ CategoryId: response.insertedId });
    } else {
      res.status(500).json({ error: "Failed to create the Category." });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred: " + error.message });
  }
};

/* UPDATE Category */
const updateCategory = async (req, res) => {
  const objectId = new ObjectId(req.params.id);
  console.log("Converted categoryId:", objectId);

  const updatedCategory = {
    name: req.body.name,
    description: req.body.description,
    parent_id: req.body.parent_id || null,
  };

  try {
    const db = getDb();
    const categoryCollection = db.collection("category");
    const response = await categoryCollection.updateOne(
      { _id: objectId },
      { $set: updatedCategory }
    );

    console.log("response", response);

    if (response.matchedCount === 0) {
      // If no document is found
      return res.status(404).json({ error: "No Category found with that ID." });
    }

    if (response.modifiedCount > 0) {
      return res
        .status(200)
        .json({ message: "Category updated successfully." });
    } else {
      // If no document was modified, but it was found
      return res.status(400).json({ error: "Category data was not changed." });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred: " + error.message });
  }
};

/* DELETE Category */
const deleteCategory = async (req, res) => {
  const categoryId = req.params.id;

  try {
    const db = getDb();
    const response = await db
      .collection("category")
      .deleteOne({ _id: categoryId });
    if (response.deletedCount > 0) {
      res.status(200).json({ message: "Category deleted successfully." });
    } else {
      res.status(404).json({ error: "No Category found with that ID." });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred: " + error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
