export const isExpiredInSeconds = (
  emittedDate: Date | null,
  expirationDurationInSeconds: number,
) => {
  if (!(emittedDate instanceof Date)) {
    return true;
  }

  const nowDate = new Date();

  return (
    nowDate.getTime() - emittedDate.getTime() >
    expirationDurationInSeconds * 1e3
  );
};

export const isExpired = (
  emittedDate: Date | null,
  expirationDurationInMinutes: number,
) => {
  return isExpiredInSeconds(emittedDate, expirationDurationInMinutes * 60);
};
