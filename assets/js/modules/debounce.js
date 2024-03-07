export const debounce = (callback, wait) => {
  let timeoutId = null;
  const handler = (...args) => {
    handler.cancel();
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, wait);
  };
  handler.cancel = () => {
    window.clearTimeout(timeoutId);
  };
  return handler;
};
