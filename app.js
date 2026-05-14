import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// The API key stays on the server so it is not visible in browser JavaScript.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.use(express.static("public"));
app.use(express.json());

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

  if (
    !process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY === "your_api_key_here"
  ) {
    return res.status(500).json({
      error: "Missing GEMINI_API_KEY in the .env file.",
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

app.listen(port, function () {
  console.log("Digital Grimoire server is running at http://localhost:" + port);
});
