import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
  } from "react";

  import {
    useLocation,
    useNavigate,
    useParams,
  } from "react-router-dom";

  import {
    Alert,
    Button,
    Empty,
    Form,
    Input,
    InputNumber,
    Popconfirm,
    Select,
    Skeleton,
    Switch,
    Tag,
    Tooltip,
  } from "antd";

  import {
    ArrowLeftOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CopyOutlined,
    DollarOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
    InboxOutlined,
    MailOutlined,
    PhoneOutlined,
    ReloadOutlined,
    SafetyCertificateOutlined,
    SendOutlined,
    ShoppingOutlined,
    TagsOutlined,
    TeamOutlined,
    UserOutlined,
  } from "@ant-design/icons";

  import {
    estimateQuotationApi,
    getConsignmentDetailApi,
    sendQuotationApi,
  } from "../../../../api/SaleAPI/ConsignmentAPI/consignmentService";

  import {
    findMatchingServicePricing,
    findPricingRuleByCode,
    findServicePricingById,
    getActivePricingRulesApi,
    getOriginWarehousesApi,
    getProductTypesApi,
    getServicePricingsApi,
    mapServicePricingsToOptions,
    mapWarehousesToOptions,
  } from "../../../../api/SaleAPI/ConsignmentAPI/consignmentMasterService";

  import AuthNotify from "../../../../utils/Common/AuthNotify";

  import "./ConsignmentDetail.css";

  /* =========================
     STATUS CONFIG
  ========================= */

  const ORDER_STATUS_CONFIG = {
    PENDING_REVIEW: {
      label: "Chờ duyệt",
      className: "is-warning",
    },
    QUOTATION_SENT: {
      label: "Đã gửi báo giá",
      className: "is-info",
    },
    WAITING_DEPOSIT: {
      label: "Chờ đặt cọc",
      className: "is-warning",
    },
    DEPOSIT_PAID: {
      label: "Đã đặt cọc",
      className: "is-success",
    },
    PROCESSING: {
      label: "Đang xử lý",
      className: "is-info",
    },
    COMPLETED: {
      label: "Hoàn thành",
      className: "is-success",
    },
    CANCELLED: {
      label: "Đã hủy",
      className: "is-danger",
    },
  };

  const QUOTATION_STATUS_CONFIG = {
    DRAFT: {
      label: "Bản nháp",
      className: "is-draft",
    },
    PENDING: {
      label: "Chờ xác nhận",
      className: "is-warning",
    },
    SENT: {
      label: "Đã gửi",
      className: "is-info",
    },
    ACCEPTED: {
      label: "Đã chấp nhận",
      className: "is-success",
    },
    REJECTED: {
      label: "Đã từ chối",
      className: "is-danger",
    },
    EXPIRED: {
      label: "Đã hết hạn",
      className: "is-danger",
    },
  };

  const DEFAULT_DIM_DIVISOR = 5000;
  const DIM_DECIMAL_PLACES = 4;

  /* =========================
     BASIC HELPERS
  ========================= */

  const normalizeText = (value) => {
    return String(value ?? "").trim();
  };

  const normalizeNumber = (
    value,
    fallback = 0
  ) => {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : fallback;
  };

  const normalizePositiveNumber = (
    value,
    fallback = 0
  ) => {
    return Math.max(
      0,
      normalizeNumber(value, fallback)
    );
  };

  const roundToDecimals = (
    value,
    decimals = DIM_DECIMAL_PLACES
  ) => {
    const number = normalizeNumber(value, 0);
    const factor = 10 ** decimals;

    return Math.round(
      (number + Number.EPSILON) * factor
    ) / factor;
  };

  const formatCurrency = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0 ₫";
    }

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(number);
  };

  /**
   * Định dạng số đo linh hoạt:
   * 27   -> 27
   * 3.2  -> 3,2
   * 3.25 -> 3,25
   *
   * Không ép số 0 ở cuối.
   */
  const formatMeasurement = (
    value,
    maximumFractionDigits = 4
  ) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0";
    }

    const safeDigits = Math.max(
      0,
      Math.min(
        10,
        Math.trunc(
          normalizeNumber(
            maximumFractionDigits,
            4
          )
        )
      )
    );

    const roundedNumber = Number(
      number.toFixed(safeDigits)
    );

    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits:
        safeDigits,
      useGrouping: true,
    }).format(roundedNumber);
  };

  /**
   * DIM luôn hiển thị đúng 4 chữ số thập phân.
   * 2      -> 2,0000
   * 0.0016 -> 0,0016
   */
  const formatDimWeight = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0,0000";
    }

    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits:
        DIM_DECIMAL_PLACES,
      maximumFractionDigits:
        DIM_DECIMAL_PLACES,
      useGrouping: true,
    }).format(
      roundToDecimals(
        number,
        DIM_DECIMAL_PLACES
      )
    );
  };

  const formatDateTime = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const translateConsignmentType = (
    value
  ) => {
    const normalizedValue =
      normalizeText(value)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

    const typeMap = {
      express: "Hỏa tốc",
      standard: "Tiêu chuẩn",
      economy: "Tiết kiệm",
      expedited: "Hỏa tốc",
    };

    return (
      typeMap[normalizedValue] ||
      value ||
      "Chưa xác định"
    );
  };

  const translateQuoteType = (value) => {
    const quoteTypeMap = {
      ESTIMATE: "Báo giá tạm tính",
      OFFICIAL: "Báo giá chính thức",
    };

    return (
      quoteTypeMap[value] ||
      value ||
      "—"
    );
  };

  const getOrderStatus = (status) => {
    return (
      ORDER_STATUS_CONFIG[status] || {
        label:
          status || "Chưa xác định",
        className: "is-default",
      }
    );
  };

  const getQuotationStatus = (
    status
  ) => {
    return (
      QUOTATION_STATUS_CONFIG[
        status
      ] || {
        label:
          status || "Chưa xác định",
        className: "is-default",
      }
    );
  };

  const convertCm3ToM3 = (
    volumeCm3
  ) => {
    return (
      normalizePositiveNumber(
        volumeCm3
      ) / 1_000_000
    );
  };

  /* =========================
     ITEM HELPERS
  ========================= */

  const getItemName = (item) => {
    return (
      normalizeText(item?.name) ||
      normalizeText(
        item?.productName
      ) ||
      normalizeText(
        item?.itemName
      ) ||
      "Sản phẩm"
    );
  };

  const getItemWeightKg = (item) => {
    return normalizePositiveNumber(
      item?.weight ??
        item?.actualWeight ??
        item?.totalWeight ??
        item?.weightKg
    );
  };

  const getItemLengthCm = (item) => {
    return normalizePositiveNumber(
      item?.length ??
        item?.lengthCm
    );
  };

  const getItemWidthCm = (item) => {
    return normalizePositiveNumber(
      item?.width ??
        item?.widthCm
    );
  };

  const getItemHeightCm = (item) => {
    return normalizePositiveNumber(
      item?.height ??
        item?.heightCm
    );
  };

  const calculateItemVolumeCm3 = (
    item
  ) => {
    const length = getItemLengthCm(
      item
    );
    const width = getItemWidthCm(item);
    const height = getItemHeightCm(
      item
    );

    if (
      length <= 0 ||
      width <= 0 ||
      height <= 0
    ) {
      return 0;
    }

    /*
     * Mỗi dòng sản phẩm được tính là 1 kiện.
     * Không nhân thêm quantity.
     */
    return length * width * height;
  };

  const calculateItemDimKg = (
    item,
    divisor
  ) => {
    const volumeCm3 =
      calculateItemVolumeCm3(item);

    const divisorValue =
      normalizePositiveNumber(
        divisor,
        DEFAULT_DIM_DIVISOR
      );

    if (
      volumeCm3 <= 0 ||
      divisorValue <= 0
    ) {
      return 0;
    }

    /*
     * DIM (kg) =
     * Dài (cm) × Rộng (cm) × Cao (cm)
     * chia hệ số DIM lấy từ API.
     *
     * Không nhân theo quantity.
     */
    return volumeCm3 / divisorValue;
  };

  const getProductTypeId = (item) => {
    return normalizeText(
      item?.productTypeId ??
        item?.productTypeID ??
        item?.productType?.id ??
        item?.productType?.productTypeId
    );
  };

  const getProductTypeName = (
    item,
    productTypeMap
  ) => {
    /*
     * Ưu tiên tên loại hàng nếu API chi tiết
     * đã trả trực tiếp productTypeName.
     */
    const directName =
      normalizeText(
        item?.productTypeName
      ) ||
      normalizeText(
        item?.productType?.name
      );

    if (directName) {
      return directName;
    }

    /*
     * Trường productType có thể là:
     * - Tên loại hàng, ví dụ "Điện tử"
     * - ID loại hàng dạng UUID
     */
    const productTypeValue =
      typeof item?.productType ===
      "string"
        ? normalizeText(
            item.productType
          )
        : "";

    if (productTypeValue) {
      return (
        productTypeMap.get(
          productTypeValue
        ) ||
        productTypeMap.get(
          productTypeValue.toLowerCase()
        ) ||
        productTypeValue
      );
    }

    const productTypeId =
      getProductTypeId(item);

    if (!productTypeId) {
      return "Chưa phân loại";
    }

    return (
      productTypeMap.get(
        productTypeId
      ) ||
      productTypeMap.get(
        productTypeId.toLowerCase()
      ) ||
      "Chưa phân loại"
    );
  };

  /* =========================
     QUOTATION HELPERS
  ========================= */

  const parseRouteCountries = (route) => {
    const parts = normalizeText(route)
      .split(/-->|->|→|⇒| đến /i)
      .map((item) => item.trim())
      .filter(Boolean);

    return {
      originCountry: parts[0] || "",
      destinationCountry:
        parts[parts.length - 1] || "",
    };
  };

  const normalizeServiceTypeCode = (
    value
  ) => {
    const normalizedValue =
      normalizeText(value)
        .toUpperCase()
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          ""
        )
        .replace(/Đ/g, "D")
        .replace(/[^A-Z0-9]/g, "");

    const typeMap = {
      EXPRESS: "EXPRESS",
      EXPEDITED: "EXPRESS",
      HOATOC: "EXPRESS",
      STANDARD: "STANDARD",
      TIEUCHUAN: "STANDARD",
      ECONOMY: "ECONOMY",
      TIETKIEM: "ECONOMY",
    };

    return (
      typeMap[normalizedValue] ||
      normalizedValue
    );
  };

  const normalizeCountryCode = (
    value
  ) => {
    const normalizedValue =
      normalizeText(value)
        .toUpperCase()
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          ""
        )
        .replace(/Đ/g, "D")
        .replace(/[^A-Z0-9]/g, "");

    const countryMap = {
      CN: "CN",
      CHINA: "CN",
      TRUNGQUOC: "CN",
      VN: "VN",
      VIETNAM: "VN",
      JP: "JP",
      JAPAN: "JP",
      NHATBAN: "JP",
      KR: "KR",
      KOREA: "KR",
      SOUTHKOREA: "KR",
      HANQUOC: "KR",
    };

    return (
      countryMap[normalizedValue] ||
      normalizedValue
    );
  };

  const SERVICE_TYPE_OPTIONS = [
    {
      value: "EXPRESS",
      label: "Hỏa tốc",
    },
    {
      value: "STANDARD",
      label: "Tiêu chuẩn",
    },
    {
      value: "ECONOMY",
      label: "Tiết kiệm",
    },
  ];

  const COUNTRY_OPTIONS = [
    {
      value: "CN",
      label: "Trung Quốc",
    },
    {
      value: "VN",
      label: "Việt Nam",
    },
    {
      value: "JP",
      label: "Nhật Bản",
    },
    {
      value: "KR",
      label: "Hàn Quốc",
    },
  ];

  const clampNumber = (
    value,
    min = 0,
    max = Number.POSITIVE_INFINITY
  ) => {
    return Math.min(
      max,
      Math.max(
        min,
        normalizeNumber(value, min)
      )
    );
  };

  const currencyInputFormatter = (value) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return "";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "";
    }

    return new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 2,
    }).format(number);
  };

  const currencyInputParser = (value) => {
    const normalizedValue = String(
      value ?? ""
    )
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^0-9.-]/g, "");

    const number = Number(normalizedValue);

    return Number.isFinite(number)
      ? number
      : 0;
  };

  const isRuleEligible = (
    rule,
    {
      declaredValue = 0,
      requiresInspection = false,
    } = {}
  ) => {
    const conditionType = normalizeText(
      rule?.conditionType
    ).toUpperCase();

    if (
      conditionType ===
      "REQUIRES_INSPECTION"
    ) {
      return Boolean(requiresInspection);
    }

    if (
      conditionType ===
      "MIN_DECLARED_VALUE"
    ) {
      return (
        normalizePositiveNumber(
          declaredValue
        ) >=
        normalizePositiveNumber(
          rule?.conditionValue
        )
      );
    }

    return true;
  };

  const calculateRuleAmount = (
    rule,
    {
      declaredValue = 0,
      packageCount = 0,
    } = {}
  ) => {
    const calculationType = normalizeText(
      rule?.calculationType
    ).toUpperCase();

    const conditionType = normalizeText(
      rule?.conditionType
    ).toLowerCase();

    const ruleValue =
      normalizePositiveNumber(
        rule?.value
      );

    let amount = 0;

    if (
      calculationType === "PERCENTAGE"
    ) {
      amount =
        normalizePositiveNumber(
          declaredValue
        ) *
        (ruleValue / 100);
    } else if (
      conditionType.includes("kiện") ||
      conditionType.includes("package")
    ) {
      amount =
        ruleValue *
        Math.max(
          0,
          Math.trunc(
            normalizePositiveNumber(
              packageCount
            )
          )
        );
    } else {
      amount = ruleValue;
    }

    const minAmount =
      rule?.minAmount == null
        ? 0
        : normalizePositiveNumber(
            rule.minAmount
          );

    const maxAmount =
      rule?.maxAmount == null
        ? Number.POSITIVE_INFINITY
        : normalizePositiveNumber(
            rule.maxAmount
          );

    return roundToDecimals(
      clampNumber(
        amount,
        minAmount,
        maxAmount
      ),
      2
    );
  };

  const buildFeeRows = ({
    pricingRules = [],
    enabledFeeCodes = {},
    declaredValue = 0,
    packageCount = 0,
    requiresInspection = false,
  }) => {
    return pricingRules
      .filter(
        (rule) =>
          normalizeText(
            rule?.ruleCode
          ).toUpperCase() !==
          "VOLUMETRIC_DIVISOR"
      )
      .map((rule) => {
        const code = normalizeText(
          rule?.ruleCode
        ).toUpperCase();

        const eligible = isRuleEligible(
          rule,
          {
            declaredValue,
            requiresInspection,
          }
        );

        return {
          ...rule,
          code,
          eligible,
          enabled:
            eligible &&
            (rule?.isRequired === true ||
              enabledFeeCodes[code] ===
                true),
          amount: calculateRuleAmount(
            rule,
            {
              declaredValue,
              packageCount,
            }
          ),
        };
      });
  };

  const getQuotationErrorMessage = (
    error,
    fallback
  ) => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.response?.data?.title ||
      error?.message ||
      fallback
    );
  };

  /* =========================
     COPY HELPER
  ========================= */

  const copyText = async (value) => {
    const text = normalizeText(value);

    if (!text) {
      throw new Error(
        "Không có nội dung để sao chép."
      );
    }

    if (
      navigator?.clipboard &&
      window.isSecureContext
    ) {
      await navigator.clipboard.writeText(
        text
      );

      return;
    }

    const textArea =
      document.createElement(
        "textarea"
      );

    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(
      textArea
    );

    textArea.focus();
    textArea.select();

    document.execCommand("copy");

    document.body.removeChild(
      textArea
    );
  };

  /* =========================
     SMALL COMPONENTS
  ========================= */

  function StatusBadge({
    label,
    className,
    icon,
  }) {
    return (
      <Tag
        className={`consignment-detail-status ${className}`}
        icon={icon}
      >
        {label}
      </Tag>
    );
  }

  function DetailItem({
    icon,
    label,
    value,
    fullWidth = false,
    copyable = false,
  }) {
    const displayValue =
      value === undefined ||
      value === null ||
      value === ""
        ? "—"
        : value;

    const handleCopy = async () => {
      try {
        await copyText(displayValue);

        AuthNotify.success(
          "Đã sao chép",
          `${label} đã được sao chép.`
        );
      } catch (error) {
        AuthNotify.error(
          "Không thể sao chép",
          error?.message ||
            "Vui lòng thử lại."
        );
      }
    };

    return (
      <div
        className={`consignment-detail-item ${
          fullWidth
            ? "is-full-width"
            : ""
        }`}
      >
        <div className="consignment-detail-item__icon">
          {icon}
        </div>

        <div className="consignment-detail-item__content">
          <span className="consignment-detail-item__label">
            {label}
          </span>

          <div className="consignment-detail-item__value-row">
            <strong className="consignment-detail-item__value">
              {displayValue}
            </strong>

            {copyable &&
              displayValue !== "—" && (
                <Tooltip title="Sao chép">
                  <button
                    type="button"
                    className="consignment-copy-button"
                    onClick={handleCopy}
                    aria-label={`Sao chép ${label}`}
                  >
                    <CopyOutlined />
                  </button>
                </Tooltip>
              )}
          </div>
        </div>
      </div>
    );
  }

  function SectionTitle({
    icon,
    title,
    description,
    extra,
  }) {
    return (
      <div className="consignment-section-heading">
        <div className="consignment-section-heading__left">
          <div className="consignment-section-heading__icon">
            {icon}
          </div>

          <div>
            <h2>{title}</h2>

            {description && (
              <p>{description}</p>
            )}
          </div>
        </div>

        {extra && (
          <div className="consignment-section-heading__extra">
            {extra}
          </div>
        )}
      </div>
    );
  }

  /* =========================
     LOADING
  ========================= */

  function DetailLoading() {
    return (
      <div className="consignment-detail-page">
        <div className="consignment-detail-loading-header">
          <Skeleton.Button
            active
            size="small"
          />

          <Skeleton.Input
            active
            size="large"
          />
        </div>

        <div className="consignment-detail-skeleton-grid">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="consignment-detail-card"
            >
              <Skeleton
                active
                paragraph={{ rows: 5 }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* =========================
     COMPONENT
  ========================= */

  export default function ConsignmentDetail() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    const orderId =
      params?.orderId ||
      location?.state?.consignment
        ?.orderId ||
      location?.state?.orderId ||
      "";

    const [detail, setDetail] =
      useState(null);

    const [
      productTypes,
      setProductTypes,
    ] = useState([]);

    const [
      pricingRules,
      setPricingRules,
    ] = useState([]);

    const [
      warehouses,
      setWarehouses,
    ] = useState([]);

    const [
      servicePricings,
      setServicePricings,
    ] = useState([]);

    const [loading, setLoading] =
      useState(true);

    const [error, setError] =
      useState("");

    const [
      masterDataWarning,
      setMasterDataWarning,
    ] = useState("");

    const [quotationForm] =
      Form.useForm();

    const [estimating, setEstimating] =
      useState(false);

    const [sending, setSending] =
      useState(false);

    const [
      enabledFeeCodes,
      setEnabledFeeCodes,
    ] = useState({});

    const quotationFormOrderRef =
      useRef("");

    const pricingRuleInitRef =
      useRef("");

    const loadPageData =
      useCallback(async () => {
        if (!orderId) {
          setError(
            "Không tìm thấy mã đơn ký gửi."
          );
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setError("");
          setMasterDataWarning("");

          const [
            detailResult,
            productTypeResult,
            pricingRuleResult,
            warehouseResult,
            servicePricingResult,
          ] = await Promise.allSettled([
            getConsignmentDetailApi(
              orderId
            ),
            getProductTypesApi(),
            getActivePricingRulesApi(),
            getOriginWarehousesApi(),
            getServicePricingsApi(),
          ]);

          if (
            detailResult.status ===
            "rejected"
          ) {
            throw detailResult.reason;
          }

          setDetail(
            detailResult.value || null
          );

          if (
            productTypeResult.status ===
            "fulfilled"
          ) {
            setProductTypes(
              Array.isArray(
                productTypeResult.value
              )
                ? productTypeResult.value
                : []
            );
          } else {
            console.error(
              "GET PRODUCT TYPES ERROR:",
              productTypeResult.reason
            );
            setProductTypes([]);
          }

          if (
            pricingRuleResult.status ===
            "fulfilled"
          ) {
            setPricingRules(
              Array.isArray(
                pricingRuleResult.value
              )
                ? pricingRuleResult.value
                : []
            );
          } else {
            console.error(
              "GET PRICING RULES ERROR:",
              pricingRuleResult.reason
            );
            setPricingRules([]);
          }

          if (
            warehouseResult.status ===
            "fulfilled"
          ) {
            setWarehouses(
              Array.isArray(
                warehouseResult.value
              )
                ? warehouseResult.value
                : []
            );
          } else {
            console.error(
              "GET ORIGIN WAREHOUSES ERROR:",
              warehouseResult.reason
            );
            setWarehouses([]);
          }

          if (
            servicePricingResult.status ===
            "fulfilled"
          ) {
            setServicePricings(
              Array.isArray(
                servicePricingResult.value
              )
                ? servicePricingResult.value
                : []
            );
          } else {
            console.error(
              "GET SERVICE PRICINGS ERROR:",
              servicePricingResult.reason
            );
            setServicePricings([]);
          }

          const warningMessages = [];

          if (
            productTypeResult.status ===
            "rejected"
          ) {
            warningMessages.push(
              "Không tải được danh sách loại hàng."
            );
          }

          if (
            pricingRuleResult.status ===
            "rejected"
          ) {
            warningMessages.push(
              "Không tải được hệ số DIM; hệ thống đang dùng hệ số mặc định 5.000."
            );
          }

          if (
            warehouseResult.status ===
            "rejected"
          ) {
            warningMessages.push(
              "Không tải được danh sách kho Origin đang hoạt động."
            );
          }

          if (
            servicePricingResult.status ===
            "rejected"
          ) {
            warningMessages.push(
              "Không tải được bảng giá dịch vụ."
            );
          }

          setMasterDataWarning(
            warningMessages.join(" ")
          );
        } catch (requestError) {
          console.error(
            "GET CONSIGNMENT DETAIL ERROR:",
            requestError
          );

          const message =
            requestError?.response?.data
              ?.message ||
            requestError?.response?.data
              ?.error ||
            requestError?.message ||
            "Không thể tải chi tiết yêu cầu ký gửi.";

          setError(message);

          AuthNotify.error(
            "Tải dữ liệu thất bại",
            message
          );
        } finally {
          setLoading(false);
        }
      }, [orderId]);

    const refreshDetailOnly =
      useCallback(async () => {
        const nextDetail =
          await getConsignmentDetailApi(
            orderId
          );

        setDetail(nextDetail || null);

        return nextDetail;
      }, [orderId]);

    useEffect(() => {
      loadPageData();
    }, [loadPageData]);

    const orderStatus = useMemo(
      () =>
        getOrderStatus(detail?.status),
      [detail?.status]
    );

    const quotationStatus = useMemo(
      () =>
        getQuotationStatus(
          detail?.quotation?.status
        ),
      [detail?.quotation?.status]
    );

    const quotation =
      detail?.quotation || null;

    const items = useMemo(() => {
      return Array.isArray(detail?.items)
        ? detail.items
        : [];
    }, [detail?.items]);

    const productTypeMap =
      useMemo(() => {
        return new Map(
          productTypes.flatMap(
            (item) => {
              const id = normalizeText(
                item?.id
              );
              const name =
                normalizeText(
                  item?.name
                );

              if (!id || !name) {
                return [];
              }

              return [
                [id, name],
                [id.toLowerCase(), name],
                [name, name],
                [name.toLowerCase(), name],
              ];
            }
          )
        );
      }, [productTypes]);

    const dimRule = useMemo(() => {
      return findPricingRuleByCode(
        pricingRules,
        "VOLUMETRIC_DIVISOR"
      );
    }, [pricingRules]);

    const dimDivisor = useMemo(() => {
      const apiValue =
        normalizePositiveNumber(
          dimRule?.value
        );

      return apiValue > 0
        ? apiValue
        : DEFAULT_DIM_DIVISOR;
    }, [dimRule]);

    const isDimDivisorFromApi =
      Boolean(
        dimRule &&
        normalizePositiveNumber(
          dimRule?.value
        ) > 0
      );

    /*
     * Mỗi phần tử trong items là 1 kiện.
     * Không cộng quantity để tính số kiện.
     */
    const packageCount = items.length;

    const totalItemWeightKg =
      useMemo(() => {
        return roundToDecimals(
          items.reduce(
            (total, item) =>
              total +
              getItemWeightKg(item),
            0
          ),
          DIM_DECIMAL_PLACES
        );
      }, [items]);

    const apiTotalWeightKg =
      normalizePositiveNumber(
        detail?.totalWeight
      );

    const displayTotalWeightKg =
      apiTotalWeightKg > 0
        ? apiTotalWeightKg
        : totalItemWeightKg;

    const calculatedTotalVolumeCm3 =
      useMemo(() => {
        if (items.length === 0) {
          return normalizePositiveNumber(
            detail?.totalVolume
          );
        }

        return roundToDecimals(
          items.reduce(
            (total, item) =>
              total +
              calculateItemVolumeCm3(
                item
              ),
            0
          ),
          DIM_DECIMAL_PLACES
        );
      }, [
        items,
        detail?.totalVolume,
      ]);

    const totalVolumeM3 =
      convertCm3ToM3(
        calculatedTotalVolumeCm3
      );

    const totalDimKg = useMemo(() => {
      return roundToDecimals(
        items.reduce(
          (total, item) =>
            total +
            calculateItemDimKg(
              item,
              dimDivisor
            ),
          0
        ),
        DIM_DECIMAL_PLACES
      );
    }, [items, dimDivisor]);

    const chargeableWeightKg =
      useMemo(() => {
        return roundToDecimals(
          Math.max(
            displayTotalWeightKg,
            totalDimKg
          ),
          DIM_DECIMAL_PLACES
        );
      }, [
        displayTotalWeightKg,
        totalDimKg,
      ]);

    const watchedUnitPrice =
      Form.useWatch(
        "unitPrice",
        quotationForm
      ) ?? 0;

    const watchedUnitType =
      Form.useWatch(
        "unitType",
        quotationForm
      ) || "KG";

    const watchedDeclaredValue =
      Form.useWatch(
        "declaredValue",
        quotationForm
      ) ?? 0;

    const watchedDiscountPercent =
      Form.useWatch(
        "discountPercent",
        quotationForm
      ) ?? 0;

    const watchedVat =
      Form.useWatch(
        "vat",
        quotationForm
      ) ?? 0;

    const watchedImportTax =
      Form.useWatch(
        "importTax",
        quotationForm
      ) ?? 0;

    const selectedServicePricingId =
      Form.useWatch(
        "servicePricingId",
        quotationForm
      );

    const routeCountries = useMemo(
      () =>
        parseRouteCountries(
          detail?.route
        ),
      [detail?.route]
    );

    const routeCountryCodes =
      useMemo(() => {
        return {
          originCountry:
            normalizeCountryCode(
              routeCountries.originCountry
            ),
          destinationCountry:
            normalizeCountryCode(
              routeCountries
                .destinationCountry
            ),
        };
      }, [routeCountries]);

    const warehouseOptions =
      useMemo(
        () =>
          mapWarehousesToOptions(
            warehouses
          ),
        [warehouses]
      );

    const hasSingleOriginWarehouse =
      warehouses.length === 1;

    const singleOriginWarehouse =
      hasSingleOriginWarehouse
        ? warehouses[0]
        : null;

    const hasMultipleOriginWarehouses =
      warehouses.length > 1;

    const hasOriginWarehouse =
      warehouses.length > 0;

    const servicePricingOptions =
      useMemo(
        () =>
          mapServicePricingsToOptions(
            servicePricings
          ),
        [servicePricings]
      );

    const selectedServicePricing =
      useMemo(
        () =>
          findServicePricingById(
            servicePricings,
            selectedServicePricingId
          ),
        [
          servicePricings,
          selectedServicePricingId,
        ]
      );

    const handleServicePricingChange =
      useCallback(
        (servicePricingId) => {
          const pricing =
            findServicePricingById(
              servicePricings,
              servicePricingId
            );

          if (!pricing) {
            quotationForm.setFieldsValue({
              servicePricingId:
                undefined,
              serviceType:
                normalizeServiceTypeCode(
                  detail?.consignmentType
                ),
              originCountry:
                routeCountryCodes
                  .originCountry,
              destinationCountry:
                routeCountryCodes
                  .destinationCountry,
              unitType: "KG",
              unitPrice: 0,
            });
            return;
          }

          quotationForm.setFieldsValue({
            servicePricingId:
              pricing.id,
            serviceType:
              pricing.serviceType,
            originCountry:
              pricing.originCountry,
            destinationCountry:
              pricing.destinationCountry,
            unitType:
              pricing.unitType,
            unitPrice:
              normalizePositiveNumber(
                pricing.price
              ),
          });
        },
        [
          detail?.consignmentType,
          quotationForm,
          routeCountryCodes,
          servicePricings,
        ]
      );

    useEffect(() => {
      if (
        !hasSingleOriginWarehouse ||
        !singleOriginWarehouse?.id
      ) {
        return;
      }

      const currentWarehouseId =
        quotationForm.getFieldValue(
          "warehouseId"
        );

      if (
        currentWarehouseId !==
        singleOriginWarehouse.id
      ) {
        quotationForm.setFieldValue(
          "warehouseId",
          singleOriginWarehouse.id
        );
      }
    }, [
      hasSingleOriginWarehouse,
      quotationForm,
      singleOriginWarehouse,
    ]);

    useEffect(() => {
      if (!detail?.orderId) {
        return;
      }

      const formInitKey = [
        detail.orderId,
        warehouses.length,
        servicePricings.length,
        normalizeText(
          quotation?.servicePricingId
        ),
      ].join(":");

      if (
        quotationFormOrderRef.current ===
        formInitKey
      ) {
        return;
      }

      const quotationPricing =
        findServicePricingById(
          servicePricings,
          quotation?.servicePricingId
        );

      const matchedPricing =
        findMatchingServicePricing(
          servicePricings,
          {
            serviceType:
              normalizeServiceTypeCode(
                quotation?.serviceType ||
                  detail?.consignmentType
              ),
            originCountry:
              normalizeCountryCode(
                quotation?.originCountry ||
                  routeCountries
                    .originCountry
              ),
            destinationCountry:
              normalizeCountryCode(
                quotation
                  ?.destinationCountry ||
                  routeCountries
                    .destinationCountry
              ),
            unitType:
              normalizeText(
                quotation?.unitType
              ).toUpperCase() ||
              "KG",
          }
        );

      const defaultPricing =
        quotationPricing ||
        matchedPricing ||
        null;

      const quotationWarehouseId =
        normalizeText(
          quotation?.warehouseId
        );

      const quotationWarehouseExists =
        warehouses.some(
          (warehouse) =>
            normalizeText(
              warehouse?.id
            ) ===
            quotationWarehouseId
        );

      const defaultWarehouse =
        quotationWarehouseExists
          ? quotationWarehouseId
          : warehouses.length === 1
            ? warehouses[0].id
            : "";

      quotationForm.setFieldsValue({
        warehouseId:
          defaultWarehouse,
        servicePricingId:
          defaultPricing?.id ||
          normalizeText(
            quotation?.servicePricingId
          ) ||
          undefined,
        serviceType:
          defaultPricing
            ?.serviceType ||
          normalizeServiceTypeCode(
            quotation?.serviceType ||
              detail?.consignmentType
          ),
        originCountry:
          defaultPricing
            ?.originCountry ||
          normalizeCountryCode(
            quotation?.originCountry ||
              routeCountries.originCountry
          ),
        destinationCountry:
          defaultPricing
            ?.destinationCountry ||
          normalizeCountryCode(
            quotation
              ?.destinationCountry ||
              routeCountries
                .destinationCountry
          ),
        unitType:
          defaultPricing?.unitType ||
          normalizeText(
            quotation?.unitType
          ).toUpperCase() ||
          "KG",
        unitPrice:
          defaultPricing
            ? normalizePositiveNumber(
                defaultPricing.price
              )
            : normalizePositiveNumber(
                quotation?.unitPrice
              ),
        declaredValue:
          normalizePositiveNumber(
            detail?.declaredValue ??
              quotation?.declaredValue
          ),
        discountPercent:
          clampNumber(
            quotation?.discountPercent,
            0,
            100
          ),
        vat:
          normalizePositiveNumber(
            quotation?.vat
          ),
        importTax:
          normalizePositiveNumber(
            quotation?.importTax ??
              quotation?.taxAndDuty
          ),
        salesNote:
          normalizeText(
            quotation?.salesNote
          ),
      });

      quotationFormOrderRef.current =
        formInitKey;
    }, [
      detail,
      quotation,
      quotationForm,
      routeCountries,
      servicePricings,
      warehouses,
    ]);

    useEffect(() => {
      const initKey = `${orderId}:${pricingRules
        .map((rule) =>
          normalizeText(
            rule?.ruleCode
          ).toUpperCase()
        )
        .join("|")}`;

      if (
        !pricingRules.length ||
        pricingRuleInitRef.current ===
          initKey
      ) {
        return;
      }

      const nextEnabledFeeCodes = {};

      pricingRules.forEach((rule) => {
        const code = normalizeText(
          rule?.ruleCode
        ).toUpperCase();

        if (
          !code ||
          code ===
            "VOLUMETRIC_DIVISOR"
        ) {
          return;
        }

        const conditionType =
          normalizeText(
            rule?.conditionType
          ).toUpperCase();

        nextEnabledFeeCodes[code] =
          rule?.isRequired === true ||
          code === "DOMESTIC_FEE" ||
          (conditionType ===
            "REQUIRES_INSPECTION" &&
            detail?.requiresInspection ===
              true);
      });

      setEnabledFeeCodes(
        nextEnabledFeeCodes
      );

      pricingRuleInitRef.current =
        initKey;
    }, [
      detail?.requiresInspection,
      orderId,
      pricingRules,
    ]);

    const quotationFeeRows = useMemo(
      () =>
        buildFeeRows({
          pricingRules,
          enabledFeeCodes,
          declaredValue:
            watchedDeclaredValue,
          packageCount,
          requiresInspection:
            detail?.requiresInspection,
        }),
      [
        pricingRules,
        enabledFeeCodes,
        watchedDeclaredValue,
        packageCount,
        detail?.requiresInspection,
      ]
    );

    const billingQuantity = useMemo(() => {
      const unitType = normalizeText(
        watchedUnitType
      ).toUpperCase();

      if (unitType === "M3") {
        return totalVolumeM3;
      }

      if (unitType === "PACKAGE") {
        return packageCount;
      }

      return chargeableWeightKg;
    }, [
      watchedUnitType,
      totalVolumeM3,
      packageCount,
      chargeableWeightKg,
    ]);

    const mainServiceAmount =
      useMemo(() => {
        return roundToDecimals(
          normalizePositiveNumber(
            watchedUnitPrice
          ) *
            normalizePositiveNumber(
              billingQuantity
            ),
          2
        );
      }, [
        watchedUnitPrice,
        billingQuantity,
      ]);

    const additionalFeeTotal =
      useMemo(() => {
        return roundToDecimals(
          quotationFeeRows
            .filter(
              (fee) => fee.enabled
            )
            .reduce(
              (total, fee) =>
                total +
                normalizePositiveNumber(
                  fee.amount
                ),
              0
            ),
          2
        );
      }, [quotationFeeRows]);

    const quotationSubtotal =
      roundToDecimals(
        mainServiceAmount +
          additionalFeeTotal,
        2
      );

    const quotationDiscount =
      roundToDecimals(
        quotationSubtotal *
          (clampNumber(
            watchedDiscountPercent,
            0,
            100
          ) /
            100),
        2
      );

    const quotationTotal =
      roundToDecimals(
        quotationSubtotal -
          quotationDiscount +
          normalizePositiveNumber(
            watchedVat
          ) +
          normalizePositiveNumber(
            watchedImportTax
          ),
        2
      );

    const quotationBusy =
      estimating || sending;

    const canCreateQuotation =
      packageCount > 0 &&
      displayTotalWeightKg > 0 &&
      totalVolumeM3 > 0 &&
      hasOriginWarehouse &&
      servicePricings.length > 0 &&
      ![
        "COMPLETED",
        "CANCELLED",
      ].includes(
        normalizeText(
          detail?.status
        ).toUpperCase()
      );

    const buildQuotationPayload = (
      values
    ) => {
      if (packageCount <= 0) {
        throw new Error(
          "Đơn hàng chưa có kiện sản phẩm để tạo báo giá."
        );
      }

      if (displayTotalWeightKg <= 0) {
        throw new Error(
          "Tổng trọng lượng phải lớn hơn 0 kg."
        );
      }

      if (totalVolumeM3 <= 0) {
        throw new Error(
          "Tổng thể tích phải lớn hơn 0 m³."
        );
      }

      const warehouseId =
        normalizeText(
          values?.warehouseId
        );

      if (!warehouseId) {
        throw new Error(
          "Không tìm thấy kho Origin để xử lý báo giá."
        );
      }

      const unitType = normalizeText(
        values?.unitType
      ).toUpperCase();

      const unitPrice =
        normalizePositiveNumber(
          values?.unitPrice
        );

      const declaredValue =
        normalizePositiveNumber(
          values?.declaredValue
        );

      const discountPercent =
        clampNumber(
          values?.discountPercent,
          0,
          100
        );

      const feeRows = buildFeeRows({
        pricingRules,
        enabledFeeCodes,
        declaredValue,
        packageCount,
        requiresInspection:
          detail?.requiresInspection,
      });

      const activeFees = feeRows.filter(
        (fee) => fee.enabled
      );

      const calculatedBillingQuantity =
        unitType === "M3"
          ? totalVolumeM3
          : unitType === "PACKAGE"
            ? packageCount
            : chargeableWeightKg;

      const calculatedMainAmount =
        roundToDecimals(
          unitPrice *
            calculatedBillingQuantity,
          2
        );

      const calculatedFeeTotal =
        roundToDecimals(
          activeFees.reduce(
            (total, fee) =>
              total + fee.amount,
            0
          ),
          2
        );

      const subtotal = roundToDecimals(
        calculatedMainAmount +
          calculatedFeeTotal,
        2
      );

      const discount = roundToDecimals(
        subtotal *
          (discountPercent / 100),
        2
      );

      const vat =
        normalizePositiveNumber(
          values?.vat
        );

      const importTax =
        normalizePositiveNumber(
          values?.importTax
        );

      const total = roundToDecimals(
        subtotal -
          discount +
          vat +
          importTax,
        2
      );

      const salesNote = normalizeText(
        values?.salesNote
      );

      return {
        warehouseId,
        servicePricingId:
          normalizeText(
            values?.servicePricingId
          ),
        serviceType:
          normalizeServiceTypeCode(
            values?.serviceType
          ),
        weightKg: displayTotalWeightKg,
        volumeM3: roundToDecimals(
          totalVolumeM3,
          6
        ),
        packageCount,
        declaredValue,
        salesNote,
        quotation: {
          servicePricingId:
            normalizeText(
              values?.servicePricingId
            ),
          serviceType:
            normalizeServiceTypeCode(
              values?.serviceType
            ),
          originCountry:
            normalizeCountryCode(
              values?.originCountry
            ),
          destinationCountry:
            normalizeCountryCode(
              values?.destinationCountry
            ),
          unitType,
          unitPrice,
          currency: "VND",
          totalWeight:
            displayTotalWeightKg,
          totalVolume:
            calculatedTotalVolumeCm3,
          volumetricWeight:
            totalDimKg,
          chargeableWeight:
            chargeableWeightKg,
          mainServiceAmount:
            calculatedMainAmount,
          additionalFees:
            activeFees.map((fee) => ({
              feeId: fee.id,
              code: fee.code,
              label:
                fee.ruleName ||
                fee.code,
              amount: fee.amount,
              enabled: true,
            })),
          discountPercent,
          subtotal,
          discount,
          total,
          estimatedFreightCharge:
            calculatedMainAmount,
          serviceFee:
            calculatedFeeTotal,
          totalEstimatedCost: total,
          vat,
          importTax,
          salesNote,
        },
      };
    };

    const mergeQuotationResponse = (
      response
    ) => {
      const nextQuotation =
        response?.quotation ||
        response?.data?.quotation ||
        response;

      if (
        !nextQuotation ||
        typeof nextQuotation !== "object"
      ) {
        return;
      }

      setDetail((previous) => ({
        ...previous,
        quotation: {
          ...(previous?.quotation || {}),
          ...nextQuotation,
        },
      }));
    };

    const syncQuotationDetail = async (
      response
    ) => {
      mergeQuotationResponse(response);

      try {
        await refreshDetailOnly();
      } catch (syncError) {
        console.error(
          "REFRESH DETAIL AFTER QUOTATION ERROR:",
          syncError
        );
      }
    };

    const handleEstimateQuotation =
      async () => {
        if (quotationBusy) {
          return;
        }

        try {
          const values =
            await quotationForm.validateFields();

          const payload =
            buildQuotationPayload(values);

          setEstimating(true);

          const response =
            await estimateQuotationApi(
              orderId,
              payload
            );

          await syncQuotationDetail(
            response
          );

          AuthNotify.success(
            "Ước tính thành công",
            "Báo giá tạm tính đã được tạo và đồng bộ vào đơn hàng."
          );
        } catch (estimateError) {
          if (estimateError?.errorFields) {
            return;
          }

          console.error(
            "ESTIMATE QUOTATION ERROR:",
            estimateError
          );

          AuthNotify.error(
            "Không thể tạo báo giá tạm tính",
            getQuotationErrorMessage(
              estimateError,
              "Vui lòng kiểm tra lại thông tin báo giá."
            )
          );
        } finally {
          setEstimating(false);
        }
      };

    const handleSendQuotation =
      async () => {
        if (quotationBusy) {
          return;
        }

        try {
          const values =
            await quotationForm.validateFields();

          const payload =
            buildQuotationPayload(values);

          setSending(true);

          const response =
            await sendQuotationApi(
              orderId,
              payload
            );

          await syncQuotationDetail(
            response
          );

          AuthNotify.success(
            "Tạo báo giá thành công",
            "Báo giá chính thức đã được tạo và gửi đến khách hàng."
          );
        } catch (sendError) {
          if (sendError?.errorFields) {
            return;
          }

          console.error(
            "SEND QUOTATION ERROR:",
            sendError
          );

          AuthNotify.error(
            "Không thể gửi báo giá",
            getQuotationErrorMessage(
              sendError,
              "Vui lòng kiểm tra lại thông tin báo giá."
            )
          );
        } finally {
          setSending(false);
        }
      };

    if (loading) {
      return <DetailLoading />;
    }

    if (error || !detail) {
      return (
        <main className="consignment-detail-page">
          <div className="consignment-detail-error">
            <div className="consignment-detail-error__icon">
              <InboxOutlined />
            </div>

            <h2>
              Không thể hiển thị đơn ký gửi
            </h2>

            <p>
              {error ||
                "Không tìm thấy dữ liệu đơn ký gửi."}
            </p>

            <div className="consignment-detail-error__actions">
              <Button
                icon={
                  <ArrowLeftOutlined />
                }
                onClick={() =>
                  navigate(-1)
                }
              >
                Quay lại
              </Button>

              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={loadPageData}
              >
                Tải lại
              </Button>
            </div>
          </div>
        </main>
      );
    }

    return (
      <main className="consignment-detail-page">
        {/* ================= HEADER ================= */}

        <div className="consignment-detail-topbar">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            className="consignment-back-button"
            onClick={() => navigate(-1)}
          >
            Quay lại danh sách
          </Button>
        </div>

        {masterDataWarning && (
          <div
            className="consignment-master-warning"
            role="alert"
          >
            <SafetyCertificateOutlined />

            <span>
              {masterDataWarning}
            </span>

            <Button
              size="small"
              type="text"
              icon={<ReloadOutlined />}
              onClick={loadPageData}
            >
              Tải lại
            </Button>
          </div>
        )}

        <section className="consignment-detail-hero">
          <div className="consignment-detail-hero__main">
            <span className="consignment-detail-eyebrow">
              CHI TIẾT YÊU CẦU KÝ GỬI
            </span>

            <div className="consignment-detail-title-row">
              <div>
                <h1>
                  {detail?.consignmentCode ||
                    "Đơn ký gửi"}
                </h1>

                <button
                  type="button"
                  className="consignment-code-copy"
                  onClick={async () => {
                    try {
                      await copyText(
                        detail?.consignmentCode
                      );

                      AuthNotify.success(
                        "Đã sao chép",
                        "Mã yêu cầu ký gửi đã được sao chép."
                      );
                    } catch (copyError) {
                      AuthNotify.error(
                        "Không thể sao chép",
                        copyError?.message ||
                          "Vui lòng thử lại."
                      );
                    }
                  }}
                >
                  <CopyOutlined />
                  Sao chép mã
                </button>
              </div>

              <StatusBadge
                label={orderStatus.label}
                className={
                  orderStatus.className
                }
                icon={<SendOutlined />}
              />
            </div>

            <p className="consignment-detail-description">
              Theo dõi thông tin yêu cầu, người nhận,
              khách hàng, từng kiện hàng và báo giá.
            </p>
          </div>

          <div className="consignment-detail-hero__meta">
            <div>
              <CalendarOutlined />
              <span>Ngày tạo</span>

              <strong>
                {formatDateTime(
                  detail?.createdAt
                )}
              </strong>
            </div>

            <div>
              <TagsOutlined />
              <span>Loại dịch vụ</span>

              <strong>
                {translateConsignmentType(
                  detail?.consignmentType
                )}
              </strong>
            </div>
          </div>
        </section>

        {/* ================= SUMMARY ================= */}

        <section className="consignment-summary-grid">
          <article className="consignment-summary-card">
            <div className="consignment-summary-card__icon">
              <ShoppingOutlined />
            </div>

            <div>
              <span>
                Tổng trọng lượng
              </span>

              <strong>
                {formatMeasurement(
                  displayTotalWeightKg,
                  4
                )}{" "}
                kg
              </strong>
            </div>
          </article>

          <article className="consignment-summary-card">
            <div className="consignment-summary-card__icon">
              <InboxOutlined />
            </div>

            <div>
              <span>Tổng số kiện</span>

              <strong>
                {formatMeasurement(
                  packageCount,
                  0
                )}{" "}
                kiện
              </strong>

              <small>
                1 dòng sản phẩm = 1 kiện
              </small>
            </div>
          </article>

          <article className="consignment-summary-card">
            <div className="consignment-summary-card__icon">
              <TagsOutlined />
            </div>

            <div>
              <span>Tổng thể tích</span>

              <strong>
                {formatMeasurement(
                  calculatedTotalVolumeCm3,
                  4
                )}{" "}
                cm³
              </strong>

              <small>
                {formatMeasurement(
                  totalVolumeM3,
                  6
                )}{" "}
                m³
              </small>
            </div>
          </article>

          <article className="consignment-summary-card is-dim">
            <div className="consignment-summary-card__icon">
              <FileTextOutlined />
            </div>

            <div>
              <span>Tổng DIM</span>

              <strong>
                {formatDimWeight(
                  totalDimKg
                )}{" "}
                kg
              </strong>

              <small>
                Hệ số{" "}
                {formatMeasurement(
                  dimDivisor,
                  0
                )}
              </small>
            </div>
          </article>

          <article className="consignment-summary-card">
            <div className="consignment-summary-card__icon">
              <SafetyCertificateOutlined />
            </div>

            <div>
              <span>Kiểm hàng</span>

              <strong>
                {detail?.requiresInspection
                  ? "Có yêu cầu"
                  : "Không yêu cầu"}
              </strong>
            </div>
          </article>

          <article className="consignment-summary-card is-total">
            <div className="consignment-summary-card__icon">
              <DollarOutlined />
            </div>

            <div>
              <span>Tổng báo giá</span>

              <strong>
                {formatCurrency(
                  quotation
                    ?.totalEstimatedCost
                )}
              </strong>
            </div>
          </article>
        </section>

        <div className="consignment-detail-layout">
          <div className="consignment-detail-main">
            {/* ================= ORDER ================= */}

            <section className="consignment-detail-card">
              <SectionTitle
                icon={<FileTextOutlined />}
                title="Thông tin yêu cầu"
                description="Thông tin vận chuyển và xử lý đơn ký gửi."
              />

              <div className="consignment-detail-info-grid">
                <DetailItem
                  icon={<TagsOutlined />}
                  label="Mã ký gửi"
                  value={
                    detail?.consignmentCode
                  }
                  copyable
                />

                <DetailItem
                  icon={<SendOutlined />}
                  label="Loại dịch vụ"
                  value={translateConsignmentType(
                    detail?.consignmentType
                  )}
                />

                <DetailItem
                  icon={
                    <EnvironmentOutlined />
                  }
                  label="Tuyến hàng"
                  value={detail?.route}
                  fullWidth
                />

                <DetailItem
                  icon={<CalendarOutlined />}
                  label="Ngày tạo"
                  value={formatDateTime(
                    detail?.createdAt
                  )}
                />

                <DetailItem
                  icon={
                    <SafetyCertificateOutlined />
                  }
                  label="Yêu cầu kiểm hàng"
                  value={
                    detail
                      ?.requiresInspection
                      ? "Có"
                      : "Không"
                  }
                />

                <DetailItem
                  icon={<InboxOutlined />}
                  label="Tổng số kiện"
                  value={`${packageCount} kiện`}
                />

                <DetailItem
                  icon={<FileTextOutlined />}
                  label="Hệ số DIM"
                  value={`${formatMeasurement(
                    dimDivisor,
                    0
                  )}${
                    isDimDivisorFromApi
                      ? " (từ API)"
                      : " (mặc định)"
                  }`}
                />

                <DetailItem
                  icon={<FileTextOutlined />}
                  label="Ghi chú"
                  value={
                    detail?.note ||
                    "Không có ghi chú"
                  }
                  fullWidth
                />
              </div>
            </section>

            {/* ================= RECEIVER ================= */}

            <section className="consignment-detail-card">
              <SectionTitle
                icon={
                  <EnvironmentOutlined />
                }
                title="Thông tin người nhận"
                description="Thông tin giao hàng tại Việt Nam."
              />

              <div className="consignment-detail-info-grid">
                <DetailItem
                  icon={<UserOutlined />}
                  label="Người nhận"
                  value={
                    detail?.receiverName
                  }
                />

                <DetailItem
                  icon={<PhoneOutlined />}
                  label="Số điện thoại"
                  value={
                    detail?.receiverPhone
                  }
                  copyable
                />

                <DetailItem
                  icon={
                    <EnvironmentOutlined />
                  }
                  label="Địa chỉ nhận hàng"
                  value={
                    detail?.receiverAddress
                  }
                  fullWidth
                />
              </div>
            </section>

            {/* ================= ITEMS ================= */}

            <section className="consignment-detail-card consignment-products-card">
              <SectionTitle
                icon={<ShoppingOutlined />}
                title="Danh sách kiện hàng"
                description={`${packageCount} kiện, tương ứng ${packageCount} dòng sản phẩm.`}
                extra={
                  <Tag className="consignment-package-tag">
                    {packageCount} kiện
                  </Tag>
                }
              />

              <div className="consignment-dim-formula">
                <div className="consignment-dim-formula__icon">
                  <FileTextOutlined />
                </div>

                <div className="consignment-dim-formula__content">
                  <span>
                    CÔNG THỨC DIM
                  </span>

                  <strong>
                    (Dài × Rộng × Cao) ÷{" "}
                    {formatMeasurement(
                      dimDivisor,
                      0
                    )}
                  </strong>

                  <small>
                    Kích thước dùng cm, kết quả DIM dùng kg và hiển thị chính xác 4 chữ số thập phân. Không nhân theo số lượng.
                  </small>
                </div>

                <Tag
                  className={`consignment-dim-source ${
                    isDimDivisorFromApi
                      ? "is-api"
                      : "is-fallback"
                  }`}
                >
                  {isDimDivisorFromApi
                    ? "Hệ số từ API"
                    : "Hệ số mặc định"}
                </Tag>
              </div>

              {items.length === 0 ? (
                <div className="consignment-empty-items">
                  <Empty
                    image={
                      Empty.PRESENTED_IMAGE_SIMPLE
                    }
                    description="Yêu cầu này chưa có dữ liệu sản phẩm."
                  />
                </div>
              ) : (
                <div className="consignment-items-table-wrapper">
                  <table className="consignment-items-table">
                    <colgroup>
                      <col className="col-index" />
                      <col className="col-product-name" />
                      <col className="col-product-type" />
                      <col className="col-package" />
                      <col className="col-weight" />
                      <col className="col-dimension" />
                      <col className="col-volume" />
                      <col className="col-dim" />
                    </colgroup>

                    <thead>
                      <tr>
                        <th className="is-center">
                          STT
                        </th>
                        <th>Tên sản phẩm</th>
                        <th>Loại hàng</th>
                        <th className="is-center">
                          Số kiện
                        </th>
                        <th>Trọng lượng</th>
                        <th>Kích thước</th>
                        <th>Thể tích</th>
                        <th>DIM</th>
                      </tr>
                    </thead>

                    <tbody>
                      {items.map(
                        (item, index) => {
                          const itemVolumeCm3 =
                            calculateItemVolumeCm3(
                              item
                            );

                          const itemDimKg =
                            calculateItemDimKg(
                              item,
                              dimDivisor
                            );

                          const productTypeName =
                            getProductTypeName(
                              item,
                              productTypeMap
                            );

                          return (
                            <tr
                              key={
                                item?.itemId ||
                                item?.id ||
                                `${getItemName(
                                  item
                                )}-${index}`
                              }
                            >
                              <td className="is-center">
                                <span className="consignment-index-badge">
                                  {index + 1}
                                </span>
                              </td>

                              <td className="product-name-cell">
                                <div className="consignment-product-name">
                                  <strong>
                                    {getItemName(
                                      item
                                    )}
                                  </strong>

                                  {item
                                    ?.trackingNumber && (
                                    <small>
                                      Mã nội địa:{" "}
                                      {
                                        item.trackingNumber
                                      }
                                    </small>
                                  )}
                                </div>
                              </td>

                              <td className="product-type-cell">
                                <Tag className="consignment-product-type-tag">
                                  {
                                    productTypeName
                                  }
                                </Tag>
                              </td>

                              <td className="is-center">
                                <strong className="consignment-package-count">
                                  1
                                </strong>
                              </td>

                              <td>
                                <strong className="consignment-measure-value">
                                  {formatMeasurement(
                                    getItemWeightKg(
                                      item
                                    ),
                                    4
                                  )}{" "}
                                  kg
                                </strong>
                              </td>

                              <td>
                                <div className="consignment-dimension-value">
                                  <strong>
                                    {formatMeasurement(
                                      getItemLengthCm(
                                        item
                                      ),
                                      4
                                    )}
                                  </strong>
                                  <span>×</span>
                                  <strong>
                                    {formatMeasurement(
                                      getItemWidthCm(
                                        item
                                      ),
                                      4
                                    )}
                                  </strong>
                                  <span>×</span>
                                  <strong>
                                    {formatMeasurement(
                                      getItemHeightCm(
                                        item
                                      ),
                                      4
                                    )}
                                  </strong>
                                  <small>
                                    cm
                                  </small>
                                </div>
                              </td>

                              <td>
                                <strong className="consignment-measure-value">
                                  {formatMeasurement(
                                    itemVolumeCm3,
                                    4
                                  )}{" "}
                                  cm³
                                </strong>
                              </td>

                              <td>
                                <div className="consignment-dim-value">
                                  <strong>
                                    {formatDimWeight(
                                      itemDimKg
                                    )}{" "}
                                    kg
                                  </strong>

                                  <small>
                                    ÷{" "}
                                    {formatMeasurement(
                                      dimDivisor,
                                      0
                                    )}
                                  </small>
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>

                    <tfoot>
                      <tr>
                        <td
                          colSpan={3}
                          className="consignment-table-total-label"
                        >
                          TỔNG CỘNG
                        </td>

                        <td className="is-center">
                          <strong>
                            {packageCount}
                          </strong>
                        </td>

                        <td>
                          <strong>
                            {formatMeasurement(
                              displayTotalWeightKg,
                              4
                            )}{" "}
                            kg
                          </strong>
                        </td>

                        <td>—</td>

                        <td>
                          <strong>
                            {formatMeasurement(
                              calculatedTotalVolumeCm3,
                              4
                            )}{" "}
                            cm³
                          </strong>
                        </td>

                        <td>
                          <strong className="consignment-table-total-dim">
                            {formatDimWeight(
                              totalDimKg
                            )}{" "}
                            kg
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </section>

            {/* ================= QUOTATION BUILDER ================= */}

            <section className="consignment-detail-card quotation-builder-card">
              <SectionTitle
                icon={<DollarOutlined />}
                title="Lập báo giá"
                description="Tạo báo giá tạm tính hoặc gửi báo giá chính thức đến khách hàng."
                extra={
                  <Tag className="quotation-builder-status-tag">
                    {quotation
                      ? translateQuoteType(
                          quotation?.quoteType
                        )
                      : "Chưa có báo giá"}
                  </Tag>
                }
              />

              {!canCreateQuotation && (
                <Alert
                  type="warning"
                  showIcon
                  className="quotation-builder-alert"
                  message="Chưa đủ điều kiện tạo báo giá"
                  description="Đơn phải có kiện hàng, trọng lượng, thể tích, kho Origin đang hoạt động và bảng giá dịch vụ hợp lệ; đồng thời đơn chưa hoàn thành hoặc hủy."
                />
              )}

              <div className="quotation-builder-layout">
                <div className="quotation-builder-form-panel">
                  <Form
                    form={quotationForm}
                    layout="vertical"
                    requiredMark={false}
                    autoComplete="off"
                    className="quotation-builder-form"
                  >
                    <div className="quotation-form-section-title">
                      <span>01</span>
                      <div>
                        <strong>Thông tin xử lý</strong>
                        <small>Kho, bảng giá và tuyến vận chuyển áp dụng.</small>
                      </div>
                    </div>

                    <div className="quotation-form-grid">
                      <div className="quotation-warehouse-field">
                        <span className="quotation-warehouse-field__label">
                          Kho Origin
                        </span>

                        <Form.Item
                          name="warehouseId"
                          hidden
                        >
                          <Input />
                        </Form.Item>

                        {!hasOriginWarehouse ? (
                          <div className="quotation-warehouse-empty">
                            <EnvironmentOutlined />

                            <div>
                              <strong>
                                Không có kho Origin
                              </strong>

                              <span>
                                API /api/warehouses/active không trả về kho Origin đang hoạt động.
                              </span>
                            </div>
                          </div>
                        ) : hasSingleOriginWarehouse ? (
                          <div className="quotation-warehouse-readonly">
                            <div className="quotation-warehouse-readonly__icon">
                              <EnvironmentOutlined />
                            </div>

                            <div className="quotation-warehouse-readonly__content">
                              <strong>
                                {
                                  singleOriginWarehouse
                                    ?.name
                                }
                              </strong>

                              <span>
                                {singleOriginWarehouse
                                  ?.code
                                  ? `${singleOriginWarehouse.code} • `
                                  : ""}
                                {singleOriginWarehouse
                                  ?.address ||
                                  "Chưa cập nhật địa chỉ"}
                              </span>
                            </div>

                            <Tag className="quotation-warehouse-readonly__tag">
                              Tự động chọn
                            </Tag>
                          </div>
                        ) : (
                          <Form.Item
                            name="warehouseId"
                            noStyle
                            rules={[
                              {
                                required: true,
                                message:
                                  "Vui lòng chọn kho Origin.",
                              },
                            ]}
                          >
                            <Select
                              size="large"
                              showSearch
                              allowClear
                              placeholder="Chọn kho Origin"
                              disabled={
                                quotationBusy
                              }
                              options={
                                warehouseOptions
                              }
                              optionFilterProp="searchText"
                              filterOption={(
                                input,
                                option
                              ) =>
                                String(
                                  option
                                    ?.searchText ||
                                    ""
                                ).includes(
                                  String(
                                    input ||
                                      ""
                                  )
                                    .trim()
                                    .toLowerCase()
                                )
                              }
                              optionRender={(
                                option
                              ) => {
                                const warehouse =
                                  option?.data;

                                return (
                                  <div className="quotation-warehouse-option">
                                    <strong>
                                      {
                                        warehouse
                                          ?.name
                                      }
                                    </strong>

                                    <span>
                                      {warehouse
                                        ?.code
                                        ? `${warehouse.code} • `
                                        : ""}
                                      {warehouse
                                        ?.address ||
                                        "Chưa cập nhật địa chỉ"}
                                    </span>
                                  </div>
                                );
                              }}
                            />
                          </Form.Item>
                        )}

                        {hasMultipleOriginWarehouses && (
                          <small className="quotation-warehouse-field__hint">
                            Có {warehouses.length} kho Origin đang hoạt động. Vui lòng chọn kho xử lý.
                          </small>
                        )}
                      </div>

                      <Form.Item
                        name="servicePricingId"
                        label="Bảng giá dịch vụ"
                        rules={[{
                          required: true,
                          message: "Vui lòng chọn bảng giá dịch vụ.",
                        }]}
                      >
                        <Select
                          size="large"
                          showSearch
                          allowClear
                          placeholder="Chọn bảng giá dịch vụ"
                          disabled={quotationBusy}
                          options={
                            servicePricingOptions
                          }
                          optionFilterProp="searchText"
                          filterOption={(
                            input,
                            option
                          ) =>
                            String(
                              option
                                ?.searchText ||
                                ""
                            ).includes(
                              String(
                                input || ""
                              )
                                .trim()
                                .toLowerCase()
                            )
                          }
                          onChange={
                            handleServicePricingChange
                          }
                        />
                      </Form.Item>

                      <Form.Item
                        name="serviceType"
                        label="Loại dịch vụ"
                        rules={[{
                          required: true,
                          message: "Không xác định được loại dịch vụ.",
                        }]}
                      >
                        <Select
                          size="large"
                          disabled
                          options={
                            SERVICE_TYPE_OPTIONS
                          }
                          className="quotation-readonly-field"
                        />
                      </Form.Item>

                      <Form.Item
                        name="unitType"
                        label="Đơn vị tính giá"
                        rules={[{
                          required: true,
                          message: "Vui lòng chọn đơn vị tính giá.",
                        }]}
                      >
                        <Select
                          size="large"
                          disabled={
                            quotationBusy ||
                            Boolean(
                              selectedServicePricing
                            )
                          }
                          options={[
                            { value: "KG", label: "Theo kg tính cước" },
                            { value: "M3", label: "Theo m³" },
                            { value: "PACKAGE", label: "Theo kiện" },
                          ]}
                        />
                      </Form.Item>

                      <Form.Item
                        name="originCountry"
                        label="Quốc gia gửi"
                        rules={[{
                          required: true,
                          message: "Không xác định được quốc gia gửi.",
                        }]}
                      >
                        <Select
                          size="large"
                          disabled
                          options={
                            COUNTRY_OPTIONS
                          }
                          className="quotation-readonly-field"
                        />
                      </Form.Item>

                      <Form.Item
                        name="destinationCountry"
                        label="Quốc gia nhận"
                        rules={[{
                          required: true,
                          message: "Không xác định được quốc gia nhận.",
                        }]}
                      >
                        <Select
                          size="large"
                          disabled
                          options={
                            COUNTRY_OPTIONS
                          }
                          className="quotation-readonly-field"
                        />
                      </Form.Item>
                    </div>

                    <div className="quotation-form-section-title">
                      <span>02</span>
                      <div>
                        <strong>Đơn giá và giá trị hàng</strong>
                        <small>Số tiền tự cập nhật theo đơn vị tính giá.</small>
                      </div>
                    </div>

                    <div className="quotation-form-grid">
                      <Form.Item
                        name="unitPrice"
                        label="Đơn giá"
                        rules={[
                          { required: true, message: "Vui lòng nhập đơn giá." },
                          { type: "number", min: 0, message: "Đơn giá không được âm." },
                        ]}
                      >
                        <InputNumber
                          size="large"
                          min={0}
                          precision={2}
                          controls={false}
                          formatter={currencyInputFormatter}
                          parser={currencyInputParser}
                          addonAfter="₫"
                          disabled={quotationBusy}
                          className="quotation-number-input"
                        />
                      </Form.Item>

                      <Form.Item name="declaredValue" label="Giá trị khai báo">
                        <InputNumber
                          size="large"
                          min={0}
                          precision={2}
                          controls={false}
                          formatter={currencyInputFormatter}
                          parser={currencyInputParser}
                          addonAfter="₫"
                          disabled={quotationBusy}
                          className="quotation-number-input"
                        />
                      </Form.Item>

                      <Form.Item name="discountPercent" label="Chiết khấu">
                        <InputNumber
                          size="large"
                          min={0}
                          max={100}
                          precision={2}
                          controls={false}
                          addonAfter="%"
                          disabled={quotationBusy}
                          className="quotation-number-input"
                        />
                      </Form.Item>

                      <Form.Item name="vat" label="Thuế VAT">
                        <InputNumber
                          size="large"
                          min={0}
                          precision={2}
                          controls={false}
                          formatter={currencyInputFormatter}
                          parser={currencyInputParser}
                          addonAfter="₫"
                          disabled={quotationBusy}
                          className="quotation-number-input"
                        />
                      </Form.Item>

                      <Form.Item name="importTax" label="Thuế nhập khẩu">
                        <InputNumber
                          size="large"
                          min={0}
                          precision={2}
                          controls={false}
                          formatter={currencyInputFormatter}
                          parser={currencyInputParser}
                          addonAfter="₫"
                          disabled={quotationBusy}
                          className="quotation-number-input"
                        />
                      </Form.Item>

                      <Form.Item
                        name="salesNote"
                        label="Ghi chú báo giá"
                        className="quotation-form-full"
                      >
                        <Input.TextArea
                          rows={3}
                          maxLength={500}
                          showCount
                          placeholder="Nhập ghi chú gửi khách hàng"
                          disabled={quotationBusy}
                        />
                      </Form.Item>
                    </div>

                    <div className="quotation-form-section-title">
                      <span>03</span>
                      <div>
                        <strong>Phụ phí áp dụng</strong>
                        <small>Dữ liệu lấy trực tiếp từ pricing-rules.</small>
                      </div>
                    </div>

                    <div className="quotation-fee-list">
                      {quotationFeeRows.length === 0 ? (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="Không có quy tắc phụ phí đang hoạt động."
                        />
                      ) : (
                        quotationFeeRows.map((fee) => (
                          <div
                            key={fee.id || fee.code}
                            className={`quotation-fee-row ${
                              !fee.eligible ? "is-disabled" : ""
                            }`}
                          >
                            <div className="quotation-fee-row__main">
                              <Switch
                                checked={fee.enabled}
                                disabled={
                                  quotationBusy ||
                                  fee.isRequired ||
                                  !fee.eligible
                                }
                                onChange={(checked) => {
                                  setEnabledFeeCodes((previous) => ({
                                    ...previous,
                                    [fee.code]: checked,
                                  }));
                                }}
                              />

                              <div className="quotation-fee-row__content">
                                <strong>{fee.ruleName || fee.code}</strong>
                                <span>{fee.description || "Phụ phí bổ sung"}</span>
                                {!fee.eligible && (
                                  <small>Chưa thỏa điều kiện áp dụng.</small>
                                )}
                              </div>
                            </div>

                            <div className="quotation-fee-row__amount">
                              <strong>{formatCurrency(fee.amount)}</strong>
                              <span>
                                {fee.calculationType === "PERCENTAGE"
                                  ? `${formatMeasurement(fee.value, 2)}%`
                                  : fee.conditionType || "Cố định"}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Form>
                </div>

                <aside className="quotation-live-summary">
                  <div className="quotation-live-summary__header">
                    <span>TẠM TÍNH TRỰC TIẾP</span>
                    <strong>{formatCurrency(quotationTotal)}</strong>
                    <small>Giá trị thay đổi theo dữ liệu biểu mẫu.</small>
                  </div>

                  <div className="quotation-metric-grid">
                    <div>
                      <span>Trọng lượng thực</span>
                      <strong>{formatMeasurement(displayTotalWeightKg, 4)} kg</strong>
                    </div>
                    <div>
                      <span>Trọng lượng DIM</span>
                      <strong>{formatDimWeight(totalDimKg)} kg</strong>
                    </div>
                    <div className="is-highlight">
                      <span>Khối lượng tính cước</span>
                      <strong>{formatMeasurement(chargeableWeightKg, 4)} kg</strong>
                    </div>
                    <div>
                      <span>Số kiện</span>
                      <strong>{packageCount} kiện</strong>
                    </div>
                    <div>
                      <span>Thể tích</span>
                      <strong>{formatMeasurement(totalVolumeM3, 6)} m³</strong>
                    </div>
                    <div>
                      <span>Số lượng tính giá</span>
                      <strong>
                        {formatMeasurement(billingQuantity, 6)}{" "}
                        {watchedUnitType === "PACKAGE"
                          ? "kiện"
                          : watchedUnitType === "M3"
                            ? "m³"
                            : "kg"}
                      </strong>
                    </div>
                  </div>

                  <div className="quotation-calculation-lines">
                    <div><span>Phí dịch vụ chính</span><strong>{formatCurrency(mainServiceAmount)}</strong></div>
                    <div><span>Tổng phụ phí</span><strong>{formatCurrency(additionalFeeTotal)}</strong></div>
                    <div><span>Tạm tính</span><strong>{formatCurrency(quotationSubtotal)}</strong></div>
                    <div className="is-discount">
                      <span>
                        Chiết khấu (
                        {formatMeasurement(
                          watchedDiscountPercent,
                          2
                        )}
                        %)
                      </span>
                      <strong>
                        {normalizePositiveNumber(
                          watchedDiscountPercent
                        ) > 0
                          ? `-${formatCurrency(
                              quotationDiscount
                            )}`
                          : formatCurrency(
                              quotationDiscount
                            )}
                      </strong>
                    </div>
                    <div><span>VAT</span><strong>{formatCurrency(watchedVat)}</strong></div>
                    <div><span>Thuế nhập khẩu</span><strong>{formatCurrency(watchedImportTax)}</strong></div>
                  </div>

                  <div className="quotation-grand-total">
                    <span>Tổng dự kiến</span>
                    <strong>{formatCurrency(quotationTotal)}</strong>
                  </div>

                  <div className="quotation-builder-actions">
                    <Button
                      size="large"
                      icon={<FileTextOutlined />}
                      loading={estimating}
                      disabled={quotationBusy || !canCreateQuotation}
                      onClick={handleEstimateQuotation}
                      className="quotation-estimate-button"
                    >
                      Tạo báo giá tạm tính
                    </Button>

                    <Popconfirm
                      title="Tạo báo giá chính thức?"
                      description="Hệ thống sẽ tạo và gửi báo giá chính thức với dữ liệu hiện tại."
                      okText="Tạo chính thức"
                      cancelText="Kiểm tra lại"
                      placement="topRight"
                      onConfirm={handleSendQuotation}
                      disabled={quotationBusy || !canCreateQuotation}
                    >
                      <Button
                        type="primary"
                        size="large"
                        icon={<SendOutlined />}
                        loading={sending}
                        disabled={quotationBusy || !canCreateQuotation}
                        className="quotation-send-button"
                      >
                        Tạo báo giá chính thức
                      </Button>
                    </Popconfirm>
                  </div>

                  <div className="quotation-builder-note">
                    <SafetyCertificateOutlined />
                    <span>
                      Hệ số DIM: {formatMeasurement(dimDivisor, 0)}{" "}
                      {isDimDivisorFromApi ? "từ API" : "mặc định"}.
                    </span>
                  </div>
                </aside>
              </div>
            </section>
          </div>

          <aside className="consignment-detail-sidebar">
            {/* ================= CUSTOMER ================= */}

            <section className="consignment-detail-card">
              <SectionTitle
                icon={<TeamOutlined />}
                title="Khách hàng"
              />

              <div className="consignment-customer">
                <div className="consignment-customer__avatar">
                  {normalizeText(
                    detail?.customer
                      ?.fullName
                  )
                    .charAt(0)
                    .toUpperCase() || "K"}
                </div>

                <div className="consignment-customer__name">
                  <strong>
                    {detail?.customer
                      ?.fullName ||
                      "Chưa cập nhật"}
                  </strong>

                  <span>
                    Khách hàng ký gửi
                  </span>
                </div>
              </div>

              <div className="consignment-customer__details">
                <DetailItem
                  icon={<MailOutlined />}
                  label="Email"
                  value={
                    detail?.customer?.email
                  }
                  fullWidth
                  copyable
                />

                <DetailItem
                  icon={<PhoneOutlined />}
                  label="Số điện thoại"
                  value={
                    detail?.customer?.phone
                  }
                  fullWidth
                  copyable
                />
              </div>
            </section>

            {/* ================= QUOTATION ================= */}

            <section className="consignment-detail-card consignment-quotation-card">
              <SectionTitle
                icon={<DollarOutlined />}
                title="Báo giá"
                extra={
                  quotation ? (
                    <StatusBadge
                      label={
                        quotationStatus.label
                      }
                      className={
                        quotationStatus.className
                      }
                      icon={
                        quotation?.status ===
                        "DRAFT" ? (
                          <ClockCircleOutlined />
                        ) : (
                          <CheckCircleOutlined />
                        )
                      }
                    />
                  ) : null
                }
              />

              {!quotation ? (
                <Empty
                  image={
                    Empty.PRESENTED_IMAGE_SIMPLE
                  }
                  description="Đơn hàng chưa có báo giá."
                />
              ) : (
                <>
                  <div className="consignment-quotation-type">
                    <span>
                      Loại báo giá
                    </span>

                    <strong>
                      {translateQuoteType(
                        quotation?.quoteType
                      )}
                    </strong>
                  </div>

                  <div className="consignment-quotation-lines">
                    <div>
                      <span>
                        Phí vận chuyển dự kiến
                      </span>

                      <strong>
                        {formatCurrency(
                          quotation
                            ?.estimatedFreightCharge
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Phí dịch vụ
                      </span>

                      <strong>
                        {formatCurrency(
                          quotation
                            ?.serviceFee
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Thuế và phí nhập khẩu
                      </span>

                      <strong>
                        {formatCurrency(
                          quotation
                            ?.taxAndDuty
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="consignment-quotation-total">
                    <span>
                      Tổng chi phí dự kiến
                    </span>

                    <strong>
                      {formatCurrency(
                        quotation
                          ?.totalEstimatedCost
                      )}
                    </strong>
                  </div>

                  <div className="consignment-quotation-dates">
                    <div>
                      <CalendarOutlined />

                      <span>
                        <small>
                          Ngày tạo
                        </small>

                        <strong>
                          {formatDateTime(
                            quotation
                              ?.createdAt
                          )}
                        </strong>
                      </span>
                    </div>

                    <div>
                      <ClockCircleOutlined />

                      <span>
                        <small>
                          Hết hạn
                        </small>

                        <strong>
                          {formatDateTime(
                            quotation
                              ?.expiredAt
                          )}
                        </strong>
                      </span>
                    </div>
                  </div>
                </>
              )}
            </section>
          </aside>
        </div>
      </main>
    );
  }
