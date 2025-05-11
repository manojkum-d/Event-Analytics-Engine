import { ResponseObject, ResponsePayload } from './interface/index';

/**
 * Utility function to create a response object.
 * @param {ResponsePayload} payload - The payload for the response.
 * @returns {ResponseObject} The response object.
 */
export const httpResponse = ({
  status = 200,
  message = 'Success',
  data = null,
}: ResponsePayload): ResponseObject => {
  return { status, message, data };
};
