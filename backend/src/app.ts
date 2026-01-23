import express from 'express';

const app = express();

app.get('/api/test', async (req, res) => {
    res.status(200).json({ message: "Success! Connection established." });
});

const PORT = 3001;
app.listen(PORT, async () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});