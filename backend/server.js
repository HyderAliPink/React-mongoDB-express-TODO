import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Todo from "./models/todo.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://todo-frontend-jrah.onrender.com"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB connection error:", err));

app.get("/todos", async (req, res) => {
  try {
    res.json(await Todo.find().sort({ createdAt: -1 }));
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/todos", async (req, res) => {
  const text = req.body.text?.trim();
  if (!text) return res.status(400).json({ message: "Text required" });

  try {
    res.status(201).json(await Todo.create({ text, completed: false }));
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

app.patch("/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    todo ? res.json(todo) : res.status(404).json({ message: "Todo not found" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    todo ? res.json({ message: "Deleted" }) : res.status(404).json({ message: "Todo not found" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
