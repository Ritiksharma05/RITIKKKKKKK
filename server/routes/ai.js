const express = require('express');
const router = express.Router();

router.post('/chat', async (req, res) => {
  const { userText, systemPrompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return res.json({ text: "I'm your AI Concierge! (Note: Gemini API Key is missing in the backend .env file. Please add it to enable real responses.)" });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userText }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm recalibrating. Please try again.";
    res.json({ text });
  } catch (err) {
    console.error('AI Route Error:', err);
    res.status(500).json({ error: 'Failed to communicate with AI' });
  }
});

module.exports = router;
