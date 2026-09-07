/**
 * Script de seed — cria a conta de administrador padrão.
 * Executa com: node seed.js
 *
 * Requer: MONGODB_URI no ficheiro .env
 */

import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Carregar variáveis do .env
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key && !process.env[key]) {
      process.env[key] = rest.join("=").trim();
    }
  }
}

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI não está definida. Cria o ficheiro .env primeiro.");
  process.exit(1);
}

const counterSchema = new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } });
const CounterModel = mongoose.model("Counter", counterSchema);

async function nextId(name) {
  const doc = await CounterModel.findByIdAndUpdate(name, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return doc.seq;
}

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});
const UserModel = mongoose.model("User", userSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Ligado ao MongoDB.");

  //const existing = await UserModel.findOne({ email: "admin@gmin.edu.ao" });
  const existing = await UserModel.findOne({ email: "dev@gmin.edu.ao" });
  if (existing) {
    console.log("ℹ️  Conta de administrador já existe. A actualizar a senha...");
    //existing.passwordHash = await bcrypt.hash("admin2026", 10);
    existing.passwordHash = await bcrypt.hash("adeV32C", 10);
    existing.active = true;
    await existing.save();
  } else {
    const id = await nextId("users");
    const passwordHash = await bcrypt.hash("adeV32C", 10);
    await UserModel.create({ id, fullName: "Administrador", email: "dev@gmin.edu.ao", passwordHash, role: "admin", active: true });
  }

  console.log("");
  console.log("✅ Conta de administrador pronta!");
  console.log("────────────────────────────────────────");
  console.log("   Email:    dev@gmin.edu.ao");
  console.log("   Password: adeV32C");
  console.log("────────────────────────────────────────");
  console.log("   ⚠️  Muda a password após o primeiro login!");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Erro durante o seed:", err.message);
  process.exit(1);
});
