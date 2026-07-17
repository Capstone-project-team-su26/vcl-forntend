export const transfer = {
  packageTypes: [
    {
      id: "envelope",
      label: "Envelope",
      sub: "Up to 0.5kg",
      icon: "/assets/IMG_15.svg",
    },
    {
      id: "small-box",
      label: "Small Box",
      sub: "Up to 5kg",
      icon: "/assets/IMG_16.svg",
      active: true,
    },
    {
      id: "large-box",
      label: "Large Box",
      sub: "Up to 20kg",
      icon: "/assets/IMG_17.svg",
    },
    {
      id: "pallet",
      label: "Pallet",
      sub: "Over 50kg",
      icon: "/assets/IMG_18.svg",
    },
  ],
  serviceLevels: [
    {
      id: "economy",
      title: "Economy Ground",
      desc: "Affordable shipping for non-urgent deliveries.",
      price: 12.5,
      est: "Est. 5-7 Business Days",
    },
    {
      id: "standard",
      title: "Standard Air",
      desc: "Reliable transit with full tracking capabilities.",
      price: 24.8,
      est: "Est. 2-3 Business Days",
      active: true,
    },
    {
      id: "express",
      title: "Priority Express",
      desc: "Next-day delivery with premium handling.",
      price: 48.2,
      est: "Est. Next Day by 10 AM",
      badge: "FASTEST",
    },
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
  warehouses: [
    "HCM Hub",
    "Hanoi DC",
    "Bangkok Gateway",
    "Singapore Hub",
  ],
};

