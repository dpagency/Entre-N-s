// Move only the scrollable content pane, leaving the dialog and page in place.
export function revealChannelFeedback(feedback: HTMLElement | null) {
  if (!feedback) return;
  feedback.focus({ preventScroll: true });
  let scroller = feedback.parentElement;
  while (scroller) {
    if (/(auto|scroll)/.test(getComputedStyle(scroller).overflowY) && scroller.scrollHeight > scroller.clientHeight) {
      scroller.scrollTop += feedback.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 16;
      return;
    }
    scroller = scroller.parentElement;
  }
}
