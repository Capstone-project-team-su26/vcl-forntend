export const pricing = {
  tiers: [
    {
      tier: "Standard",
      price: "12.50",
      description: "Reliable shipping for non-urgent deliveries across all major cities.",
      features: [
        "5-7 Business Days",
        "Basic Tracking",
        "Drop-off at Point",
        "Standard Packaging",
      ],
      buttonText: "Select Standard",
      accent: "primary",
    },
    {
      tier: "Express",
      price: "24.90",
      description: "Priority logistics with doorstep pickup and guaranteed timelines.",
      features: [
        "2-3 Business Days",
        "Real-time GPS Tracking",
        "Doorstep Pickup",
        "Premium Padding",
        "Insurance Coverage",
      ],
      buttonText: "Select Express",
      accent: "secondary",
      isBestValue: true,
      isHighlighted: true,
    },
    {
      tier: "Freight",
      price: "85.00",
      description: "Heavy-duty transit for bulky items, pallets, and large cargo.",
      features: [
        "7-10 Business Days",
        "Dedicated Support",
        "Palletization Included",
        "Custom Clearance Assist",
        "Lift-gate Service",
      ],
      buttonText: "Select Freight",
      accent: "accent",
    },
  ],
  additionalServices: [
    {
      icon: "/assets/IMG_14.svg",
      title: "Shipping Insurance",
      description: "Protect against damage or loss up to 5.000.000 VND value.",
      price: "+5.000 VND",
    },
    {
      icon: "/assets/IMG_15.svg",
      title: "Eco-Friendly Delivery",
      description: "100% carbon offset for your package's transit route.",
      price: "+1.500 VND",
    },
    {
      icon: "/assets/IMG_16.svg",
      title: "Fragile Handling",
      description: "Specialized sorting and shock-absorbent mounting.",
      price: "+3.250 VND",
    },
    {
      icon: "/assets/IMG_17.svg",
      title: "Express Customs",
      description: "Priority documentation processing for international routes.",
      price: "+12.000 VND",
    },
  ],
};

