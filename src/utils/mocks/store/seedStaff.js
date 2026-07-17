export const staff = {
  sales: {
    fuelSurcharge: "+4.2%",
    rates: [
      {
        label: "Express Air",
        price: "8.500 VND/kg",
        iconBg: "bg-primary/20",
      },
      {
        label: "Consolidation",
        price: "2.200 VND/kg",
        iconBg: "bg-secondary/20",
      },
    ],
    pendingNotifications: 3,
    totalNotifications: 5,
  },
  globalWarehouse: {
    stats: [
      {
        icon: "/assets/IMG_1.svg",
        label: "Parcels Awaiting Receipt",
        value: "12",
        trend: "+2 this week",
        iconBg: "bg-primary/20",
        iconColor: "text-primary",
      },
      {
        icon: "/assets/IMG_10.svg",
        label: "Unidentified Parcels",
        value: "04",
        trend: "Needs matching",
        iconBg: "bg-transparent",
        iconColor: "text-ink",
      },
    ],
    inboundShipments: [
      {
        id: "SS-9402",
        status: "In Transit",
        route: [
          "Mumbai",
          "Dubai",
        ],
        type: "EXPRESS",
        typeIcon: "/assets/IMG_16.svg",
        eta: "24 Oct",
      },
      {
        id: "SS-8122",
        status: "Processing",
        route: [
          "Chennai",
          "Singapore",
        ],
        type: "STANDARD",
        typeIcon: "/assets/IMG_18.svg",
        eta: "26 Oct",
      },
      {
        id: "SS-6549",
        status: "Pending",
        route: [
          "New York",
          "New Delhi",
        ],
        type: "EXPRESS",
        typeIcon: "/assets/IMG_16.svg",
        eta: "28 Oct",
      },
    ],
  },
  domesticWarehouse: {
    stats: [
      {
        icon: "/assets/IMG_15.svg",
        label: "Awaiting Put-away",
        value: "08",
        trend: "On schedule",
        iconBg: "bg-transparent",
        iconColor: "text-ink",
      },
      {
        icon: "/assets/IMG_16.svg",
        label: "Ready for Handover",
        value: "05",
        trend: "Carrier pickup",
        iconBg: "bg-secondary/20",
        iconColor: "text-secondary",
      },
    ],
    outboundShipments: [
      {
        id: "SS-7731",
        status: "Delivered",
        route: [
          "London",
          "Bengaluru",
        ],
        type: "FREIGHT",
        typeIcon: "/assets/IMG_19.svg",
        eta: "21 Oct",
      },
      {
        id: "SS-5510",
        status: "Out for Delivery",
        route: [
          "Kolkata",
          "Paris",
        ],
        type: "STANDARD",
        typeIcon: "/assets/IMG_18.svg",
        eta: "Today",
      },
    ],
  },
};

