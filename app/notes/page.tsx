"use client";

import { useEffect, useState } from "react";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function fetchNotes() {
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();

      if (data.success) {
        setNotes(data.notes);
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addNote() {
    if (!title.trim() || !content.trim()) return;

    setCreating(true);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setNotes([data.note, ...notes]);
        setTitle("");
        setContent("");
      }
    } catch (error) {
      console.error("Failed to create note:", error);
    } finally {
      setCreating(false);
    }
  }

  async function deleteNote(id: string) {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setNotes(notes.filter((note) => note.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <p className="text-sm text-slate-400">Notes</p>
          <h1 className="mt-2 text-3xl font-bold">Manage your notes</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Create notes that your AI assistant can later use as context.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold">Create note</h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Example: Invoice Feature"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note here..."
                  rows={8}
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-slate-400"
                />
              </div>

              <button
                onClick={addNote}
                disabled={creating}
                className="w-full rounded-xl bg-white px-5 py-3 font-medium text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? "Saving..." : "Add Note"}
              </button>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Saved notes</h2>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-sm text-slate-300">
                {notes.length} notes
              </span>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
                Loading notes...
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <article
                    key={note.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold">{note.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Created at{" "}
                          {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        onClick={() => deleteNote(note.id)}
                        className="rounded-lg border border-red-900/60 px-3 py-2 text-sm text-red-300 transition hover:bg-red-950"
                      >
                        Delete
                      </button>
                    </div>

                    <p className="mt-4 leading-7 text-slate-300">
                      {note.content}
                    </p>
                  </article>
                ))}

                {notes.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
                    No notes yet. Create your first note.
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}