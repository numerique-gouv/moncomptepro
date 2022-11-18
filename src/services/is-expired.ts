export const isExpired = (
  emittedDate: Date | null,
  expirationDurationInMinutes: number
) => {
  if (!(emittedDate instanceof Date)) {
    return true;
  }

  const nowDate = new Date();

  return (
    nowDate.getTime() - emittedDate.getTime() >
    expirationDurationInMinutes * 60e3
  );
};
