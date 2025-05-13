import moment from 'moment';

/**
 * Parses and normalizes date range from query parameters
 */
export const parseDateRange = (startDate?: string, endDate?: string) => {
  const parsedEndDate = endDate ? moment(endDate).endOf('day') : moment().endOf('day');
  const parsedStartDate = startDate
    ? moment(startDate).startOf('day')
    : moment(parsedEndDate).subtract(7, 'days').startOf('day');

  return {
    startDate: parsedStartDate,
    endDate: parsedEndDate,
  };
};
