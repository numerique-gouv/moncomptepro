export const epochTime = (date = new Date()) =>
  Math.floor(date.getTime() / 1000);

export default epochTime;
