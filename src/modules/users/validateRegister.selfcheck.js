import {
  findDuplicateUser,
  normalizeEmail,
  normalizePhone,
  validateEmployeeRegister,
} from "./validateRegister.js";

if (normalizeEmail("  A@B.Com ") !== "a@b.com") throw new Error("normalizeEmail");
if (normalizePhone("+84 901 234 567") !== "0901234567") throw new Error("normalizePhone +84");
if (normalizePhone("84-901-234-567") !== "0901234567") throw new Error("normalizePhone 84");
if (normalizePhone("(090) 123-4567") !== "0901234567") throw new Error("normalizePhone local");

const users = [
  { email: "sale@vcl.com", phone: "+84 901 111 001" },
  { email: "ops@vcl.com", phone: "0902222002" },
];

const emailDup = findDuplicateUser(users, {
  email: "Sale@VCL.com",
  phone: "0999999999",
});
if (emailDup?.field !== "email") throw new Error("email duplicate");

const phoneDup = findDuplicateUser(users, {
  email: "new@vcl.com",
  phone: "0901 111 001",
});
if (phoneDup?.field !== "phone") throw new Error("phone duplicate");

const ok = findDuplicateUser(users, {
  email: "new@vcl.com",
  phone: "0909999999",
});
if (ok) throw new Error("should be unique");

const fieldErrors = validateEmployeeRegister({
  fullName: "A",
  email: "not-an-email",
  password: "short",
  phone: "123",
  role: "Sale",
  region: "",
  needsRegion: false,
  regionsLoading: false,
});
if (!fieldErrors.fullName || !fieldErrors.email || !fieldErrors.password || !fieldErrors.phone) {
  throw new Error("expected field errors");
}

const warehouseRegion = validateEmployeeRegister({
  fullName: "Nguyen Van A",
  email: "wh@vcl.com",
  password: "password1",
  phone: "0901234567",
  role: "Warehouse",
  region: "",
  needsRegion: true,
  regionsLoading: false,
});
if (!warehouseRegion.region) throw new Error("warehouse needs region");

console.log("validateRegister.selfcheck: ok");
