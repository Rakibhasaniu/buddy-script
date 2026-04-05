import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';

const app: Application = express();

// parsers
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ['http://localhost:3000'],
    credentials: true,
  }),
);

// routes
app.use('/api/v1', router);

app.get('/', (_req: Request, res: Response) => {
  res.send('BuddyScript API is running');
});

app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default app;
