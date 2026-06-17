import { isMockMode } from "@/shared/config/dataSource";
import { mockDelay } from "@/shared/mocks/mockDelay";
import { getMockStore } from "@/shared/mocks/mockStore";
import { apiRequest } from "@/shared/services/apiClient";

async function getPricingPlansMock() {
  await mockDelay();
  const { pricing } = getMockStore();
  return {
    tiers: pricing.tiers.map((item) => ({ ...item })),
    additionalServices: pricing.additionalServices.map((item) => ({ ...item })),
  };
}

async function selectPricingPlanMock(tier) {
  await mockDelay();
  return { message: `Đã chọn gói ${tier}. (Mock — chưa có API thanh toán.)` };
}

export async function getPricingPlans() {
  if (isMockMode()) return getPricingPlansMock();

  return apiRequest("/api/Pricing/plans");
}

export async function selectPricingPlan(tier) {
  if (isMockMode()) return selectPricingPlanMock(tier);

  return apiRequest("/api/Pricing/select", {
    method: "POST",
    body: JSON.stringify({ tier }),
  });
}
