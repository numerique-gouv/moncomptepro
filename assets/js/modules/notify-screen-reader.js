/** we use some trickery to be able to notify screen reader users in real time
 * by updating an aria-live region that is placed at the very bottom at the DOM.
 *
 * this region is hidden by default and is only shown when a message is set.
 * this kind of lets us notify people without them also hearing the message when
 * they navigate the page.
 */
let screenReaderTimeout = null;

export const notifyScreenReader = (message) => {
  const screenReaderLiveElement = document.getElementById("aria-live-message");
  if (!screenReaderLiveElement) {
    return;
  }
  screenReaderLiveElement.textContent = message;
  clearTimeout(screenReaderTimeout);
  screenReaderTimeout = setTimeout(() => {
    screenReaderLiveElement.textContent = "";
  }, 10000);
  return screenReaderTimeout;
};
