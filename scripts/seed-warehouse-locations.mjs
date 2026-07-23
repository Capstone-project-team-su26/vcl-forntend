/**
 * Seed Zone/Shelf/Bin qua API (không cần UI).
 * Quy ước tên zone: tiếng Việt (Khu nhận / Khu A / Khu xuất).
 *
 * Usage (PowerShell):
 *   $env:API_URL="https://api-vcl.zushin.io.vn"
 *   $env:SEED_EMAIL="ops@test.com"
 *   $env:SEED_PASSWORD="Ops123"
 *   bun scripts/seed-warehouse-locations.mjs
 *
 * Optional:
 *   SEED_WAREHOUSE_CODE=CN_WH   — chỉ seed 1 kho theo code
 *   SEED_DRY_RUN=1             — in payload, không ghi
 */
const API_URL = (process.env.API_URL || "https://api-vcl.zushin.io.vn").replace(
  /\/$/,
  ""
);
const EMAIL = process.env.SEED_EMAIL || "ops@test.com";
const PASSWORD = process.env.SEED_PASSWORD || "Ops123";
const ONLY_CODE = (process.env.SEED_WAREHOUSE_CODE || "").trim();
const DRY_RUN = process.env.SEED_DRY_RUN === "1";

/** Template vị trí — tên zone tiếng Việt đồng bộ. */
const LOCATION_SEED = [
  {
    zoneName: "Khu A",
    shelfCode: "SHELF-A1",
    bins: [
      { binCode: "BIN-A1-01", maxVolume: 100, maxWeight: 50 },
      { binCode: "BIN-A1-02", maxVolume: 100, maxWeight: 50 },
    ],
  },
  {
    zoneName: "Khu A",
    shelfCode: "SHELF-A2",
    bins: [{ binCode: "BIN-A2-01", maxVolume: 80, maxWeight: 40 }],
  },
  {
    zoneName: "Khu nhận",
    shelfCode: "SHELF-RCV",
    bins: [{ binCode: "BIN-RCV-01", maxVolume: 200, maxWeight: 100 }],
  },
  {
    zoneName: "Khu xuất",
    shelfCode: "SHELF-OUT",
    bins: [
      { binCode: "BIN-OUT-01", maxVolume: 200, maxWeight: 100 },
      { binCode: "BIN-OUT-02", maxVolume: 200, maxWeight: 100 },
    ],
  },
];

async function api(path, { method = "GET", token, body } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const msg =
      data?.message ||
      data?.title ||
      (data?.errors && JSON.stringify(data.errors)) ||
      text ||
      res.statusText;
    throw new Error(`${method} ${path} → ${res.status}: ${msg}`);
  }
  return data;
}

function extractToken(loginBody) {
  return (
    loginBody?.token ||
    loginBody?.accessToken ||
    loginBody?.access_token ||
    loginBody?.data?.token ||
    loginBody?.data?.accessToken ||
    null
  );
}

function normalizeWarehouseList(raw) {
  const data = raw?.data ?? raw;
  if (Array.isArray(data)) return data;
  return data?.items ?? data?.warehouses ?? [];
}

function normalizeLocationList(raw) {
  const data = raw?.data ?? raw;
  if (Array.isArray(data)) return data;
  return data?.items ?? data?.locations ?? [];
}

function locId(loc) {
  return loc.id || loc.locationId || loc.binId || loc.bin_id || null;
}

function locBinCode(loc) {
  return (loc.binCode || loc.bin_code || loc.code || "").trim().toUpperCase();
}

function locZone(loc) {
  return (loc.zoneName || loc.zone_name || loc.zoneCode || loc.zone_code || "").trim();
}

function locShelf(loc) {
  return (loc.shelfCode || loc.shelf_code || "").trim();
}

function indexByBin(locations) {
  const map = new Map();
  for (const loc of locations) {
    const code = locBinCode(loc);
    if (code) map.set(code, loc);
  }
  return map;
}

async function main() {
  console.log(`API: ${API_URL}`);
  console.log(`Login: ${EMAIL}${DRY_RUN ? " (dry-run)" : ""}`);

  const loginBody = await api("/api/Auth/login", {
    method: "POST",
    body: { email: EMAIL, password: PASSWORD },
  });
  const token = extractToken(loginBody);
  if (!token) {
    throw new Error(`Login OK nhưng không thấy token. Keys: ${Object.keys(loginBody || {})}`);
  }
  console.log("Login OK");

  let warehouses = normalizeWarehouseList(
    await api("/api/warehouses/active", { token })
  );
  if (!warehouses.length) {
    warehouses = normalizeWarehouseList(await api("/api/warehouses", { token }));
  }
  if (ONLY_CODE) {
    warehouses = warehouses.filter(
      (w) => String(w.code || "").toUpperCase() === ONLY_CODE.toUpperCase()
    );
  }

  if (!warehouses.length) {
    throw new Error(
      ONLY_CODE
        ? `Không tìm thấy kho code=${ONLY_CODE}`
        : "Không có warehouse nào (active/list trống)."
    );
  }

  console.log(
    `Warehouses (${warehouses.length}):`,
    warehouses.map((w) => `${w.code || "?"} · ${w.name}`).join(" | ")
  );

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const warehouse of warehouses) {
    const wid = warehouse.id;
    console.log(`\n--- ${warehouse.name} (${warehouse.code || wid}) ---`);

    let locations = [];
    try {
      locations = normalizeLocationList(
        await api(`/api/warehouses/${wid}/locations/active`, { token })
      );
    } catch {
      locations = normalizeLocationList(
        await api(`/api/warehouses/${wid}/locations`, { token })
      );
    }
    const byBin = indexByBin(locations);
    console.log(`Existing bins: ${byBin.size}`);

    for (const group of LOCATION_SEED) {
      for (const bin of group.bins) {
        const key = bin.binCode.toUpperCase();
        const existing = byBin.get(key);

        if (existing) {
          const sameZone = locZone(existing) === group.zoneName;
          const sameShelf = locShelf(existing) === group.shelfCode;
          if (sameZone && sameShelf) {
            console.log(`  skip ${bin.binCode}`);
            skipped += 1;
            continue;
          }

          const updateBody = {
            zoneName: group.zoneName,
            shelfCode: group.shelfCode,
            binCode: bin.binCode,
            maxVolume: bin.maxVolume,
            maxWeight: bin.maxWeight,
            isActive: existing.isActive !== false,
            note: existing.note || "seed-ops-locations",
          };

          const id = locId(existing);
          if (!id) {
            console.error(`  ! update ${bin.binCode}: thiếu locationId`, existing);
            continue;
          }

          if (DRY_RUN) {
            console.log(
              `  dry-run PUT ${bin.binCode}: ${locZone(existing)} → ${group.zoneName}`
            );
            updated += 1;
            continue;
          }

          try {
            await api(`/api/warehouse-locations/${id}`, {
              method: "PUT",
              token,
              body: updateBody,
            });
            console.log(
              `  ~ ${bin.binCode}: zone "${locZone(existing)}" → "${group.zoneName}"`
            );
            updated += 1;
          } catch (err) {
            console.error(`  ! update ${bin.binCode}: ${err.message}`);
          }
          continue;
        }

        const payload = {
          zoneName: group.zoneName,
          shelfCode: group.shelfCode,
          binCode: bin.binCode,
          maxVolume: bin.maxVolume,
          maxWeight: bin.maxWeight,
          isActive: true,
          note: "seed-ops-locations",
        };

        if (DRY_RUN) {
          console.log("  dry-run POST", payload);
          created += 1;
          continue;
        }

        try {
          await api(`/api/warehouses/${wid}/locations`, {
            method: "POST",
            token,
            body: payload,
          });
          console.log(`  + ${group.zoneName}/${group.shelfCode}/${bin.binCode}`);
          created += 1;
          byBin.set(key, { binCode: bin.binCode, ...payload });
        } catch (err) {
          console.error(`  ! ${bin.binCode}: ${err.message}`);
        }
      }
    }
  }

  console.log(`\nDone. created=${created} updated=${updated} skipped=${skipped}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
