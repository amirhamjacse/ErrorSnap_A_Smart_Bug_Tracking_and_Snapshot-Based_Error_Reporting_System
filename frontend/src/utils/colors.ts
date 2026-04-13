import { CustomColorNames } from "theme/index";

export const cssColor = (name: keyof CustomColorNames) => `var(--${name})`;
