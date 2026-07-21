import {
  findLinkedCustomerAccount,
  findLinkedCustomerProfile,
  isCustomerAccount,
} from "./linkAccount.js";

const users = [
  {
    id: "u1",
    email: "nguyenvana@example.com",
    phone: "+84 901 111 001",
    userType: "Customer",
    role: "Customer",
    status: "ACTIVE",
  },
  {
    id: "u2",
    email: "sale@vcl.com",
    phone: "0901000001",
    userType: "Employee",
    role: "Sale",
    status: "ACTIVE",
  },
];

const customers = [
  {
    id: "CUS-001",
    email: "NguyenVanA@example.com",
    phone: "0901 111 001",
  },
  {
    id: "CUS-orphan",
    email: "orphan@example.com",
    phone: "0909999999",
  },
];

if (!isCustomerAccount(users[0])) throw new Error("customer account");
if (isCustomerAccount(users[1])) throw new Error("employee not customer");

const linked = findLinkedCustomerAccount(customers[0], users);
if (linked?.user?.id !== "u1" || linked.matchBy !== "email") {
  throw new Error("profile → account by email");
}

const byPhone = findLinkedCustomerAccount(
  { email: "", phone: "0901111001" },
  users
);
if (byPhone?.user?.id !== "u1" || byPhone.matchBy !== "phone") {
  throw new Error("profile → account by phone");
}

const missing = findLinkedCustomerAccount(customers[1], users);
if (missing) throw new Error("orphan profile");

const profile = findLinkedCustomerProfile(users[0], customers);
if (profile?.customer?.id !== "CUS-001") throw new Error("account → profile");

console.log("linkAccount.selfcheck: ok");
