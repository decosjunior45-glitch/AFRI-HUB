import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../utils/db";
import { authMiddleware } from "../middleware/authMiddleware";
import { Item } from "../types/item";

interface MongoItem extends Omit<Item, "_id"> {
  _id: ObjectId;
}

function serializeItem(item: MongoItem): Item {
  return {
    _id: item._id.toHexString(),
    title: item.title,
    description: item.description,
    completed: item.completed,
    countryCode: item.countryCode,
    userId: item.userId,
    createdAt: item.createdAt
  };
}

export const itemsRouter = Router();

itemsRouter.use(authMiddleware);

itemsRouter.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const db = await getDatabase();
    const items = await db
      .collection<MongoItem>("items")
      .find({ userId: req.user.userId, countryCode: req.user.countryCode })
      .toArray();
    res.json(items.map(serializeItem));
  } catch (error) {
    next(error);
  }
});

itemsRouter.get("/:id", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const db = await getDatabase();
    const item = await db.collection<MongoItem>("items").findOne({
      _id: new ObjectId(id),
      userId: req.user.userId,
      countryCode: req.user.countryCode
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(serializeItem(item));
  } catch (error) {
    next(error);
  }
});

itemsRouter.post("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const { title, description, completed } = req.body;
    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Title is required" });
    }

    const newItem: Omit<MongoItem, "_id"> = {
      title,
      description: description || "",
      completed: Boolean(completed),
      countryCode: req.user.countryCode,
      userId: req.user.userId,
      createdAt: new Date()
    };

    const db = await getDatabase();
    const result = await db.collection<MongoItem>("items").insertOne(newItem as MongoItem);
    const created = await db.collection<MongoItem>("items").findOne({ _id: result.insertedId });

    if (!created) {
      return res.status(500).json({ error: "Unable to create item" });
    }

    res.status(201).json(serializeItem(created));
  } catch (error) {
    next(error);
  }
});

itemsRouter.put("/:id", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const { title, description, completed } = req.body;
    const updateFields: Partial<MongoItem> = {};

    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (completed !== undefined) updateFields.completed = completed;

    const db = await getDatabase();
    await db.collection<MongoItem>("items").updateOne(
      { _id: new ObjectId(id), userId: req.user.userId, countryCode: req.user.countryCode },
      { $set: updateFields }
    );

    const updatedItem = await db.collection<MongoItem>("items").findOne({
      _id: new ObjectId(id),
      userId: req.user.userId,
      countryCode: req.user.countryCode
    });

    if (!updatedItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(serializeItem(updatedItem));
  } catch (error) {
    next(error);
  }
});

itemsRouter.delete("/:id", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const db = await getDatabase();
    const result = await db.collection<MongoItem>("items").deleteOne({
      _id: new ObjectId(id),
      userId: req.user.userId,
      countryCode: req.user.countryCode
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
