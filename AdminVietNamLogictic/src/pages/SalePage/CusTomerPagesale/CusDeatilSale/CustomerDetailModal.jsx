import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Button,
  Empty,
  Modal,
  Skeleton,
  Tag,
  Tooltip,
} from "antd";
import {
  CalendarOutlined,
  CloseOutlined,
  CopyOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";

import {
  getCustomerByIdApi,
} from "../../../../api/SaleAPI/CusSale/CusSaleService";
import AuthNotify from "../../../../utils/Common/AuthNotify";
import "./CustomerDetailModal.css";

const CUSTOMER_STATUS_CONFIG = {
  ACTIVE: {
    label: "Đang hoạt động",
    className: "is-active",
  },
  INACTIVE: {
    label: "Ngừng hoạt động",
    className: "is-inactive",
  },
  BLOCKED: {
    label: "Đã khóa",
    className: "is-blocked",
  },
  PENDING: {
    label: "Chờ kích hoạt",
    className: "is-pending",
  },
  SUSPENDED: {
    label: "Tạm ngưng",
    className: "is-suspended",
  },
  DELETED: {
    label: "Đã xóa",
    className: "is-deleted",
  },
};

const normalizeText = (value) => {
  return String(value ?? "").trim();
};

const pickValue = (...values) => {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      normalizeText(value) !== ""
    ) {
      return value;
    }
  }

  return "";
};

const formatDateTime = (value) => {
  if (!value) {
    return "Chưa cập nhật";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chưa cập nhật";
  }

  return new Intl.DateTimeFormat(
    "vi-VN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
};

const formatDate = (value) => {
  if (!value) {
    return "Chưa cập nhật";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chưa cập nhật";
  }

  return new Intl.DateTimeFormat(
    "vi-VN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(date);
};

const translateGender = (value) => {
  const normalizedValue =
    normalizeText(value).toUpperCase();

  const genderMap = {
    MALE: "Nam",
    FEMALE: "Nữ",
    OTHER: "Khác",
  };

  return (
    genderMap[normalizedValue] ||
    normalizeText(value) ||
    "Chưa cập nhật"
  );
};

const translateAccountType = (value) => {
  const normalizedValue =
    normalizeText(value)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

  const typeMap = {
    CUSTOMER: "Khách hàng",
    INDIVIDUAL: "Cá nhân",
    BUSINESS: "Doanh nghiệp",
    COMPANY: "Doanh nghiệp",
  };

  return (
    typeMap[normalizedValue] ||
    normalizeText(value) ||
    "Khách hàng"
  );
};

const getStatusCode = (customer) => {
  const status = normalizeText(
    customer?.status
  ).toUpperCase();

  if (status) {
    return status;
  }

  return customer?.isActive === true
    ? "ACTIVE"
    : "INACTIVE";
};

const getStatus = (customer) => {
  return (
    CUSTOMER_STATUS_CONFIG[
      getStatusCode(customer)
    ] || {
      label: "Chưa xác định",
      className: "is-unknown",
    }
  );
};

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

function CustomerDetailLoading() {
  return (
    <div className="customer-detail-loading">
      <div className="customer-detail-loading__hero">
        <Skeleton.Avatar
          active
          size={72}
          shape="square"
        />

        <div>
          <Skeleton.Input
            active
            size="large"
          />

          <Skeleton.Input
            active
            size="small"
          />
        </div>
      </div>

      <div className="customer-detail-loading__grid">
        {[1, 2, 3, 4, 5, 6].map(
          (item) => (
            <Skeleton
              key={item}
              active
              paragraph={{
                rows: 2,
              }}
            />
          )
        )}
      </div>
    </div>
  );
}

function CustomerInfoItem({
  icon,
  label,
  value,
  copyable = false,
  fullWidth = false,
}) {
  const displayValue =
    normalizeText(value) ||
    "Chưa cập nhật";

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
      className={`customer-detail-info-item ${
        fullWidth
          ? "is-full-width"
          : ""
      }`}
    >
      <div className="customer-detail-info-item__icon">
        {icon}
      </div>

      <div className="customer-detail-info-item__content">
        <span>{label}</span>

        <div className="customer-detail-info-item__value">
          <strong>
            {displayValue}
          </strong>

          {copyable &&
            displayValue !==
              "Chưa cập nhật" && (
              <Tooltip title="Sao chép">
                <button
                  type="button"
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

export default function CustomerDetailModal({
  open,
  customerId,
  initialCustomer = null,
  onClose,
}) {
  const [customer, setCustomer] =
    useState(initialCustomer);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadCustomerDetail =
    useCallback(async () => {
      if (!customerId) {
        setError(
          "Không tìm thấy mã khách hàng."
        );
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await getCustomerByIdApi(
            customerId
          );

        setCustomer(data || null);
      } catch (requestError) {
        console.error(
          "GET CUSTOMER DETAIL ERROR:",
          requestError
        );

        const message =
          requestError?.response?.data
            ?.message ||
          requestError?.response?.data
            ?.error ||
          requestError?.message ||
          "Không thể tải thông tin khách hàng.";

        setError(message);

        AuthNotify.error(
          "Tải thông tin thất bại",
          message
        );
      } finally {
        setLoading(false);
      }
    }, [customerId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setCustomer(
      initialCustomer || null
    );

    loadCustomerDetail();
  }, [
    open,
    initialCustomer,
    loadCustomerDetail,
  ]);

  const rawCustomer =
    customer?.raw || customer || {};

  const customerView =
    useMemo(() => {
      const address = [
        pickValue(
          rawCustomer?.address,
          customer?.address
        ),
        pickValue(
          rawCustomer?.region,
          rawCustomer?.province,
          rawCustomer?.city,
          customer?.region
        ),
        pickValue(
          rawCustomer?.country,
          customer?.country
        ),
      ]
        .map(normalizeText)
        .filter(Boolean);

      return {
        fullName:
          pickValue(
            rawCustomer?.fullName,
            rawCustomer?.name,
            rawCustomer?.customerName,
            customer?.fullName
          ) ||
          "Chưa cập nhật tên",

        customerCode:
          pickValue(
            rawCustomer?.customerCode,
            rawCustomer?.code,
            customer?.customerCode
          ),

        email:
          pickValue(
            rawCustomer?.email,
            customer?.email
          ),

        phone:
          pickValue(
            rawCustomer?.phone,
            rawCustomer?.phoneNumber,
            customer?.phone
          ),

        address:
          [...new Set(address)].join(
            ", "
          ),

        country:
          pickValue(
            rawCustomer?.country,
            customer?.country
          ),

        region:
          pickValue(
            rawCustomer?.region,
            rawCustomer?.province,
            rawCustomer?.city,
            customer?.region
          ),

        gender:
          translateGender(
            pickValue(
              rawCustomer?.gender,
              rawCustomer?.sex
            )
          ),

        dateOfBirth:
          formatDate(
            pickValue(
              rawCustomer?.dateOfBirth,
              rawCustomer?.birthday,
              rawCustomer?.birthDate
            )
          ),

        accountType:
          translateAccountType(
            pickValue(
              rawCustomer?.customerType,
              rawCustomer?.accountType,
              rawCustomer?.userType,
              rawCustomer?.role,
              "CUSTOMER"
            )
          ),

        createdAt:
          formatDateTime(
            pickValue(
              rawCustomer?.createdAt,
              customer?.createdAt
            )
          ),

        updatedAt:
          formatDateTime(
            pickValue(
              rawCustomer?.updatedAt,
              customer?.updatedAt
            )
          ),

        note:
          pickValue(
            rawCustomer?.note,
            rawCustomer?.notes,
            rawCustomer?.description
          ),
      };
    }, [customer, rawCustomer]);

  const status =
    getStatus(customer);

  const avatarLetter =
    normalizeText(
      customerView.fullName
    )
      .charAt(0)
      .toUpperCase() || "K";

  return (
    <Modal
      open={open}
      centered
      width={900}
      title={null}
      footer={null}
      closeIcon={null}
      maskClosable={!loading}
      className="customer-detail-modal"
      onCancel={onClose}
    >
      <div className="customer-detail-modal__header">
        <div>
          <span>
            HỒ SƠ KHÁCH HÀNG
          </span>

          <h2>
            Thông tin chi tiết
          </h2>
        </div>

        <Tooltip title="Đóng">
          <button
            type="button"
            className="customer-detail-modal__close"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
          >
            <CloseOutlined />
          </button>
        </Tooltip>
      </div>

      {loading && !customer ? (
        <CustomerDetailLoading />
      ) : error && !customer ? (
        <div className="customer-detail-state">
          <div className="customer-detail-state__icon">
            <UserOutlined />
          </div>

          <h3>
            Không thể hiển thị hồ sơ
          </h3>

          <p>{error}</p>

          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={
              loadCustomerDetail
            }
          >
            Tải lại
          </Button>
        </div>
      ) : !customer ? (
        <div className="customer-detail-state">
          <Empty
            image={
              Empty.PRESENTED_IMAGE_SIMPLE
            }
            description="Không tìm thấy thông tin khách hàng."
          />
        </div>
      ) : (
        <div className="customer-detail-modal__body">
          <section className="customer-detail-profile">
            <div className="customer-detail-avatar">
              {avatarLetter}
            </div>

            <div className="customer-detail-profile__content">
              <div className="customer-detail-profile__title">
                <div>
                  <h3>
                    {customerView.fullName}
                  </h3>

                  <p>
                    {customerView.customerCode ||
                      "Khách hàng trên hệ thống"}
                  </p>
                </div>

                <Tag
                  className={`customer-detail-status ${status.className}`}
                >
                  {status.label}
                </Tag>
              </div>

              <div className="customer-detail-profile__quick">
                <span>
                  <MailOutlined />
                  {customerView.email ||
                    "Chưa cập nhật email"}
                </span>

                <span>
                  <PhoneOutlined />
                  {customerView.phone ||
                    "Chưa cập nhật số điện thoại"}
                </span>
              </div>
            </div>
          </section>

          {error && (
            <div className="customer-detail-warning">
              <SafetyCertificateOutlined />

              <span>
                Một số thông tin mới nhất
                chưa tải được. Nội dung bên
                dưới là dữ liệu đang có trên
                hệ thống.
              </span>

              <Button
                size="small"
                type="text"
                icon={<ReloadOutlined />}
                onClick={
                  loadCustomerDetail
                }
              >
                Tải lại
              </Button>
            </div>
          )}

          <section className="customer-detail-section">
            <div className="customer-detail-section__heading">
              <div className="customer-detail-section__icon">
                <UserOutlined />
              </div>

              <div>
                <h3>
                  Thông tin cá nhân
                </h3>

                <p>
                  Thông tin nhận diện và loại
                  tài khoản khách hàng.
                </p>
              </div>
            </div>

            <div className="customer-detail-info-grid">
              <CustomerInfoItem
                icon={<UserOutlined />}
                label="Họ và tên"
                value={
                  customerView.fullName
                }
              />

              <CustomerInfoItem
                icon={
                  <IdcardOutlined />
                }
                label="Mã khách hàng"
                value={
                  customerView.customerCode
                }
                copyable
              />

              <CustomerInfoItem
                icon={<TeamOutlined />}
                label="Loại tài khoản"
                value={
                  customerView.accountType
                }
              />

              <CustomerInfoItem
                icon={<UserOutlined />}
                label="Giới tính"
                value={
                  customerView.gender
                }
              />

              <CustomerInfoItem
                icon={
                  <CalendarOutlined />
                }
                label="Ngày sinh"
                value={
                  customerView.dateOfBirth
                }
              />

              <CustomerInfoItem
                icon={
                  <SafetyCertificateOutlined />
                }
                label="Trạng thái tài khoản"
                value={status.label}
              />
            </div>
          </section>

          <section className="customer-detail-section">
            <div className="customer-detail-section__heading">
              <div className="customer-detail-section__icon">
                <PhoneOutlined />
              </div>

              <div>
                <h3>
                  Liên hệ và địa chỉ
                </h3>

                <p>
                  Thông tin dùng để liên hệ và
                  hỗ trợ giao nhận.
                </p>
              </div>
            </div>

            <div className="customer-detail-info-grid">
              <CustomerInfoItem
                icon={<MailOutlined />}
                label="Email"
                value={
                  customerView.email
                }
                copyable
              />

              <CustomerInfoItem
                icon={<PhoneOutlined />}
                label="Số điện thoại"
                value={
                  customerView.phone
                }
                copyable
              />

              <CustomerInfoItem
                icon={<GlobalOutlined />}
                label="Quốc gia"
                value={
                  customerView.country
                }
              />

              <CustomerInfoItem
                icon={
                  <EnvironmentOutlined />
                }
                label="Khu vực"
                value={
                  customerView.region
                }
              />

              <CustomerInfoItem
                icon={
                  <EnvironmentOutlined />
                }
                label="Địa chỉ"
                value={
                  customerView.address
                }
                fullWidth
              />
            </div>
          </section>

          <section className="customer-detail-section">
            <div className="customer-detail-section__heading">
              <div className="customer-detail-section__icon">
                <CalendarOutlined />
              </div>

              <div>
                <h3>
                  Thông tin trên hệ thống
                </h3>

                <p>
                  Thời gian tạo và lần cập nhật
                  hồ sơ gần nhất.
                </p>
              </div>
            </div>

            <div className="customer-detail-info-grid">
              <CustomerInfoItem
                icon={
                  <CalendarOutlined />
                }
                label="Ngày tham gia"
                value={
                  customerView.createdAt
                }
              />

              <CustomerInfoItem
                icon={
                  <ReloadOutlined />
                }
                label="Cập nhật gần nhất"
                value={
                  customerView.updatedAt
                }
              />

              {customerView.note && (
                <CustomerInfoItem
                  icon={
                    <IdcardOutlined />
                  }
                  label="Ghi chú"
                  value={
                    customerView.note
                  }
                  fullWidth
                />
              )}
            </div>
          </section>

          <div className="customer-detail-modal__footer">
            <Button
              icon={<CloseOutlined />}
              onClick={onClose}
            >
              Đóng
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
