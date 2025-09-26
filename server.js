const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = 3001; // Different port from your Vite dev server

app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

app.post('/api/generate-report', async (req, res) => {
  try {
    const { metrics, note } = req.body;

    if (!metrics) {
      return res.status(400).json({ error: 'Metrics data is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Generate a clinical-style report based on the following motor skills assessment data.
      Explain the results, potential clinical implications, and recommended next steps in plain English for a patient.

      Metrics:
      - Finger Taps: ${metrics.fingerTaps}
      - Test Duration: ${metrics.testDuration.toFixed(1)}s
      - Tap Rate: ${metrics.tapRate.toFixed(2)} taps/sec
      - Coordination Score: ${metrics.coordinationScore}%
      - Movement Quality (0-100): ${metrics.movementQuality}
      - Estimated Tremor Frequency: ${metrics.tremorFreq.toFixed(2)} Hz
      - Tremor Amplitude (normalized): ${metrics.tremorAmpPercent.toFixed(3)}%

      Patient Note: ${note}

      Structure the report with the following sections:
      1.  **Summary of Results**: Briefly explain what each metric means and the patient's score.
      2.  **Interpretation**: What do these results suggest about the patient's motor function?
      3.  **Recommendations**: What are the suggested next steps? (e.g., "Consult a neurologist for a formal evaluation," "Repeat the test in 3 months," "No immediate concerns.").
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ report: text });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
