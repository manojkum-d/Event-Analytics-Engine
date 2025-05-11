import { Request, Response, NextFunction } from 'express';
import axios, { AxiosError } from 'axios';
import { HttpError } from 'http-errors';
// import { logger } from '../../config/logger';

const { NODE_ENV } = process.env;

export const exceptionHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error from exception handler', err); // Log the error stack trace

  // Handle Axios errors (e.g., errors from third-party API calls)
  if (err instanceof axios.AxiosError) {
    const axiosError = err as AxiosError;
    if (axiosError.response) {
      let axiosMessage = '';
      const responseData: any = axiosError.response.data;

      if ('message' in responseData) {
        axiosMessage = responseData.message;
      } else if ('msg' in responseData) {
        axiosMessage = responseData.msg;
      } else {
        axiosMessage = 'Internal server error';
      }

      const responseJson = {
        status: axiosError.response.status,
        message:
          NODE_ENV === 'local'
            ? `Error from third-party API: ${axiosMessage}`
            : axiosMessage.replace('Error from: ', ''),
        data: axiosError.response.data,
        config: {},
      };

      if (NODE_ENV === 'local') {
        responseJson.config = {
          headers: axiosError.config?.headers,
          params: axiosError.config?.params,
          body: axiosError.config?.data,
          baseURL: axiosError.config?.baseURL,
          url: axiosError.config?.url,
          method: axiosError.config?.method,
        };
      }
      // The request was made and the server responded with a status code
      res.status(axiosError.response.status).json(responseJson);
    } else {
      // The request was made but no response was received
      res.status(500).json({
        status: 500,
        message: 'Internal server error',
      });
    }
  }
  // Handle HTTP errors created using http-errors
  else if (err instanceof HttpError) {
    const httpError = err as HttpError;
    res.status(httpError.status).json({
      status: httpError.status,
      message: httpError.message.replace('Error from: ', ''),
    });
  }
  // Handle custom database connection errors
  else if (err.name === 'DatabaseConnectionError') {
    res.status(500).json({
      status: 500,
      message: 'Database connection error',
    });
  }
  // Handle Redis errors
  else if (err.name === 'RedisError') {
    res.status(500).json({
      status: 500,
      message: 'Redis error',
    });
  }
  // Default error handling for other types of errors
  else {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode || 500).json({
      status: statusCode || 500,
      message: err.message.replace('Error from: ', ''),
      stack: process.env.NODE_ENV === 'production' ? '' : err.stack,
    });
  }
};
