const seed = {
  profile: {
    fullName: "Alex Henderson",
    email: "customer@example.com",
    membership: "Premium Member",
    accountType: "Business",
    legalEntityName: "Henderson Trading Co.",
    taxId: "VN-0123456789",
    region: "Ho Chi Minh City, Vietnam",
    phone: "+84 901 234 567",
    preferences: {
      fragileTag: false,
      defaultInsurance: true,
      prioritySort: false,
    },
    setupProgress: 50,
  },
  purchaseRequests: [
    {
      id: "PR-2024-001",
      productLink: "https://shop.example.com/mx-master-3s",
      productName: "Logitech MX Master 3S",
      quantity: 5,
      destination: "HCM Hub",
      status: "Pending",
      statusClass: "bg-warning-bg text-warning-text",
      requiredBy: "2024-11-01",
    },
    {
      id: "PR-2024-002",
      productLink: "https://shop.example.com/dell-ultrasharp",
      productName: 'Dell UltraSharp 27"',
      quantity: 2,
      destination: "Hanoi DC",
      status: "Approved",
      statusClass: "bg-success-bg text-success-text",
      requiredBy: "2024-10-28",
    },
    {
      id: "PR-2024-003",
      productLink: "https://shop.example.com/keychron-k8",
      productName: "Keychron K8 Pro",
      quantity: 10,
      destination: "Bangkok Gateway",
      status: "Processing",
      statusClass: "bg-info-bg text-info-text",
      requiredBy: "2024-11-05",
    },
  ],
  dashboard: {
    userName: "Alex",
    activeShipments: 12,
    stats: [
      { label: "Active Shipments", value: "12", sub: "4 arriving today", icon: "./assets/IMG_11.svg", bg: "bg-primary/20", iconColor: "text-primary" },
      { label: "Pending Pickups", value: "03", sub: "Scheduled for tomorrow", icon: "./assets/IMG_12.svg", bg: "bg-secondary/20", iconColor: "text-secondary" },
      { label: "Loyalty Points", value: "4,850", sub: "250 points to Gold status", icon: "./assets/IMG_13.svg", bg: "bg-accent/20", iconColor: "text-accent" },
    ],
    recentActivity: [
      { id: "SW-90234", recipient: "Sarah Jenkins", destination: "London, UK", status: "In Transit", date: "Oct 24, 2024", statusColor: "text-primary bg-primary/15" },
      { id: "SW-90112", recipient: "TechnoCorp Ltd", destination: "Tokyo, JP", status: "Delivered", date: "Oct 22, 2024", statusColor: "text-ink" },
      { id: "SW-89982", recipient: "Michael Chen", destination: "San Francisco, US", status: "Pending", date: "Oct 25, 2024", statusColor: "text-ink" },
      { id: "SW-89551", recipient: "Global Logistics", destination: "Berlin, DE", status: "On Hold", date: "Oct 21, 2024", statusColor: "text-accent bg-accent/15" },
      { id: "SW-89400", recipient: "Anna Schmidt", destination: "Munich, DE", status: "Delivered", date: "Oct 20, 2024", statusColor: "text-ink" },
    ],
    fuelSurchargeRate: "13.8%",
  },
  transfer: {
    packageTypes: [
      { id: "envelope", label: "Envelope", sub: "Up to 0.5kg", icon: "./assets/IMG_15.svg" },
      { id: "small-box", label: "Small Box", sub: "Up to 5kg", icon: "./assets/IMG_16.svg", active: true },
      { id: "large-box", label: "Large Box", sub: "Up to 20kg", icon: "./assets/IMG_17.svg" },
      { id: "pallet", label: "Pallet", sub: "Over 50kg", icon: "./assets/IMG_18.svg" },
    ],
    serviceLevels: [
      { id: "economy", title: "Economy Ground", desc: "Affordable shipping for non-urgent deliveries.", price: 12.5, est: "Est. 5-7 Business Days" },
      { id: "standard", title: "Standard Air", desc: "Reliable transit with full tracking capabilities.", price: 24.8, est: "Est. 2-3 Business Days", active: true },
      { id: "express", title: "Priority Express", desc: "Next-day delivery with premium handling.", price: 48.2, est: "Est. Next Day by 10 AM", badge: "FASTEST" },
    ],
    summary: {
      packageType: "small box",
      serviceLevel: "standard",
      estDelivery: "Oct 24, 2024",
      baseRate: 24.8,
      fuelSurcharge: 2.4,
      handlingFee: 0,
      total: 27.2,
    },
    warehouses: ["HCM Hub", "Hanoi DC", "Bangkok Gateway", "Singapore Hub"],
  },
  pricing: {
    tiers: [
      {
        tier: "Standard",
        price: "12.50",
        description: "Reliable shipping for non-urgent deliveries across all major cities.",
        features: ["5-7 Business Days", "Basic Tracking", "Drop-off at Point", "Standard Packaging"],
        buttonText: "Select Standard",
        accent: "primary",
      },
      {
        tier: "Express",
        price: "24.90",
        description: "Priority logistics with doorstep pickup and guaranteed timelines.",
        features: ["2-3 Business Days", "Real-time GPS Tracking", "Doorstep Pickup", "Premium Padding", "Insurance Coverage"],
        buttonText: "Select Express",
        accent: "secondary",
        isBestValue: true,
        isHighlighted: true,
      },
      {
        tier: "Freight",
        price: "85.00",
        description: "Heavy-duty transit for bulky items, pallets, and large cargo.",
        features: ["7-10 Business Days", "Dedicated Support", "Palletization Included", "Custom Clearance Assist", "Lift-gate Service"],
        buttonText: "Select Freight",
        accent: "accent",
      },
    ],
    additionalServices: [
      { icon: "./assets/IMG_14.svg", title: "Shipping Insurance", description: "Protect against damage or loss up to $5,000 value.", price: "+$5.00" },
      { icon: "./assets/IMG_15.svg", title: "Eco-Friendly Delivery", description: "100% carbon offset for your package's transit route.", price: "+$1.50" },
      { icon: "./assets/IMG_16.svg", title: "Fragile Handling", description: "Specialized sorting and shock-absorbent mounting.", price: "+$3.25" },
      { icon: "./assets/IMG_17.svg", title: "Express Customs", description: "Priority documentation processing for international routes.", price: "+$12.00" },
    ],
  },
  staff: {
    sales: {
      fuelSurcharge: "+4.2%",
      rates: [
        { label: "Express Air", price: "$8.50/kg", iconBg: "bg-primary/20" },
        { label: "Consolidation", price: "$2.20/kg", iconBg: "bg-secondary/20" },
      ],
      pendingNotifications: 3,
      totalNotifications: 5,
    },
    globalWarehouse: {
      stats: [
        { icon: "./assets/IMG_1.svg", label: "Parcels Awaiting Receipt", value: "12", trend: "+2 this week", iconBg: "bg-primary/20", iconColor: "text-primary" },
        { icon: "./assets/IMG_10.svg", label: "Unidentified Parcels", value: "04", trend: "Needs matching", iconBg: "bg-transparent", iconColor: "text-ink" },
      ],
      inboundShipments: [
        { id: "SS-9402", status: "In Transit", route: ["Mumbai", "Dubai"], type: "EXPRESS", typeIcon: "./assets/IMG_16.svg", eta: "24 Oct" },
        { id: "SS-8122", status: "Processing", route: ["Chennai", "Singapore"], type: "STANDARD", typeIcon: "./assets/IMG_18.svg", eta: "26 Oct" },
        { id: "SS-6549", status: "Pending", route: ["New York", "New Delhi"], type: "EXPRESS", typeIcon: "./assets/IMG_16.svg", eta: "28 Oct" },
      ],
    },
    domesticWarehouse: {
      stats: [
        { icon: "./assets/IMG_15.svg", label: "Awaiting Put-away", value: "08", trend: "On schedule", iconBg: "bg-transparent", iconColor: "text-ink" },
        { icon: "./assets/IMG_16.svg", label: "Ready for Handover", value: "05", trend: "Carrier pickup", iconBg: "bg-secondary/20", iconColor: "text-secondary" },
      ],
      outboundShipments: [
        { id: "SS-7731", status: "Delivered", route: ["London", "Bengaluru"], type: "FREIGHT", typeIcon: "./assets/IMG_19.svg", eta: "21 Oct" },
        { id: "SS-5510", status: "Out for Delivery", route: ["Kolkata", "Paris"], type: "STANDARD", typeIcon: "./assets/IMG_18.svg", eta: "Today" },
      ],
    },
  },
  users: [
    {
      id: "mock-user-001",
      name: "Nguyen Van Sale",
      email: "sale@vcl.com",
      role: "Sale",
      status: "ACTIVE",
      lastSeen: "2 giờ trước",
      avatar: "NS",
    },
    {
      id: "mock-user-002",
      name: "Tran Warehouse",
      email: "warehouse@vcl.com",
      role: "WarehouseStaff",
      status: "ACTIVE",
      lastSeen: "Hôm qua",
      avatar: "TW",
    },
    {
      id: "mock-user-003",
      name: "Le Van Ops",
      email: "ops@vcl.com",
      role: "OperationsManager",
      status: "LOCKED",
      lastSeen: "Đã khóa",
      avatar: "LO",
    },
  ],
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const store = clone(seed);

export function getMockStore() {
  return store;
}

export function resetMockStore() {
  Object.assign(store, clone(seed));
}

export function nextMockId(prefix) {
  const id = `${prefix}-${Date.now().toString(36).toUpperCase()}`;
  return id;
}
