import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import prisma from "./db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const geminiApiKey = process.env.GEMINI_API_KEY
  ? process.env.GEMINI_API_KEY.trim()
  : "";

// The API key stays on the server so it is not visible in browser JavaScript.
const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
});

app.use(express.static("public"));
app.use(express.json());

function geminiKeyIsMissing() {
  return !geminiApiKey || geminiApiKey.includes("your_");
}

function geminiKeyErrorMessage() {
  return "Missing or placeholder GEMINI_API_KEY in the .env file.";
}

function parseTeacherResponse(responseText) {
  const cleanedText = responseText
    .replace("```json", "")
    .replace("```", "")
    .trim();

  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    return {
      title: "Teacher Response",
      summary: cleanedText,
      keyPoints: [],
      reflection: "",
      studyNote: "For deeper study, verify this with academic sources, primary texts, and community voices.",
    };
  }
}

async function saveAiInteraction(toolName, prompt, response, details) {
  try {
    await prisma.aiInteraction.create({
      data: {
        toolName: toolName,
        prompt: prompt,
        response: response,
        theme: details.theme,
        style: details.style,
        tradition: details.tradition,
      },
    });
  } catch (error) {
    // AI logging is helpful, but the user should still get an answer
    // if the database log fails during early setup.
    console.warn("AI interaction was not saved:", error.message);
  }
}

app.get("/api/content-pages", async function (req, res) {
  try {
    const pages = await prisma.contentPage.findMany({
      where: { isLive: true },
      orderBy: { title: "asc" },
    });

    res.json(pages);
  } catch (error) {
    res.status(500).json({
      error: "Content pages could not be loaded.",
    });
  }
});

app.get("/api/grimoire-entries", async function (req, res) {
  try {
    const entries = await prisma.grimoireEntry.findMany({
      where: { isLive: true },
      orderBy: [{ category: "asc" }, { title: "asc" }],
    });

    res.json(entries);
  } catch (error) {
    res.status(500).json({
      error: "Grimoire entries could not be loaded.",
    });
  }
});

app.get("/api/products", async function (req, res) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      error: "Products could not be loaded.",
    });
  }
});

app.get("/api/social-links", async function (req, res) {
  try {
    const links = await prisma.socialLink.findMany({
      orderBy: { label: "asc" },
    });

    res.json(links);
  } catch (error) {
    res.status(500).json({
      error: "Social links could not be loaded.",
    });
  }
});

// /api/scribe receives a phrase from the frontend, sends it to Gemini,
// and returns Gemini's rewritten text as JSON.
app.post("/api/scribe", async function (req, res) {
  const phrase = req.body.phrase;
  const style = req.body.style;
  const theme = req.body.theme;

  if (!phrase) {
    return res.status(400).json({
      error: "Please enter a phrase first.",
    });
  }

  if (geminiKeyIsMissing()) {
    return res.status(500).json({
      error: geminiKeyErrorMessage(),
    });
  }

  const prompt =
    "Rewrite this phrase in a mystical digital grimoire style.\n" +
    "Keep it short, readable, and fictional.\n" +
    "Do not claim it is a historically accurate ancient translation.\n" +
    "Selected style: " +
    style +
    "\n" +
    "Selected site theme: " +
    theme +
    "\n" +
    "Phrase: " +
    phrase;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    await saveAiInteraction("scribe", prompt, response.text, {
      theme: theme,
      style: style,
      tradition: null,
    });

    res.json({
      result: response.text,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "The scribe could not answer right now.",
    });
  }
});

// /api/teacher receives a study question from the frontend, asks Gemini
// for a careful educational response, and sends the answer back as JSON.
app.post("/api/teacher", async function (req, res) {
  const question = req.body.question;
  const tradition = req.body.tradition;
  const theme = req.body.theme;

  if (!question) {
    return res.status(400).json({
      error: "Please ask the teacher a question first.",
    });
  }

  if (geminiKeyIsMissing()) {
    return res.status(500).json({
      error: geminiKeyErrorMessage(),
    });
  }

  const prompt =
    "You are the Gemini Teacher for a website called My Digital Grimoire.\n" +
    "Answer as an educational spiritual studies guide with a light mystical tone.\n" +
    "Return only valid JSON. Do not use Markdown. Do not wrap the JSON in code fences.\n" +
    "Use this exact JSON shape:\n" +
    "{\"title\":\"Short answer title\",\"summary\":\"2-3 sentence direct answer\",\"keyPoints\":[\"point one\",\"point two\",\"point three\"],\"reflection\":\"Short mystical but grounded reflection\",\"studyNote\":\"Reminder to verify with academic, primary, and community sources\"}\n" +
    "Keep the answer concise and readable.\n" +
    "Do not invent citations, pretend to be a final authority, claim spiritual initiation, or claim perfect historical accuracy.\n" +
    "Selected tradition or study area: " +
    tradition +
    "\n" +
    "Selected site theme: " +
    theme +
    "\n" +
    "Question: " +
    question;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const teacherAnswer = parseTeacherResponse(response.text);
    const answerForLog = JSON.stringify(teacherAnswer);

    await saveAiInteraction("teacher", prompt, answerForLog, {
      theme: theme,
      style: null,
      tradition: tradition,
    });

    res.json({
      result: teacherAnswer,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "The teacher could not answer right now.",
    });
  }
});

app.listen(port, function () {
  console.log("Digital Grimoire server is running at http://localhost:" + port);
});
