import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
  } from "react";
  
  import dayjs from "dayjs";
  import { useNavigate } from "react-router-dom";
  
  import { DatePicker, Input, Space } from "antd";
  import {
    Button,
    CircularProgress,
    Pagination,
  } from "@mui/material";
  
  import AutorenewIcon from "@mui/icons-material/Autorenew";
  import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
  import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
  import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
  import SearchIcon from "@mui/icons-material/Search";
  
  import { getConsignmentsApi } from "../../../api/SaleAPI/ConsignmentAPI/consignmentService";
  import AuthNotify from "../../../utils/Common/AuthNotify";
  
  import {
    apiToTimestamp,
    apiToUtcIso,
    formatUtcDateTime,
    formatVietnamDateTime,
  } from "../../../utils/timeUtc";
  
  import "./PendingConsignmentList.css";
  
  const { RangePicker } = DatePicker;
  
  const PENDING_REVIEW_STATUS = "PENDING_REVIEW";
  const DEFAULT_PAGE_SIZE = 5;
  
  /* =========================================================
     HELPERS
  ========================================================= */
  
  const normalizeText = (value) => {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };
  
  const PRODUCT_NAME_SEPARATOR =
    /\r?\n|[,;|•]+|\s+(?:và|and)\s+/giu;
  
  const collectProductNames = (source) => {
    if (
      source === null ||
      source === undefined ||
      source === ""
    ) {
      return [];
    }
  
    if (Array.isArray(source)) {
      return source.flatMap(collectProductNames);
    }
  
    if (typeof source === "object") {
      const directName =
        source.productName ||
        source.itemName ||
        source.name ||
        source.title ||
        source.product?.productName ||
        source.product?.name;
  
      if (directName) {
        return collectProductNames(directName);
      }
  
      return collectProductNames(
        source.items ||
          source.productNames ||
          source.itemNames ||
          []
      );
    }
  
    const text = String(source).trim();
  
    if (!text) {
      return [];
    }
  
    if (
      (text.startsWith("[") && text.endsWith("]")) ||
      (text.startsWith("{") && text.endsWith("}"))
    ) {
      try {
        return collectProductNames(JSON.parse(text));
      } catch {
        // Không phải JSON hợp lệ, tiếp tục xử lý như chuỗi thường.
      }
    }
  
    return text
      .split(PRODUCT_NAME_SEPARATOR)
      .map((name) => name.trim())
      .filter(Boolean);
  };
  
  const getProductNames = (item) => {
    const rawNames =
      item?.itemNames ??
      item?.productNames ??
      item?.items ??
      [];
  
    return Array.from(
      new Set(
        collectProductNames(rawNames)
          .map((name) => String(name).trim())
          .filter(Boolean)
      )
    );
  };
  
  const extractConsignmentItems = (apiResult) => {
    const candidates = [
      apiResult,
      apiResult?.items,
      apiResult?.results,
      apiResult?.data,
      apiResult?.data?.items,
      apiResult?.data?.results,
      apiResult?.data?.data,
      apiResult?.data?.data?.items,
      apiResult?.data?.data?.results,
    ];
  
    return candidates.find(Array.isArray) || [];
  };
  
  const copyTextToClipboard = async (text) => {
    if (
      navigator.clipboard?.writeText &&
      window.isSecureContext
    ) {
      await navigator.clipboard.writeText(text);
      return;
    }
  
    const textArea = document.createElement("textarea");
  
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    textArea.style.opacity = "0";
  
    document.body.appendChild(textArea);
    textArea.select();
  
    const copied = document.execCommand("copy");
  
    document.body.removeChild(textArea);
  
    if (!copied) {
      throw new Error("Không thể sao chép mã vận đơn.");
    }
  };
  
  const normalizeApiTimeToUtc = (value) => {
    return apiToUtcIso(value, {
      apiTimeMode: "utc",
    });
  };
  
  const normalizeConsignmentTime = (item) => {
    if (!item) {
      return item;
    }
  
    return {
      ...item,
      createdAtUtc: normalizeApiTimeToUtc(item.createdAt),
      updatedAtUtc: normalizeApiTimeToUtc(item.updatedAt),
    };
  };
  
  const formatDate = (value) => {
    const utcIso = normalizeApiTimeToUtc(value);
  
    if (!utcIso) {
      return "-";
    }
  
    return formatVietnamDateTime(utcIso, {
      apiTimeMode: "utc",
      fallback: "-",
    });
  };
  
  const formatDateUtcTitle = (value) => {
    const utcIso = normalizeApiTimeToUtc(value);
  
    if (!utcIso) {
      return "";
    }
  
    return `UTC+0: ${formatUtcDateTime(utcIso, {
      apiTimeMode: "utc",
      fallback: "-",
    })}`;
  };
  
  const formatWeight = (value) => {
    const weight = Number(value);

    if (!Number.isFinite(weight) || weight < 0) {
      return "0 kg";
    }

    return `${weight.toLocaleString("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })} kg`;
  };

  /*
   * API danh sách đang có:
   * - totalVolume: thể tích theo cm³
   * - totalVolumeM3: thể tích theo m³
   *
   * UI hiển thị theo cm nên thể tích phải dùng cm³.
   * 1 m³ = 1.000.000 cm³.
   */
  const getTotalVolumeCm3 = (item) => {
    const volumeCm3 = Number(item?.totalVolume);

    if (Number.isFinite(volumeCm3) && volumeCm3 >= 0) {
      return volumeCm3;
    }

    const volumeM3 = Number(item?.totalVolumeM3);

    if (Number.isFinite(volumeM3) && volumeM3 >= 0) {
      return volumeM3 * 1_000_000;
    }

    return 0;
  };

  const formatVolumeCm3 = (value) => {
    const volumeCm3 = Number(value);

    if (!Number.isFinite(volumeCm3) || volumeCm3 < 0) {
      return "0 cm³";
    }

    return `${volumeCm3.toLocaleString("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })} cm³`;
  };

  const getConsignmentTypeLabel = (type) => {
    const normalizedType = String(type || "")
      .trim()
      .toUpperCase();
  
    if (normalizedType === "EXPRESS") {
      return "HỎA TỐC";
    }
  
    if (normalizedType === "STANDARD") {
      return "TIÊU CHUẨN";
    }
  
    return String(type || "-").toUpperCase();
  };
  
  const getTrackingCode = (item) => {
    const trackingCode =
      item?.consignmentCode ||
      item?.trackingCode ||
      item?.domesticTrackingCode ||
      item?.waybillCode ||
      item?.shipmentCode;
  
    return String(trackingCode || "").trim() || "-";
  };
  
  const getOrderCode = (item) => {
    return String(
      item?.orderCode || item?.orderId || "-"
    ).trim();
  };
  
  const getErrorMessage = (error) => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.response?.data?.title ||
      error?.message ||
      "Không thể tải danh sách yêu cầu ký gửi."
    );
  };
  
  /* =========================================================
     COMPONENT
  ========================================================= */
  
  export default function PendingConsignmentList() {
    const navigate = useNavigate();
  
    const [consignments, setConsignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [dateRangeInput, setDateRangeInput] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [refreshKey, setRefreshKey] = useState(0);
    const [copiedTrackingCode, setCopiedTrackingCode] =
      useState("");
  
    const copyResetTimerRef = useRef(null);
  
    /* =========================================================
       LOAD DATA
    ========================================================= */
  
    const fetchConsignments = useCallback(async () => {
      try {
        setLoading(true);
  
        const response = await getConsignmentsApi({
          status: PENDING_REVIEW_STATUS,
        });
  
        const items = extractConsignmentItems(response);
  
        const pendingItems = items
          .filter((item) => {
            return (
              String(item?.status || "")
                .trim()
                .toUpperCase() === PENDING_REVIEW_STATUS
            );
          })
          .map(normalizeConsignmentTime)
          .sort((firstItem, secondItem) => {
            const firstTime =
              apiToTimestamp(firstItem?.createdAtUtc, {
                apiTimeMode: "utc",
              }) || 0;
  
            const secondTime =
              apiToTimestamp(secondItem?.createdAtUtc, {
                apiTimeMode: "utc",
              }) || 0;
  
            return secondTime - firstTime;
          });
  
        setConsignments(pendingItems);
      } catch (error) {
        console.error(
          "Lỗi khi lấy danh sách ký gửi chờ duyệt:",
          error
        );
  
        setConsignments([]);
  
        AuthNotify.error(
          "Không tải được danh sách ký gửi",
          getErrorMessage(error)
        );
      } finally {
        setLoading(false);
      }
    }, []);
  
    useEffect(() => {
      fetchConsignments();
    }, [fetchConsignments, refreshKey]);
  
    useEffect(() => {
      return () => {
        if (copyResetTimerRef.current) {
          window.clearTimeout(copyResetTimerRef.current);
        }
      };
    }, []);
  
    /* =========================================================
       FILTER
    ========================================================= */
  
    const disabledRangeDate = (currentDate, info) => {
      const fromDate = info?.from;
  
      if (!currentDate || !fromDate) {
        return false;
      }
  
      return currentDate.isBefore(fromDate, "day");
    };
  
    const handleDateRangeChange = (dates) => {
      if (
        !Array.isArray(dates) ||
        !dates[0] ||
        !dates[1]
      ) {
        setDateRangeInput(null);
        setPageNumber(1);
        return;
      }
  
      const startDate = dayjs(dates[0]).startOf("day");
      const endDate = dayjs(dates[1]).startOf("day");
  
      if (endDate.isBefore(startDate, "day")) {
        AuthNotify.warning(
          "Khoảng ngày không hợp lệ",
          "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu."
        );
  
        setDateRangeInput([startDate, startDate]);
        setPageNumber(1);
        return;
      }
  
      setDateRangeInput([startDate, endDate]);
      setPageNumber(1);
    };
  
    const filteredConsignments = useMemo(() => {
      const normalizedSearch = normalizeText(searchInput);
  
      const startTimestamp = dateRangeInput?.[0]
        ? dateRangeInput[0].startOf("day").valueOf()
        : null;
  
      const endTimestamp = dateRangeInput?.[1]
        ? dateRangeInput[1].endOf("day").valueOf()
        : null;
  
      return consignments.filter((item) => {
        const searchableContent = [
          item?.orderId,
          item?.orderCode,
          item?.consignmentCode,
          item?.customerName,
          item?.receiverName,
          item?.receiverPhone,
          item?.receiverAddress,
          item?.consignmentType,
          item?.status,
          item?.route,
          getProductNames(item).join(" "),
        ]
          .filter(Boolean)
          .map(normalizeText)
          .join(" ");
  
        const matchesSearch =
          !normalizedSearch ||
          searchableContent.includes(normalizedSearch);
  
        const createdTimestamp = apiToTimestamp(
          item?.createdAtUtc || item?.createdAt,
          {
            apiTimeMode: "utc",
          }
        );
  
        const matchesStartDate =
          startTimestamp === null ||
          (createdTimestamp !== null &&
            createdTimestamp >= startTimestamp);
  
        const matchesEndDate =
          endTimestamp === null ||
          (createdTimestamp !== null &&
            createdTimestamp <= endTimestamp);
  
        return (
          matchesSearch &&
          matchesStartDate &&
          matchesEndDate
        );
      });
    }, [consignments, dateRangeInput, searchInput]);
  
    /* =========================================================
       CLIENT PAGINATION
    ========================================================= */
  
    const totalPages = Math.max(
      1,
      Math.ceil(
        filteredConsignments.length / DEFAULT_PAGE_SIZE
      )
    );
  
    const visibleConsignments = useMemo(() => {
      const startIndex =
        (pageNumber - 1) * DEFAULT_PAGE_SIZE;
  
      return filteredConsignments.slice(
        startIndex,
        startIndex + DEFAULT_PAGE_SIZE
      );
    }, [filteredConsignments, pageNumber]);
  
    useEffect(() => {
      if (pageNumber > totalPages) {
        setPageNumber(totalPages);
      }
    }, [pageNumber, totalPages]);
  
    /* =========================================================
       EVENTS
    ========================================================= */
  
    const handleSearchChange = (event) => {
      setSearchInput(event.target.value);
      setPageNumber(1);
    };
  
    const handleResetClick = () => {
      setSearchInput("");
      setDateRangeInput(null);
      setPageNumber(1);
      setRefreshKey((previous) => previous + 1);
    };
  
    const handleCopyTrackingCode = async (event, item) => {
      event.preventDefault();
      event.stopPropagation();
  
      const trackingCode = getTrackingCode(item);
  
      if (!trackingCode || trackingCode === "-") {
        AuthNotify.warning(
          "Chưa có mã vận đơn",
          "Yêu cầu chưa có mã vận đơn để sao chép."
        );
        return;
      }
  
      try {
        await copyTextToClipboard(trackingCode);
  
        setCopiedTrackingCode(trackingCode);
  
        AuthNotify.success(
          "Sao chép thành công",
          "Đã sao chép mã vận đơn."
        );
  
        if (copyResetTimerRef.current) {
          window.clearTimeout(copyResetTimerRef.current);
        }
  
        copyResetTimerRef.current = window.setTimeout(() => {
          setCopiedTrackingCode("");
        }, 1800);
      } catch (error) {
        console.error(
          "Không thể sao chép mã vận đơn:",
          error
        );
  
        AuthNotify.error(
          "Sao chép thất bại",
          "Không thể sao chép mã vận đơn. Vui lòng thử lại."
        );
      }
    };
  
    const handlePageChange = (_, nextPageNumber) => {
      setPageNumber(nextPageNumber);
  
      const scrollTarget =
        document.querySelector(".main-layout__content") ||
        document.querySelector(".page-sub-content") ||
        window;
  
      if (scrollTarget === window) {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else {
        scrollTarget.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    };
  
    const handleViewDetail = (item) => {
      if (!item?.orderId) {
        return;
      }
  
      navigate(`/sale/consignments/${item.orderId}`, {
        state: {
          consignment: item,
        },
      });
    };
  
    const handleCardKeyDown = (event, item) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleViewDetail(item);
      }
    };
  
    const hasActiveFilter = Boolean(
      searchInput.trim() ||
        (dateRangeInput?.[0] && dateRangeInput?.[1])
    );
  
    /* =========================================================
       RENDER
    ========================================================= */
  
    return (
      <div className="vcl-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              YÊU CẦU KÝ GỬI CHỜ DUYỆT
            </h1>
  
            <p className="page-subtitle">
              Kiểm tra các yêu cầu ký gửi mới đang chờ Sale duyệt.
            </p>
          </div>
  
          <div className="page-summary">
            <strong>{filteredConsignments.length}</strong>
            <span>Yêu cầu chờ duyệt</span>
          </div>
        </div>
  
        <div className="filter-section">
          <div className="filter-fields">
            <Space size="middle" wrap>
              <Input
                prefix={
                  <SearchIcon className="filter-search-icon" />
                }
                placeholder="Tìm mã vận đơn, khách hàng, sản phẩm..."
                value={searchInput}
                onChange={handleSearchChange}
                onPressEnter={() => setPageNumber(1)}
                allowClear
                className="filter-search-input"
              />
  
              <RangePicker
                value={dateRangeInput}
                onChange={handleDateRangeChange}
                disabledDate={disabledRangeDate}
                format="DD/MM/YYYY"
                placeholder={["Từ ngày", "Đến ngày"]}
                allowClear
                inputReadOnly
                className="filter-date-picker"
              />
            </Space>
          </div>
  
          <div className="filter-actions">
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<AutorenewIcon />}
              onClick={handleResetClick}
              disabled={loading}
              className="filter-reset-button"
            >
              LÀM MỚI
            </Button>
          </div>
        </div>
  
        {loading ? (
          <div className="vcl-loading-box">
            <CircularProgress size={38} />
            <div>Đang tải yêu cầu ký gửi chờ duyệt...</div>
          </div>
        ) : (
          <>
            <div className="card-list">
              {visibleConsignments.length === 0 ? (
                <div className="empty-container">
                  <div className="empty-icon">📭</div>
  
                  <h3>Không có yêu cầu ký gửi chờ duyệt</h3>
  
                  <p>
                    Hãy thay đổi từ khóa, khoảng ngày hoặc làm mới dữ liệu.
                  </p>
  
                  {hasActiveFilter && (
                    <Button
                      variant="outlined"
                      color="inherit"
                      startIcon={<AutorenewIcon />}
                      onClick={handleResetClick}
                      className="empty-reset-button"
                    >
                      Xóa bộ lọc
                    </Button>
                  )}
                </div>
              ) : (
                visibleConsignments.map((item) => {
                  const productNames = getProductNames(item);
                  const trackingCode = getTrackingCode(item);
  
                  return (
                    <article
                      key={item.orderId}
                      className="consignment-card"
                      role="button"
                      tabIndex={0}
                      onClick={() => handleViewDetail(item)}
                      onKeyDown={(event) =>
                        handleCardKeyDown(event, item)
                      }
                      aria-label={`Xem chi tiết yêu cầu ký gửi ${trackingCode}`}
                    >
                      <div className="card-header">
                        <div className="header-left">
                          <div className="tracking-code-block">
                            <span className="tracking-code-label">
                              MÃ VẬN ĐƠN
                            </span>
  
                            <div className="tracking-code-row">
                              <strong className="order-code">
                                {trackingCode}
                              </strong>
  
                              <button
                                type="button"
                                className={[
                                  "copy-tracking-button",
                                  copiedTrackingCode === trackingCode &&
                                    "is-copied",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                                title="Sao chép mã vận đơn"
                                aria-label={`Sao chép mã vận đơn ${trackingCode}`}
                                onClick={(event) =>
                                  handleCopyTrackingCode(event, item)
                                }
                              >
                                {copiedTrackingCode === trackingCode ? (
                                  <>
                                    <CheckRoundedIcon />
                                    <span>Đã chép</span>
                                  </>
                                ) : (
                                  <>
                                    <ContentCopyRoundedIcon />
                                    <span>Sao chép</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
  
                          <div className="header-tags">
                            <span className="tag-type">
                              {getConsignmentTypeLabel(
                                item.consignmentType
                              )}
                            </span>
  
                            <span className="tag-count">
                              Tuyến {item.route || "-"}
                            </span>
  
                            <span className="tag-status-header status-pending-review">
                              Chờ duyệt
                            </span>
                          </div>
                        </div>
  
                        <Button
                          variant="outlined"
                          size="small"
                          endIcon={<ArrowForwardIcon />}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleViewDetail(item);
                          }}
                          className="view-detail-button"
                        >
                          Xem chi tiết
                        </Button>
                      </div>
  
                      <div className="sub-header">
                        <span>
                          Khách hàng:{" "}
                          <strong>{item.customerName || "-"}</strong>
                        </span>
  
                        <span>
                          Người nhận:{" "}
                          <strong>{item.receiverName || "-"}</strong>
                        </span>
  
                        <span
                          title={formatDateUtcTitle(
                            item.createdAtUtc || item.createdAt
                          )}
                        >
                          📅 Ngày tạo:{" "}
                          <strong>
                            {formatDate(
                              item.createdAtUtc || item.createdAt
                            )}
                          </strong>{" "}
                          <small className="utc-display-label">
                            UTC+7
                          </small>
                        </span>
  
                        <span className="price-total-header">
                          KIỂM HÀNG:{" "}
                          <b
                            className={
                              item.requiresInspection
                                ? "inspection-yes"
                                : "inspection-no"
                            }
                          >
                            {item.requiresInspection ? "Có" : "Không"}
                          </b>
                        </span>
                      </div>
  
                      <div className="card-body">
                        <div className="body-left">
                          <div className="box-icon">📦</div>
  
                          <div className="product-info">
                            <div className="product-name-group">
                              <div className="product-name-heading">
                                <span className="product-name-label">
                                  SẢN PHẨM
                                </span>
  
                                {productNames.length > 1 && (
                                  <span className="product-name-count">
                                    {productNames.length} sản phẩm
                                  </span>
                                )}
                              </div>
  
                              {productNames.length > 0 ? (
                                <div
                                  className={[
                                    "product-name-list",
                                    productNames.length === 1 &&
                                      "is-single",
                                  ]
                                    .filter(Boolean)
                                    .join(" ")}
                                >
                                  {productNames.map(
                                    (productName, productIndex) => (
                                      <div
                                        key={`${item.orderId}-${productName}-${productIndex}`}
                                        className="product-name-item"
                                      >
                                        {productNames.length > 1 && (
                                          <span className="product-name-index">
                                            {productIndex + 1}
                                          </span>
                                        )}
  
                                        <strong
                                          className="product-name-value"
                                          title={productName}
                                        >
                                          {productName}
                                        </strong>
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <strong className="product-name-empty">
                                  Chưa có tên sản phẩm
                                </strong>
                              )}
                            </div>
  
                            <div className="sku-tag">
                              Mã đơn: {getOrderCode(item)}
                            </div>
  
                            <div className="receiver-phone">
                              <span>Số điện thoại:</span>{" "}
                              <strong>{item.receiverPhone || "-"}</strong>
                            </div>
  
                            <div className="receiver-address">
                              <span>Địa chỉ:</span>{" "}
                              <strong>{item.receiverAddress || "-"}</strong>
                            </div>
                          </div>
                        </div>
  
                        <div className="body-right">
                          <span className="status-badge-center status-pending-review">
                            Chờ duyệt
                          </span>
  
                          <div className="shipping-type">
                            <span>LOẠI VẬN CHUYỂN</span>
  
                            <strong>
                              {getConsignmentTypeLabel(
                                item.consignmentType
                              )}
                            </strong>
                          </div>
  
                          <div className="specs-list">
                            <span>
                              Khối lượng:{" "}
                              <strong>
                                {formatWeight(
                                  item.totalWeight ?? item.weightKg
                                )}
                              </strong>
                            </span>

                            <span>
                              Thể tích:{" "}
                              <strong>
                                {formatVolumeCm3(
                                  getTotalVolumeCm3(item)
                                )}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
  
            {filteredConsignments.length > 0 && (
              <div className="pagination-section">
                <span className="pagination-summary">
                  Hiển thị{" "}
                  <strong>{visibleConsignments.length}</strong>{" "}
                  yêu cầu trên trang này, tổng cộng{" "}
                  <strong>{filteredConsignments.length}</strong>{" "}
                  yêu cầu chờ duyệt
                </span>
  
                <Pagination
                  count={totalPages}
                  page={pageNumber}
                  onChange={handlePageChange}
                  disabled={loading}
                  color="primary"
                  shape="rounded"
                  showFirstButton
                  showLastButton
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  }