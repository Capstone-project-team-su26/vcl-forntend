import { useEffect, useMemo, useState } from "react";
import { Alert, Input, Select } from "antd";
import { EnvironmentOutlined, HomeOutlined } from "@ant-design/icons";
import {
  composeVietnamAddress,
  getVietnamDistrictsApi,
  getVietnamProvincesApi,
  getVietnamWardsApi,
} from "../../../api/AddressAPI/vietnamAddressService";
import "./CustomerAddressSelector.css";

const toOptions = (items) =>
  items.map((item) => ({ value: item.code, label: item.name }));

export default function CustomerAddressSelector({
  initialAddress = "",
  onAddressChange,
}) {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [provinceCode, setProvinceCode] = useState();
  const [districtCode, setDistrictCode] = useState();
  const [wardCode, setWardCode] = useState();
  const [street, setStreet] = useState(initialAddress);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getVietnamProvincesApi()
      .then((items) => active && setProvinces(items))
      .catch(() => active && setError("Không tải được danh mục địa chỉ. Bạn vẫn có thể nhập địa chỉ thủ công."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const emitAddress = (next = {}) => {
    const province = provinces.find((item) => item.code === (next.provinceCode ?? provinceCode));
    const district = districts.find((item) => item.code === (next.districtCode ?? districtCode));
    const ward = wards.find((item) => item.code === (next.wardCode ?? wardCode));
    onAddressChange?.(composeVietnamAddress({
      street: next.street ?? street,
      ward: ward?.name,
      district: district?.name,
      province: province?.name,
    }));
  };

  const handleProvinceChange = async (code) => {
    setProvinceCode(code); setDistrictCode(undefined); setWardCode(undefined);
    setDistricts([]); setWards([]); setLoading(true); setError("");
    try { const items = await getVietnamDistrictsApi(code); setDistricts(items); emitAddress({ provinceCode: code, districtCode: undefined, wardCode: undefined }); }
    catch { setError("Không tải được Quận/Huyện."); }
    finally { setLoading(false); }
  };

  const handleDistrictChange = async (code) => {
    setDistrictCode(code); setWardCode(undefined); setWards([]); setLoading(true); setError("");
    try { const items = await getVietnamWardsApi(code); setWards(items); emitAddress({ districtCode: code, wardCode: undefined }); }
    catch { setError("Không tải được Phường/Xã."); }
    finally { setLoading(false); }
  };

  const preview = useMemo(() => composeVietnamAddress({
    street,
    ward: wards.find((item) => item.code === wardCode)?.name,
    district: districts.find((item) => item.code === districtCode)?.name,
    province: provinces.find((item) => item.code === provinceCode)?.name,
  }), [districtCode, districts, provinceCode, provinces, street, wardCode, wards]);

  return (
    <div className="customer-address-selector">
      <Input
        value={street}
        prefix={<HomeOutlined />}
        placeholder="Số nhà, tên đường"
        onChange={(event) => { setStreet(event.target.value); emitAddress({ street: event.target.value }); }}
      />
      <div className="customer-address-selector__grid">
        <Select showSearch optionFilterProp="label" loading={loading} value={provinceCode} options={toOptions(provinces)} placeholder="Tỉnh / Thành phố" onChange={handleProvinceChange} />
        <Select showSearch optionFilterProp="label" disabled={!provinceCode} loading={loading} value={districtCode} options={toOptions(districts)} placeholder="Quận / Huyện" onChange={handleDistrictChange} />
        <Select showSearch optionFilterProp="label" disabled={!districtCode} loading={loading} value={wardCode} options={toOptions(wards)} placeholder="Phường / Xã" onChange={(code) => { setWardCode(code); emitAddress({ wardCode: code }); }} />
      </div>
      {preview && <div className="customer-address-selector__preview"><EnvironmentOutlined /><span>{preview}</span></div>}
      {error && <Alert type="warning" showIcon message={error} />}
    </div>
  );
}
