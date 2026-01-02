import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import PDFParser from "pdf2json";
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGING_FACE_TOKEN);

// 1. PDF se text nikalne ka utility function
const extractTextFromPDF = (filePath) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);

    pdfParser.on("pdfParser_dataError", (err) => reject(err));
    pdfParser.on("pdfParser_dataReady", () => {
      const text = pdfParser.getRawTextContent();
      const decodedText = decodeURIComponent(text);
      resolve(decodedText);
    });

    pdfParser.loadPDF(filePath);
  });
};

// 2. Exported function jo sirf filePath lega (req, res nahi)
export const summarizePDF = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error("PDF file not found at path: " + filePath);
    }

    const text = await extractTextFromPDF(filePath);
    
    if (!text || text.trim().length < 20) {
      return "Report text extraction failed or PDF is empty.";
    }

    // AI Summarization Logic
    const response = await hf.chatCompletion({
      model: "meta-llama/Llama-3.2-1B-Instruct",
      messages: [
        {
          role: "system",
          content: "You are an AI medical assistant. Summarize the following pdf for the doctor conviniece to help him understand the patient better. The summarize must not be more than 4-5 lines"
        },
        {
          role: "user",
          content: text.substring(0, 5000)
        }
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error("AI Summarization Error:", error.message);
    return "AI summary service unavailable right now.";
  }
};