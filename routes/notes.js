const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const NoteSchema = require("../models/NoteSchema");
const fetchUser = require("../middleware/fetchUser");

// path /notes/allnotes

router.get("/allnotes", fetchUser, async (req, res) => {
    try {
        const notes = await NoteSchema.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// path /notes/addnote

router.post("/addnote", fetchUser, [
    check('title', 'Enter a valid name of minimum of 5 char').isLength({ min: 3 }),
    check('description', 'enter description of atlist 2 char').isLength({ min: 5 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Taking the title, description, and tag from the request body
        const { title, description } = req.body;
        const note = await NoteSchema.create({
            title,
            description,
            user: req.user.id,
        });

        // const savedNote = await note.save();
        res.json(note);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
}
);

// path /notes/updatenote/:id

router.put("/updatenote/:id", fetchUser, async (req, res) => {
    try {
      const { title, description } = req.body;
      const newNote = {};
  
      if (title) {
        newNote.title = title;
      }
      if (description) {
        newNote.description = description;
      }
  
      const note = await NoteSchema.findById(req.params.id);
      if (!note) {
        return res.status(404).send("Not found");
      }
      if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Unauthorized");
      }
      const updateNote= await NoteSchema.findByIdAndUpdate(
        req.params.id,
        { $set: newNote },
        { new: true }
      );
      res.json({updateNote});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  });

// path /notes/deletenote/:id


router.delete("/deleteNote/:id", fetchUser, async (req, res) => {
    try {
      const note = await NoteSchema.findById(req.params.id);
      if (!note) {
        return res.status(404).send("Not found");
      }
      if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Unauthorized");
      }
     const deletednote= await NoteSchema.findByIdAndDelete(req.params.id);
      res.json({"Success":"the note has been deleted", note:deletednote});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  });

module.exports = router;
