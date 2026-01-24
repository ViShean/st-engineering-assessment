import express from 'express';
import cors from 'cors';
import commentRoutes from './routes/commentRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import {initializeMetadata} from "./db/index.js";

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/comments', commentRoutes);

// Global Error Handler from /middleware
app.use(errorHandler);

const PORT = 3001;

initializeMetadata();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});