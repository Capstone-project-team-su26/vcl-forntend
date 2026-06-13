import { mockDelay } from "@/shared/mocks/mockDelay";
import { getMockStore } from "@/shared/mocks/mockStore";

export async function getPricingPlans() {
  await mockDelay();
  const { pricing } = getMockStore();
  return {
    tiers: pricing.tiers.map((item) => ({ ...item })),
    additionalServices: pricing.additionalServices.map((item) => ({ ...item })),
  };
}

export async function selectPricingPlan(tier) {
  await mockDelay();
  return { message: `Đã chọn gói ${tier}. (Mock — chưa có API thanh toán.)` };
}
