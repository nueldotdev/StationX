/**
 * ValidationResult<T> is the result of a safe parse operation.
 */
type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: string[] };

/**
 * Base interface for all schema types.
 */
interface SXType<T> {
  parse(value: unknown): T;
  safeParse(value: unknown): ValidationResult<T>;
}

/**
 * Helper type for chainable optionals, nullable, default.
 */
type Chainable<T, S> = S & {
  optional: () => Chainable<T | undefined, S>;
  nullable: () => Chainable<T | null, S>;
  default: (val: T) => Chainable<T, S>;
};

/**
 * Helper to add .optional(), .nullable(), .default() as chainable methods.
 */
function withOptionals<T, S extends SXType<T>>(base: S): Chainable<T, S> {
  const wrapper: any = Object.assign(base, {
    optional() {
      const parent = this;
      return withOptionals({
        ...parent,
        parse(value: unknown) {
          if (value === undefined) return undefined as any;
          return parent.parse(value);
        },
        safeParse(value: unknown) {
          if (value === undefined) return { success: true, data: undefined as any };
          return parent.safeParse(value);
        },
      });
    },
    nullable() {
      const parent = this;
      return withOptionals({
        ...parent,
        parse(value: unknown) {
          if (value === null) return null as any;
          return parent.parse(value);
        },
        safeParse(value: unknown) {
          if (value === null) return { success: true, data: null as any };
          return parent.safeParse(value);
        },
      });
    },
    default(defaultValue: T) {
      const parent = this;
      return withOptionals({
        ...parent,
        parse(value: unknown) {
          if (value === undefined || value === null) return defaultValue;
          return parent.parse(value);
        },
        safeParse(value: unknown) {
          if (value === undefined || value === null)
            return { success: true, data: defaultValue };
          return parent.safeParse(value);
        },
      });
    },
  });

  return wrapper;
}

/**
 * String schema
 */
type StringSchema = Chainable<string, SXType<string>> & {
  email: () => StringSchema;
  minLength: (n: number) => StringSchema;
  maxLength: (n: number) => StringSchema;
  length: (n: number) => StringSchema;
  regex: (re: RegExp, msg?: string) => StringSchema;
};

function createStringType(): StringSchema {
  const base: any = {
    parse(value: unknown) {
      if (typeof value !== "string") throw new Error("Expected string");
      return value;
    },
    safeParse(value: unknown) {
      try {
        return { success: true, data: this.parse(value) };
      } catch (err: any) {
        return { success: false, errors: [err.message] };
      }
    },
    email() {
      const parent = this;
      return withOptionals({
        ...parent,
        parse(value: unknown) {
          const str = parent.parse(value);
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) throw new Error("Invalid email");
          return str;
        },
      });
    },
    minLength(min: number) {
      const parent = this;
      return withOptionals({
        ...parent,
        parse(value: unknown) {
          const str = parent.parse(value);
          if (str.length < min) throw new Error(`String must have at least ${min} characters`);
          return str;
        },
      });
    },
    maxLength(max: number) {
      const parent = this;
      return withOptionals({
        ...parent,
        parse(value: unknown) {
          const str = parent.parse(value);
          if (str.length > max) throw new Error(`String must have at most ${max} characters`);
          return str;
        },
      });
    },
    length(len: number) {
      const parent = this;
      return withOptionals({
        ...parent,
        parse(value: unknown) {
          const str = parent.parse(value);
          if (str.length !== len) throw new Error(`String must have exactly ${len} characters`);
          return str;
        },
      });
    },
    regex(re: RegExp, message = "String does not match pattern") {
      const parent = this;
      return withOptionals({
        ...parent,
        parse(value: unknown) {
          const str = parent.parse(value);
          if (!re.test(str)) throw new Error(message);
          return str;
        },
      });
    },
  };

  return withOptionals(base);
}

/**
 * Number schema
 */
type NumberSchema = Chainable<number, SXType<number>> & {
  min: (n: number) => NumberSchema;
  max: (n: number) => NumberSchema;
  int: () => NumberSchema;
  positive: () => NumberSchema;
  negative: () => NumberSchema;
};

function createNumberType(): NumberSchema {
  const base: any = {
    parse(value: unknown) {
      if (typeof value !== "number" || isNaN(value)) throw new Error("Expected number");
      return value;
    },
    safeParse(value: unknown) {
      try {
        return { success: true, data: this.parse(value) };
      } catch (err: any) {
        return { success: false, errors: [err.message] };
      }
    },
    min(n: number) {
      const parent = this;
      return withOptionals({
        ...parent,
        parse(value: unknown) {
          const num = parent.parse(value);
          if (num < n) throw new Error(`Must be >= ${n}`);
          return num;
        },
      });
    },
    max(n: number) {
      const parent = this;
      return withOptionals({
        ...parent,
        parse(value: unknown) {
          const num = parent.parse(value);
          if (num > n) throw new Error(`Must be <= ${n}`);
          return num;
        },
      });
    },
    int() {
      const parent = this;
      return withOptionals({
        ...parent,
        parse(value: unknown) {
          const num = parent.parse(value);
          if (!Number.isInteger(num)) throw new Error("Expected integer");
          return num;
        },
      });
    },
    positive() {
      const parent = this;
      return withOptionals({
        ...parent,
        parse(value: unknown) {
          const num = parent.parse(value);
          if (num <= 0) throw new Error("Expected positive");
          return num;
        },
      });
    },
    negative() {
      const parent = this;
      return withOptionals({
        ...parent,
        parse(value: unknown) {
          const num = parent.parse(value);
          if (num >= 0) throw new Error("Expected negative");
          return num;
        },
      });
    },
  };
  return withOptionals(base);
}

/**
 * Boolean schema
 */
type BooleanSchema = Chainable<boolean, SXType<boolean>>;

function createBooleanType(): BooleanSchema {
  const base: any = {
    parse(value: unknown) {
      if (typeof value !== "boolean") throw new Error("Expected boolean");
      return value;
    },
    safeParse(value: unknown) {
      try {
        return { success: true, data: this.parse(value) };
      } catch (err: any) {
        return { success: false, errors: [err.message] };
      }
    },
  };
  return withOptionals(base);
}

/**
 * Date schema
 */
type DateSchema = Chainable<Date, SXType<Date>> & {
  min: (d: Date) => DateSchema;
  max: (d: Date) => DateSchema;
};

function createDateType(): DateSchema {
  const base: any = {
    parse(value: unknown) {
      const d = new Date(value as any);
      if (isNaN(d.getTime())) throw new Error("Invalid date");
      return d;
    },
    safeParse(value: unknown) {
      try {
        return { success: true, data: this.parse(value) };
      } catch (err: any) {
        return { success: false, errors: [err.message] };
      }
    },
    min(minDate: Date) {
      const parent = this;
      return withOptionals({
        ...parent,
        parse(value: unknown) {
          const d = parent.parse(value);
          if (d < minDate) throw new Error(`Date must be >= ${minDate.toISOString()}`);
          return d;
        },
      });
    },
    max(maxDate: Date) {
      const parent = this;
      return withOptionals({
        ...parent,
        parse(value: unknown) {
          const d = parent.parse(value);
          if (d > maxDate) throw new Error(`Date must be <= ${maxDate.toISOString()}`);
          return d;
        },
      });
    },
  };
  return withOptionals(base);
}

/**
 * Array schema
 */
type ArraySchema<T> = Chainable<T[], SXType<T[]>> & {
  minLength: (n: number) => ArraySchema<T>;
  maxLength: (n: number) => ArraySchema<T>;
  length: (n: number) => ArraySchema<T>;
};

function createArrayType<T>(itemType: SXType<T>): ArraySchema<T> {
  const base: any = {
    parse(value: unknown) {
      if (!Array.isArray(value)) throw new Error("Expected array");
      return value.map((v) => itemType.parse(v));
    },
    safeParse(value: unknown) {
      try {
        return { success: true, data: this.parse(value) };
      } catch (err: any) {
        return { success: false, errors: [err.message] };
      }
    },
    minLength(min: number) {
      const parent = this;
      return withOptionals({
        ...parent,
        parse(value: unknown) {
          const arr = parent.parse(value);
          if (arr.length < min) throw new Error(`Array must have at least ${min} items`);
          return arr;
        },
      });
    },
    maxLength(max: number) {
      const parent = this;
      return withOptionals({
        ...parent,
        parse(value: unknown) {
          const arr = parent.parse(value);
          if (arr.length > max) throw new Error(`Array must have at most ${max} items`);
          return arr;
        },
      });
    },
    length(len: number) {
      const parent = this;
      return withOptionals({
        ...parent,
        parse(value: unknown) {
          const arr = parent.parse(value);
          if (arr.length !== len) throw new Error(`Array must have exactly ${len} items`);
          return arr;
        },
      });
    },
  };
  return withOptionals(base);
}

/**
 * Object schema
 */
type ObjectSchema<T extends Record<string, SXType<any>>> = Chainable<
  { [K in keyof T]: ReturnType<T[K]["parse"]> },
  SXType<{ [K in keyof T]: ReturnType<T[K]["parse"]> }>
>;

function createObjectType<T extends Record<string, SXType<any>>>(
  shape: T
): ObjectSchema<T> {
  const base: any = {
    parse(obj: unknown) {
      if (typeof obj !== "object" || obj === null) throw new Error("Expected object");
      const out: any = {};
      for (const key in shape) {
        try {
          out[key] = shape[key].parse((obj as any)[key]);
        } catch (err: any) {
          throw new Error(`Invalid field '${key}': ${err.message}`);
        }
      }
      return out;
    },
    safeParse(obj: unknown) {
      try {
        return { success: true, data: this.parse(obj) };
      } catch (err: any) {
        return { success: false, errors: [err.message] };
      }
    },
  };
  return withOptionals(base);
}

/**
 * Main sx builder
 */
export const sx = {
  string: createStringType,
  number: createNumberType,
  boolean: createBooleanType,
  date: createDateType,
  array: createArrayType,
  object: createObjectType,
  schema: createObjectType,
};