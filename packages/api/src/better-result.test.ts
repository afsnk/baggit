import { Result } from "better-result";

const result = Result.ok(42);
console.log(result.value); // 42

const error = Result.err("something went wrong");
console.log(error.error); // "something went wrong"

console.log("✅ better-result is installed correctly!");
