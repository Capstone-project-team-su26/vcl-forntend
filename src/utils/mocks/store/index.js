import { profile } from "./seedProfile.js";
import { purchaseRequests } from "./seedPurchaseRequests.js";
import { purchaseOrders } from "./seedPurchaseOrders.js";
import { dashboard } from "./seedDashboard.js";
import { transfer } from "./seedTransfer.js";
import {
  warehouses,
  internationalWarehouses,
  warehouseLocations,
  warehouseReceivingNotes,
} from "./seedWarehouses.js";
import { servicePricings } from "./seedServicePricings.js";
import { pricing } from "./seedPricing.js";
import { staff } from "./seedStaff.js";
import { staffConsignments } from "./seedConsignments.js";
import { customers } from "./seedCustomers.js";
import { carriers } from "./seedCarriers.js";
import { shippingMethods } from "./seedShippingMethods.js";
import { additionalServiceFees } from "./seedAdditionalServiceFees.js";
import { restrictedItems } from "./seedRestrictedItems.js";
import { conversations } from "./seedConversations.js";
import { users } from "./seedUsers.js";

const seed = {
  profile,
  purchaseRequests,
  purchaseOrders,
  dashboard,
  transfer,
  warehouses,
  internationalWarehouses,
  servicePricings,
  warehouseLocations,
  warehouseReceivingNotes,
  pricing,
  staff,
  staffConsignments,
  customers,
  carriers,
  shippingMethods,
  additionalServiceFees,
  restrictedItems,
  conversations,
  users,
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const store = clone(seed);

export function getMockStore() {
  return store;
}

export function resetMockStore() {
  Object.assign(store, clone(seed));
}

export function nextMockId(prefix) {
  const id = `${prefix}-${Date.now().toString(36).toUpperCase()}`;
  return id;
}
