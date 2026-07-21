import { ApiError } from "@/utils/apiError";

/** BE đã bỏ /api/Operations/* — không còn endpoint thật. */
export async function confirmTransferApi() {
  throw new ApiError(404, {
    message: "Chức năng chuyển phát chưa khả dụng trên server (API Operations đã gỡ).",
  });
}

export async function estimatePriceApi() {
  throw new ApiError(404, {
    message: "Chức năng ước tính giá chưa khả dụng trên server (API Operations đã gỡ).",
  });
}
