import { useEffect, useMemo, useState } from "react";
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
  EnvironmentOutlined,
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

const normalizeProfileData = (response) => {
  return response?.data?.data ?? response?.data ?? response ?? {};
};

const getErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.title ||
    error?.message ||
    fallbackMessage
  );
};

const getAvatarText = (fullName) => {
  const normalizedName = String(fullName || "").trim();

  if (!normalizedName) {
    return "U";
  }

  const words = normalizedName
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  const firstLetter = words[0]?.charAt(0) || "";
  const lastLetter =
    words[words.length - 1]?.charAt(0) || "";

  return `${firstLetter}${lastLetter}`.toUpperCase();
};

export default function UserProfileModal({
  open,
  onClose,
  onUpdated,
}) {
  const [form] = Form.useForm();

  const [profile, setProfile] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [updating, setUpdating] = useState(false);

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

  const avatarText = useMemo(
    () => getAvatarText(fullName),
    [fullName]
  );

  const fetchProfile = async () => {
    try {
      setFetching(true);

      const response = await getUserProfileApi();
      const data = normalizeProfileData(response);

      setProfile(data);

      form.setFieldsValue({
        fullName: data?.fullName || "",
        phone: data?.phone || "",
        country: data?.country || "",
        address: data?.address || "",
      });
    } catch (error) {
      console.error("GET PROFILE ERROR:", error);

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
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    fetchProfile();
  }, [open]);

  const handleUpdate = async () => {
    if (updating) {
      return;
    }

    try {
      const values = await form.validateFields();

      setUpdating(true);

      const payload = {
        fullName: String(values?.fullName || "").trim(),
        phone: String(values?.phone || "").trim(),
        country: String(values?.country || "").trim(),
        address: String(values?.address || "").trim(),
      };

      const response =
        await updateUserProfileApi(payload);

      let updatedProfile =
        normalizeProfileData(response);

      /*
       * Một số API PUT chỉ trả message mà không trả profile.
       * Khi đó gọi lại GET để lấy dữ liệu mới nhất.
       */
      if (
        !updatedProfile?.fullName &&
        !updatedProfile?.email
      ) {
        const latestResponse =
          await getUserProfileApi();

        updatedProfile =
          normalizeProfileData(latestResponse);
      }

      setProfile(updatedProfile);

      form.setFieldsValue({
        fullName:
          updatedProfile?.fullName ||
          payload.fullName,
        phone:
          updatedProfile?.phone ||
          payload.phone,
        country:
          updatedProfile?.country ||
          payload.country,
        address:
          updatedProfile?.address ||
          payload.address,
      });

      /*
       * Đồng bộ lại user trong sessionStorage
       * để Sidebar/Header cập nhật được tên mới.
       */
      try {
        const storedUser = JSON.parse(
          sessionStorage.getItem("user") || "{}"
        );

        const nextUser = {
          ...storedUser,
          ...updatedProfile,
          fullName:
            updatedProfile?.fullName ||
            payload.fullName,
          phone:
            updatedProfile?.phone ||
            payload.phone,
          country:
            updatedProfile?.country ||
            payload.country,
          address:
            updatedProfile?.address ||
            payload.address,
        };

        sessionStorage.setItem(
          "user",
          JSON.stringify(nextUser)
        );
      } catch (storageError) {
        console.error(
          "UPDATE SESSION USER ERROR:",
          storageError
        );
      }

      AuthNotify.success(
        "Cập nhật thành công",
        "Thông tin cá nhân đã được cập nhật."
      );

      if (typeof onUpdated === "function") {
        onUpdated(updatedProfile);
      }

      if (typeof onClose === "function") {
        onClose();
      }
    } catch (error) {
      /*
       * Khi validateFields thất bại, Ant Design trả errorFields.
       * Không hiển thị toast lỗi API trong trường hợp này.
       */
      if (error?.errorFields) {
        return;
      }

      console.error("UPDATE PROFILE ERROR:", error);

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

  const handleCancel = () => {
    if (updating) {
      return;
    }

    form.resetFields();

    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={560}
      centered
      destroyOnClose
      maskClosable={!updating}
      closable={!updating}
      className="profile-modal"
      title={null}
    >
      {fetching ? (
        <div className="profile-loading">
          <Spin size="large" />

          <span>Đang tải thông tin cá nhân...</span>
        </div>
      ) : (
        <div className="profile-modal__content">
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

          <Form
            form={form}
            layout="vertical"
            className="profile-form"
            requiredMark={false}
            autoComplete="off"
          >
            <Row gutter={[16, 0]}>
              <Col xs={24} md={24}>
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
                    prefix={<UserOutlined />}
                    size="large"
                    maxLength={100}
                    placeholder="Nhập họ và tên"
                    disabled={updating}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[
                    {
                      pattern: /^[0-9]{10}$/,
                      message:
                        "Số điện thoại phải gồm đúng 10 chữ số.",
                    },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    size="large"
                    maxLength={10}
                    inputMode="numeric"
                    placeholder="Nhập số điện thoại"
                    disabled={updating}
                    onChange={(event) => {
                      const value = event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);

                      form.setFieldValue(
                        "phone",
                        value
                      );
                    }}
                  />
                </Form.Item>
              </Col>

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
                    prefix={<GlobalOutlined />}
                    size="large"
                    maxLength={100}
                    placeholder="Ví dụ: Việt Nam"
                    disabled={updating}
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
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