import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function searchNotes(question: string, notes: any[], limit = 5) {
  const terms = question
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 2);

  return notes
    .map((note) => {
      const text = `${note.title} ${note.content}`.toLowerCase();

      const score = terms.reduce((total, term) => {
        const matches = text.match(new RegExp(`\\b${term}\\b`, "g"));
        return total + (matches ? matches.length : 0);
      }, 0);

      return {
        ...note,
        score,
      };
    })
    .filter((note) => note.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const question = body.question?.trim();

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          message: "Question is required",
        },
        { status: 400 }
      );
    }

    const notes = await prisma.note.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    if (notes.length === 0) {
      return NextResponse.json({
        success: true,
        answer: "You do not have any notes yet. Please create notes first.",
        sources: [],
      });
    }

    const matchedNotes = searchNotes(question, notes);

    if (matchedNotes.length === 0) {
      return NextResponse.json({
        success: true,
        answer: "I could not find relevant information in your notes.",
        sources: [],
      });
    }

    const notesContext = matchedNotes
      .map((note, index) => {
        return `Source ${index + 1}
Title: ${note.title}
Created At: ${note.createdAt}

Content:
${note.content}`;
      })
      .join("\n\n---\n\n");

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_CHAT_MODEL || "llama-3.1-8b-instant",
      messages: [
        {
            role: "system",
            content: `
                You are an AI notes assistant.

                Rules:
                - Answer using only the provided notes.
                - If the answer is not in the notes, say you could not find it.
                - Be concise and helpful.
                - Include source note titles at the end.
            `,
        },
        {
            role: "user",
            content: `
                Notes:
                    ${notesContext}

                Question:
                    ${question}
                `,
        },
      ],
      temperature: 0.2,
    });

    const answer =
      completion.choices[0]?.message?.content ||
      "I could not generate an answer.";

    return NextResponse.json({
      success: true,
      answer,
      sources: matchedNotes.map((note) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt,
      })),
    });
  } catch (error) {
    console.error("Ask AI failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Ask AI failed",
      },
      { status: 500 }
    );
  }
}