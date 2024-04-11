const objectToClassNames = (obj: { [key: string]: unknown }): string[] => {
  const output: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value) {
      output.push(key);
    }
  }
  return output;
};

type ClassNameCandidate =
  // positive matches
  | string
  | { [key: string]: unknown }
  // stuff that we want to ignore
  | boolean
  | number
  | undefined
  | null;

export const classNames = (...classes: ClassNameCandidate[]) => {
  let output: string[] = [];

  for (const candidate of classes) {
    if (!candidate) {
      continue;
    }

    if (typeof candidate === "string") {
      output.push(candidate);
    }

    if (typeof candidate === "object") {
      output = output.concat(objectToClassNames(candidate));
    }
  }

  return output.join(" ");
};
