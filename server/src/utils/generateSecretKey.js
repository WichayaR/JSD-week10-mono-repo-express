import { randomBytes } from "crypto";

// generate random 64-byte secret key for JWT_SECRET in .env
console.log(randomBytes(64).toString("hex"));
