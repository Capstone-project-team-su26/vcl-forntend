import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Avatar,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Spin,
} from "antd";

import {
  GlobalOutlined,
  PhoneOutlined,
  SaveOutlined,
  UserOutlined,
} from "@ant-design/icons";

import {
  getUserProfileApi,
  updateUserProfileApi,
} from "../../api/Auth/authService";

import AuthNotify from "../../utils/Common/AuthNotify";

import "./UserProfileModal.css";

/* ================= RESPONSE HELPER ================= */

const normalizeProfileData = (response) => {
  return (
    response?.data?.data ??
    response?.data ??
    response ??
    {}
  );
};

/* ================= ERROR HELPER ================= */

const getErrorMessage = (
  error,
  fallbackMessage
) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.title ||
    error?.message ||
    fallbackMessage
  );
};

/* ================= AVATAR HELPER ================= */

const getAvatarText = (fullName) => {
  const normalizedName = String(
    fullName || ""
  ).trim();

  if (!normalizedName) {
    return "U";
  }

  const words = normalizedName
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  const firstLetter =
    words[0]?.charAt(0) || "";

  const lastLetter =
    words[words.length - 1]?.charAt(0) ||
    "";

  return `${firstLetter}${lastLetter}`.toUpperCase();
};

/* ================= SESSION HELPER ================= */

const updateSessionUser = (
  updatedProfile,
  payload
) => {
  try {
    const storedUser = JSON.parse(
      sessionStorage.getItem("user") || "{}"
    );

    const nextUser = {
      ...storedUser,
      ...updatedProfile,

      fullName:
        updatedProfile?.fullName ||
        payload?.fullName ||
        storedUser?.fullName ||
        "",

      phone:
        updatedProfile?.phone ??
        payload?.phone ??
        storedUser?.phone ??
        "",

      country:
        updatedProfile?.country ??
        payload?.country ??
        storedUser?.country ??
        "",

      address:
        updatedProfile?.address ??
        payload?.address ??
        storedUser?.address ??
        "",
    };

    sessionStorage.setItem(
      "user",
      JSON.stringify(nextUser)
    );

    return nextUser;
  } catch (error) {
    console.error(
      "UPDATE SESSION USER ERROR:",
      error
    );

    return null;
  }
};

/* ================= COMPONENT ================= */

export default function UserProfileModal({
  open,
  onClose,
  onUpdated,
}) {
  const [form] = Form.useForm();

  const [profile, setProfile] =
    useState(null);

  const [fetching, setFetching] =
    useState(false);

  const [updating, setUpdating] =
    useState(false);

  /* ================= DISPLAY DATA ================= */

  const fullName =
    profile?.fullName ||
    profile?.name ||
    profile?.email ||
    "Người dùng";

  const roleName =
    profile?.roleName ||
    profile?.role ||
    sessionStorage.getItem("role") ||
    "Người dùng";

  const avatarText = useMemo(() => {
    return getAvatarText(fullName);
  }, [fullName]);

  /* ================= SET FORM DATA ================= */

  const setProfileFormValues = useCallback(
    (data = {}) => {
      form.setFieldsValue({
        fullName: data?.fullName || "",
        phone: data?.phone || "",
        country: data?.country || "",
        address: data?.address || "",
      });
    },
    [form]
  );

  /* ================= GET PROFILE ================= */

  const fetchProfile = useCallback(
    async () => {
      try {
        setFetching(true);

        const response =
          await getUserProfileApi();

        const data =
          normalizeProfileData(response);

        setProfile(data);
        setProfileFormValues(data);
      } catch (error) {
        console.error(
          "GET PROFILE ERROR:",
          error
        );

        AuthNotify.error(
          "Không tải được thông tin",
          getErrorMessage(
            error,
            "Không thể tải thông tin cá nhân."
          )
        );
      } finally {
        setFetching(false);
      }
    },
    [setProfileFormValues]
  );

  /* ================= LOAD WHEN OPEN ================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    fetchProfile();
  }, [open, fetchProfile]);

  /* ================= CLOSE MODAL ================= */

  const handleCancel = () => {
    if (updating) {
      return;
    }

    form.resetFields();
    setProfile(null);

    if (typeof onClose === "function") {
      onClose();
    }
  };

  /* ================= UPDATE PROFILE ================= */

  const handleUpdate = async () => {
    if (updating) {
      return;
    }

    try {
      const values =
        await form.validateFields();

      setUpdating(true);

      const payload = {
        fullName: String(
          values?.fullName || ""
        ).trim(),

        phone: String(
          values?.phone || ""
        ).trim(),

        country: String(
          values?.country || ""
        ).trim(),

        address: String(
          values?.address || ""
        ).trim(),
      };

      const response =
        await updateUserProfileApi(
          payload
        );

      let updatedProfile =
        normalizeProfileData(response);

      /*
       * Một số API cập nhật chỉ trả về message.
       * Khi đó gọi lại API lấy profile.
       */
      if (
        !updatedProfile?.fullName &&
        !updatedProfile?.email
      ) {
        const latestResponse =
          await getUserProfileApi();

        updatedProfile =
          normalizeProfileData(
            latestResponse
          );
      }

      /*
       * Đảm bảo các giá trị vừa nhập không bị mất
       * nếu API trả về thiếu một vài thuộc tính.
       */
      const mergedProfile = {
        ...profile,
        ...updatedProfile,

        fullName:
          updatedProfile?.fullName ||
          payload.fullName,

        phone:
          updatedProfile?.phone ??
          payload.phone,

        country:
          updatedProfile?.country ??
          payload.country,

        address:
          updatedProfile?.address ??
          payload.address,
      };

      setProfile(mergedProfile);
      setProfileFormValues(mergedProfile);

      updateSessionUser(
        mergedProfile,
        payload
      );

      AuthNotify.success(
        "Cập nhật thành công",
        "Thông tin cá nhân đã được cập nhật."
      );

      if (
        typeof onUpdated === "function"
      ) {
        onUpdated(mergedProfile);
      }

      form.resetFields();

      if (typeof onClose === "function") {
        onClose();
      }
    } catch (error) {
      /*
       * validateFields trả về errorFields
       * khi dữ liệu form chưa hợp lệ.
       */
      if (error?.errorFields) {
        return;
      }

      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      AuthNotify.error(
        "Cập nhật thất bại",
        getErrorMessage(
          error,
          "Không thể cập nhật thông tin cá nhân."
        )
      );
    } finally {
      setUpdating(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      centered
      width={720}
      destroyOnHidden
      closable={!updating}
      keyboard={!updating}
      mask={{
        closable: false,
      }}
      className="user-profile-modal"
    >
      {fetching ? (
        <div className="profile-loading">
          <Spin size="large" />

          <span>
            Đang tải thông tin cá nhân...
          </span>
        </div>
      ) : (
        <div className="profile-modal__content">
          {/* ================= HEADER ================= */}

          <div className="profile-header">
            <Avatar
              size={68}
              className="profile-avatar"
            >
              {avatarText}
            </Avatar>

            <div className="profile-header__content">
              <span className="profile-header__eyebrow">
                THÔNG TIN CÁ NHÂN
              </span>

              <h2>{fullName}</h2>

              <p>{roleName}</p>
            </div>
          </div>

          {/* ================= FORM ================= */}

          <Form
            form={form}
            layout="vertical"
            className="profile-form"
            requiredMark={false}
            autoComplete="off"
            preserve={false}
          >
            <Row gutter={[16, 0]}>
              {/* HỌ VÀ TÊN */}

              <Col xs={24}>
                <Form.Item
                  name="fullName"
                  label="Họ và tên"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message:
                        "Vui lòng nhập họ và tên.",
                    },
                    {
                      min: 2,
                      message:
                        "Họ và tên phải có ít nhất 2 ký tự.",
                    },
                    {
                      max: 100,
                      message:
                        "Họ và tên không được vượt quá 100 ký tự.",
                    },
                  ]}
                >
                  <Input
                    prefix={
                      <UserOutlined />
                    }
                    size="large"
                    maxLength={100}
                    placeholder="Nhập họ và tên"
                    disabled={updating}
                  />
                </Form.Item>
              </Col>

              {/* SỐ ĐIỆN THOẠI */}

              <Col xs={24} md={12}>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[
                    {
                      pattern:
                        /^[0-9]{10}$/,
                      message:
                        "Số điện thoại phải gồm đúng 10 chữ số.",
                    },
                  ]}
                >
                  <Input
                    prefix={
                      <PhoneOutlined />
                    }
                    size="large"
                    maxLength={10}
                    inputMode="numeric"
                    placeholder="Nhập số điện thoại"
                    disabled={updating}
                    onChange={(event) => {
                      const value =
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(0, 10);

                      form.setFieldValue(
                        "phone",
                        value
                      );
                    }}
                  />
                </Form.Item>
              </Col>

              {/* QUỐC GIA */}

              <Col xs={24} md={12}>
                <Form.Item
                  name="country"
                  label="Quốc gia"
                  rules={[
                    {
                      max: 100,
                      message:
                        "Quốc gia không được vượt quá 100 ký tự.",
                    },
                  ]}
                >
                  <Input
                    prefix={
                      <GlobalOutlined />
                    }
                    size="large"
                    maxLength={100}
                    placeholder="Ví dụ: Việt Nam"
                    disabled={updating}
                  />
                </Form.Item>
              </Col>

              {/* ĐỊA CHỈ */}

              <Col xs={24}>
                <Form.Item
                  name="address"
                  label="Địa chỉ"
                  rules={[
                    {
                      max: 255,
                      message:
                        "Địa chỉ không được vượt quá 255 ký tự.",
                    },
                  ]}
                >
                  <Input.TextArea
                    rows={3}
                    maxLength={255}
                    showCount
                    placeholder="Nhập địa chỉ hiện tại"
                    disabled={updating}
                    className="profile-address-input"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* ================= ACTIONS ================= */}

            <div className="profile-form__actions">
              <Button
                size="large"
                onClick={handleCancel}
                disabled={updating}
                className="profile-cancel-btn"
              >
                Hủy
              </Button>

              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                loading={updating}
                disabled={fetching}
                onClick={handleUpdate}
                className="profile-save-btn"
              >
                {updating
                  ? "Đang cập nhật..."
                  : "Cập nhật thông tin"}
              </Button>
            </div>
          </Form>
        </div>
      )}
    </Modal>
  );
}