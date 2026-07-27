import axiosInstance from "../../axiosInstance";
import { API_ENDPOINTS } from "../../apiEndpoints";
import {
  getActiveWarehousesApi,
  getWarehousesApi,
  mapWarehousesToOptions,
} from "./warehouseService";
import {
  getServicePricingsApi,
  mapServicePricingsToOptions,
} from "./servicePricingService";
import {
  getActivePricingRulesApi,
  getPricingRulesApi,
} from "./pricingRuleService";

const getResponseData = (response) =>
  response?.data?.data ?? response?.data ?? null;

const getArrayItems = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const normalizeText = (value) =>
  String(value ?? "").trim();

const normalizeUpperText = (value) =>
  normalizeText(value).toUpperCase();

export const getProductTypesApi = async () => {
  const response = await axiosInstance.get(
    API_ENDPOINTS.productTypes
  );

  return getArrayItems(getResponseData(response))
    .map((item) => ({
      id: normalizeText(item?.id),
      name: normalizeText(item?.name),
    }))
    .filter((item) => item.id && item.name);
};

export const getConsignmentMasterDataApi = async ({
  warehouseFilters = {},
  servicePricingFilters = {},
  pricingRuleFilters = {},
  activeWarehousesOnly = true,
  activeRulesOnly = true,
} = {}) => {
  const [productTypes, warehouses, servicePricings, pricingRules] =
    await Promise.all([
      getProductTypesApi(),
      activeWarehousesOnly
        ? getActiveWarehousesApi(warehouseFilters)
        : getWarehousesApi(warehouseFilters),
      getServicePricingsApi(servicePricingFilters),
      activeRulesOnly
        ? getActivePricingRulesApi(pricingRuleFilters)
        : getPricingRulesApi(pricingRuleFilters),
    ]);

  return {
    productTypes,
    warehouses,
    warehouseOptions: mapWarehousesToOptions(warehouses),
    originWarehouses: warehouses.filter(
      (warehouse) =>
        normalizeUpperText(warehouse?.warehouseType) === "ORIGIN"
    ),
    destinationWarehouses: warehouses.filter(
      (warehouse) =>
        normalizeUpperText(warehouse?.warehouseType) === "DESTINATION"
    ),
    servicePricings,
    servicePricingOptions:
      mapServicePricingsToOptions(servicePricings),
    pricingRules,
  };
};

const consignmentMasterService = {
  getProductTypesApi,
  getConsignmentMasterDataApi,
};

export default consignmentMasterService;
