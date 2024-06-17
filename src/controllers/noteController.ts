import type { Request, Response } from "express";
import Note, { INote } from "../models/note";
import { Types } from "mongoose";

type NoteParams = {
  noteId: Types.ObjectId;
};

export class NoteController {
  static createNote = async (req: Request<{}, {}, INote>, res: Response) => {
    const { content } = req.body;
    const note = new Note();
    note.content = content;
    note.createdBy = req.user.id;
    note.task = req.task.id;

    req.task.notes.push(note.id);

    try {
      await Promise.allSettled([req.task.save(), note.save()]);
      res.status(201).json({ message: "Nota creada exitosamente" });
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static getTasksNotes = async (req: Request, res: Response) => {
    try {
      const notes = await Note.find({ task: req.task.id });
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };

  static removeNote = async (req: Request<NoteParams>, res: Response) => {
    try {
      const { noteId } = req.params;
      const note = await Note.findById(noteId);

      if (!note) {
        const error = new Error("Nota no encontrada");
        return res.status(404).json({ error: error.message });
      }

      if (note.createdBy.toString() !== req.user.id.toString()) {
        const error = new Error("Acción no válida");
        return res.status(409).json({ error: error.message });
      }

      req.task.notes = req.task.notes.filter(
        (note) => note.toString() !== noteId.toString()
      );

      await Promise.allSettled([note.deleteOne(), req.task.save()]);
      res.json({ message: "Nota eliminada exitosamente" });
    } catch (error) {
      res.status(500).json({ error: "Error interno. Intente más tarde" });
    }
  };
}
