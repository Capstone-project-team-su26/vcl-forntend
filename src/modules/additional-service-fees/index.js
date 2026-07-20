import { isMockMode } from "@/utils/mocks/dataSource";
import { formatMoney, isVatRule, isVolumetricDivisorRule } from "@/modules/service-pricing";
import {
  listAdditionalServiceFeesApi,
  createAdditionalServiceFeeApi,
  updateAdditionalServiceFeeApi,
  deleteAdditionalServiceFeeApi,
} from "./api";
import {
  listAdditionalServiceFeesMock,
  createAdditionalServiceFeeMock,
  updateAdditionalServiceFeeMock,
  deleteAdditionalServiceFeeMock,
} from "./mock";

export {
  normalizeAdditionalServiceFeeFromApi,
  normalizeAdditionalServiceFeeListResponse,
  toApiAdditionalServiceFeePayload,
  toApiPricingRuleFromAdditionalFeePayload,
} from "./mappers";

export const FEE_CALCULATION_TYPE_LABELS = {
  FIXED: "Giá cố định",
  PERCENTAGE: "Theo phần trăm",
};

/**
 * @param {{ search?: string; isActive?: boolean | string }} params
 */
export async function listAdditionalServiceFees(params = {}) {
  if (isMockMode()) return listAdditionalServiceFeesMock(params);
  return listAdditionalServiceFeesApi(params);
}

export async function createAdditionalServiceFee(payload) {
  if (isMockMode()) return createAdditionalServiceFeeMock(payload);
  return createAdditionalServiceFeeApi(payload);
}

export async function updateAdditionalServiceFee(id, payload) {
  if (isMockMode()) return updateAdditionalServiceFeeMock(id, payload);
  return updateAdditionalServiceFeeApi(id, payload);
}

export async function deleteAdditionalServiceFee(id) {
  if (isMockMode()) return deleteAdditionalServiceFeeMock(id);
  return deleteAdditionalServiceFeeApi(id);
}

export function formatFeeAmount(fee) {
  if (isVolumetricDivisorRule(fee)) {
    const value = Number(fee.fixedAmount ?? fee.value);
    return Number.isFinite(value) && value > 0
      ? `÷ ${value.toLocaleString("vi-VN")}`
      : "—";
  }
  if (fee.feeCalculationType === "PERCENTAGE") {
    return fee.percentageRate != null ? `${fee.percentageRate}%` : "—";
  }
  return fee.fixedAmount != null ? formatMoney(fee.fixedAmount) : "—";
}

export function formatFeeCalculationType(type, fee) {
  if (fee && isVolumetricDivisorRule(fee)) return "Hệ số quy đổi thể tích";
  if (fee && isVatRule(fee)) return "VAT báo giá";
  return FEE_CALCULATION_TYPE_LABELS[type] || type || "—";
}
