const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: "https://www.linkedin.com", // Allow requests
    methods: "GET,POST",
    allowedHeaders: "Content-Type",
  })
);

const generateEmail = async (email) => {
  const genAI = new GoogleGenerativeAI(
    "AIzaSyAEVurs50EdY7oP1FPfW_RLTzU1C-wrvyk"
  );
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `write an email for this ${email}, use the name from email. and mention the company name by email`;
  const result = await model.generateContent(prompt);
  return result;
};

// Middleware
app.use(bodyParser.json());

// API Endpoint for Handling Email
app.post("/api/email", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Validate email format (validation)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid or missing email" });
  }

  try {
    await generateEmail(email); // Call the generateEmail function

    res.json({
      success: true,
      email,
      connectionMessage: "Message generated successfully",
    });
  } catch (error) {
    console.error("Error generating connection message:", error.message, error);
    res.status(500).json({ error: "Failed to generate connection message" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
