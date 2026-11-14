// Ranat ek tuning: 21 bars in Thai 7-tone equal temperament.
export const RANAT_BARS = 21;

export const ranatFreq = (index, base = 392) => base * 2 ** (index / 7);
