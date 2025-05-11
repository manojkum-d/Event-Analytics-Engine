/**
 * Helper method to check if an IP is in a CIDR range
 * Simple implementation that works for most cases
 */
export const isIpInCidr = (ip: string, cidr: string): boolean => {
  // Simple implementation - in production you would use a proper IP library
  if (!cidr.includes('/')) return false;

  const [range, bits] = cidr.split('/');
  const mask = parseInt(bits, 10);

  // Convert IP addresses to integers
  const ipInt = ipToInt(ip);
  const rangeInt = ipToInt(range);

  // Create a bit mask based on CIDR prefix
  const maskInt = ~((1 << (32 - mask)) - 1);

  // Check if IP is in range
  return (ipInt & maskInt) === (rangeInt & maskInt);
};

/**
 * Helper method to convert an IP to integer
 */
export const ipToInt = (ip: string): number => {
  return ip.split('.').reduce((int, octet) => (int << 8) + parseInt(octet, 10), 0) >>> 0;
};
