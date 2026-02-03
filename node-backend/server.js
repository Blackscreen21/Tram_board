import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = process.env.PORT || 3000;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/api/hello', (req, res) => {
    res.json({ message: "Hello from Node!" });
});

app.use(express.static(path.join(__dirname, '../angular-frontend/dist/angular-frontend/browser')));


app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../angular-frontend/dist/angular-frontend/browser/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});