import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from './shared/config/passportConfig';
import { exceptionHandler } from './middlewares/exceptionhandler';
import { setupSwagger } from './middlewares/swagger';
import router from './routes';
import { envConfig } from './shared/config/envConfig';

const app = express();

app.use(cors());
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: envConfig.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: envConfig.nodeEnv === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Setup Swagger documentation
setupSwagger(app);

app.use('/api/v1', router);

app.use(exceptionHandler);

export default app;
