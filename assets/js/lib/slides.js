// Index arithmetic for the slideshow: step forwards or backwards and wrap around.
export const wrapIndex = (i, n, step) => (((i + step) % n) + n) % n;
