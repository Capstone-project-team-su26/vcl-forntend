export function mockDelay(ms = 350) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
