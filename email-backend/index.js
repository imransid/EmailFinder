require("dotenv").config(); // Load environment variables

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sgMail = require("@sendgrid/mail");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

// Configure SendGrid API Key
sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

// Configure CORS
app.use(
  cors({
    origin: "https://www.linkedin.com",
    methods: "GET,POST",
    allowedHeaders: "Content-Type",
  })
);

// Middleware for parsing JSON
app.use(bodyParser.json());

// Helper function to generate email content using Google Generative AI
const generateEmailContent = async (email) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `Write a personalized professional email for the recipient with the email address ${email}.\n
    The sender's name is "Imran", and the purpose of the email is to connect and collaborate with professionals or engineers.\n
    Use the recipient's name (if derivable from their email) and their company name (if apparent from the email domain).\n
    Maintain a formal yet approachable tone, emphasizing engineering collaboration.\n
    Conclude the email with the following signature block:\n
    ----------------\n
    Thanks & Regards,\n
    Imran Khan\n
    Senior Software Engineer\n
    \n
    Phone : +880 1620995203\n
    Email : imran.rafa@intellier.com\n
    Website : www.intellier.com\n
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating email content:", error.message);
    throw new Error("Failed to generate email content");
  }
};

// API Endpoint for handling email requests
app.post("/api/email", async (req, res) => {
  const { email } = req.body;

  // Validate email presence and format
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    // Generate email content
    const emailContent = await generateEmailContent(email);

    // Email message object
    const msg = {
      to: email,
      from: "emailofimran1992@gmail.com",
      subject: "Connection Request",
      text: emailContent,
      html: `<p>${emailContent}</p>`,
    };

    // Send email via SendGrid
    await sgMail.send(msg);
    console.log(`Email sent to ${email}`);

    res.json({
      success: true,
      email,
      message: "Email generated and sent successfully",
    });
  } catch (error) {
    console.error("Error processing email request:", error.message);
    res.status(500).json({ error: "Failed to process the email request" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
