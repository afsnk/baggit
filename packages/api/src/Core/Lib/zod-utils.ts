// import type { z } from "elysia/";
import type { z as z4 } from "zod/v4";

export function toZodV4SchemaTyped<T extends z4.ZodTypeAny>(
  schema: T,
) {
  return schema as unknown as z4.ZodType<z4.infer<T>>;
}
