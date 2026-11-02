/**
 * DATA & STATE MODULE
 * Holds store metadata, menu items (with BOM), branch inventories, and shared state.
 */

// ── 1. STORE LOCATIONS (Delhi NCR Cluster) ──
const STORES = [
    { id: 0, name: "Central Hub - Connaught Place", address: "Block B, Inner Circle, Connaught Place, New Delhi", lat: 28.6315, lng: 77.2167, dist: "0.0 km", isHub: true, inRadius: true },
    { id: 1, name: "Express - Paharganj", address: "Main Bazaar Road, Paharganj, New Delhi (~1.8km)", lat: 28.6435, lng: 77.2119, dist: "1.8 km", isHub: false, inRadius: true, surplus: "Crispy Veg Patty (50 pcs) · 3 days to expiry" },
    { id: 2, name: "Kitchen - Karol Bagh", address: "Ajmal Khan Road, Karol Bagh, New Delhi (~3.8km)", lat: 28.6514, lng: 77.1907, dist: "3.8 km", isHub: false, inRadius: true, surplus: "Russet Potatoes (40 kg) · 5 days to expiry" },
    { id: 3, name: "Bistro - Chandni Chowk", address: "Near Metro Gate 1, Chandni Chowk, Old Delhi (~2.9km)", lat: 28.6506, lng: 77.2303, dist: "2.9 km", isHub: false, inRadius: true, surplus: "Fresh Tomatoes (20 kg) · 4 days to expiry" },
    { id: 4, name: "Outpost - South Extension", address: "Part 2 Market, South Extension, New Delhi (~7.2km)", lat: 28.5729, lng: 77.2215, dist: "7.2 km", isHub: false, inRadius: true, surplus: "Cheddar Cheese Slice (30 pcs) · 7 days to expiry" },
    { id: 5, name: "Far Branch - Rajouri Garden", address: "Major Sudesh Kumar Marg, Rajouri Garden (~11.5km)", lat: 28.6492, lng: 77.1219, dist: "11.5 km", isHub: false, inRadius: false, surplus: "Outside 10km perimeter" }
];

// ── 2. MENU CATALOG & BILL OF MATERIALS (BOM) ──
const MENU_ITEMS = [
    {
        id: "m1",
        name: "Classic Crispy Veg Burger",
        category: "Burgers",
        price: 149,
        isVeg: true,
        rating: "4.9 (142)",
        badge: "Always Fresh 🌱",
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
        bom: [
            { name: "Brioche Burger Buns", qty: 1, unit: "pcs" },
            { name: "Crispy Veg Patty", qty: 1, unit: "pcs" },
            { name: "Cheddar Cheese Slice", qty: 1, unit: "pcs" },
            { name: "Fresh Tomatoes", qty: 0.05, unit: "kg" },
            { name: "Iceberg Lettuce", qty: 0.03, unit: "kg" }
        ]
    },
    {
        id: "m2",
        name: "Grilled Chicken Deluxe Burger",
        category: "Burgers",
        price: 199,
        isVeg: false,
        rating: "4.9 (218)",
        badge: "Chef's Choice ⭐",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
        bom: [
            { name: "Brioche Burger Buns", qty: 1, unit: "pcs" },
            { name: "Grilled Chicken Patty", qty: 1, unit: "pcs" },
            { name: "Cheddar Cheese Slice", qty: 1, unit: "pcs" },
            { name: "Signature Garlic Mayo", qty: 0.03, unit: "kg" }
        ]
    },
    {
        id: "m3",
        name: "Golden Salted French Fries",
        category: "Sides",
        price: 109,
        isVeg: true,
        rating: "4.8 (95)",
        badge: "Farm Potatoes 🥔",
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80",
        bom: [
            { name: "Russet Potatoes", qty: 0.25, unit: "kg" }
        ]
    },
    {
        id: "m4",
        name: "Cheesy Loaded Fries",
        category: "Sides",
        price: 159,
        isVeg: true,
        rating: "4.9 (180)",
        badge: "Melted Cheddar 🧀",
        image: "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80",
        bom: [
            { name: "Russet Potatoes", qty: 0.30, unit: "kg" },
            { name: "Cheddar Cheese Slice", qty: 2, unit: "pcs" },
            { name: "Signature Garlic Mayo", qty: 0.04, unit: "kg" }
        ]
    },
    {
        id: "m5",
        name: "Chilled Fountain Cola (500ml)",
        category: "Beverages",
        price: 69,
        isVeg: true,
        rating: "4.7 (88)",
        badge: "Ice Chilled ❄️",
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80",
        bom: [
            { name: "Cola Fountain Syrup", qty: 0.08, unit: "L" }
        ]
    },
    {
        id: "m6",
        name: "Chef Special Combo Meal",
        category: "Combos",
        price: 299,
        isVeg: true,
        rating: "5.0 (310)",
        badge: "Best Value 🍱",
        image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80",
        bom: [
            { name: "Brioche Burger Buns", qty: 1, unit: "pcs" },
            { name: "Crispy Veg Patty", qty: 1, unit: "pcs" },
            { name: "Russet Potatoes", qty: 0.20, unit: "kg" },
            { name: "Cola Fountain Syrup", qty: 0.08, unit: "L" }
        ]
    }
];

// ── 3. BRANCH INVENTORY MATRICES ──
// Each store has distinct stock levels, reorder thresholds, and FEFO expiry tracking.
const STORE_INVENTORIES = {
    0: [ // Connaught Place (Flagship: Shortages on Patties & Potatoes)
        { name: "Fresh Tomatoes", unit: "kg", qty: 25.0, reorder: 10.0, max: 40.0, expiry: "5 days remaining" },
        { name: "Iceberg Lettuce", unit: "kg", qty: 25.0, reorder: 10.0, max: 40.0, expiry: "4 days remaining" },
        { name: "Crispy Veg Patty", unit: "pcs", qty: 3.0, reorder: 8.0, max: 50.0, expiry: "3 days remaining (FEFO Alert)" },
        { name: "Signature Garlic Mayo", unit: "kg", qty: 24.55, reorder: 10.0, max: 35.0, expiry: "14 days remaining" },
        { name: "Cheddar Cheese Slice", unit: "pcs", qty: 15.0, reorder: 10.0, max: 60.0, expiry: "12 days remaining" },
        { name: "Russet Potatoes", unit: "kg", qty: 2.0, reorder: 5.0, max: 30.0, expiry: "2 days remaining (FEFO Alert)" },
        { name: "Brioche Burger Buns", unit: "pcs", qty: 45.0, reorder: 12.0, max: 80.0, expiry: "4 days remaining" },
        { name: "Grilled Chicken Patty", unit: "pcs", qty: 30.0, reorder: 10.0, max: 50.0, expiry: "6 days remaining" },
        { name: "Cola Fountain Syrup", unit: "L", qty: 40.0, reorder: 8.0, max: 60.0, expiry: "30 days remaining" }
    ],
    1: [ // Express - Paharganj (Surplus Veg Patties Donor)
        { name: "Fresh Tomatoes", unit: "kg", qty: 28.0, reorder: 10.0, max: 40.0, expiry: "6 days remaining" },
        { name: "Iceberg Lettuce", unit: "kg", qty: 18.0, reorder: 10.0, max: 40.0, expiry: "5 days remaining" },
        { name: "Crispy Veg Patty", unit: "pcs", qty: 48.0, reorder: 8.0, max: 50.0, expiry: "3 days remaining (FEFO Surplus Donor)" },
        { name: "Signature Garlic Mayo", unit: "kg", qty: 16.0, reorder: 10.0, max: 35.0, expiry: "20 days remaining" },
        { name: "Cheddar Cheese Slice", unit: "pcs", qty: 35.0, reorder: 10.0, max: 60.0, expiry: "10 days remaining" },
        { name: "Russet Potatoes", unit: "kg", qty: 18.0, reorder: 5.0, max: 30.0, expiry: "8 days remaining" },
        { name: "Brioche Burger Buns", unit: "pcs", qty: 52.0, reorder: 12.0, max: 80.0, expiry: "5 days remaining" },
        { name: "Grilled Chicken Patty", unit: "pcs", qty: 22.0, reorder: 10.0, max: 50.0, expiry: "7 days remaining" },
        { name: "Cola Fountain Syrup", unit: "L", qty: 30.0, reorder: 8.0, max: 60.0, expiry: "35 days remaining" }
    ],
    2: [ // Kitchen - Karol Bagh (Surplus Potatoes & Chicken Patties)
        { name: "Fresh Tomatoes", unit: "kg", qty: 20.0, reorder: 10.0, max: 40.0, expiry: "7 days remaining" },
        { name: "Iceberg Lettuce", unit: "kg", qty: 22.0, reorder: 10.0, max: 40.0, expiry: "4 days remaining" },
        { name: "Crispy Veg Patty", unit: "pcs", qty: 24.0, reorder: 8.0, max: 50.0, expiry: "8 days remaining" },
        { name: "Signature Garlic Mayo", unit: "kg", qty: 28.0, reorder: 10.0, max: 35.0, expiry: "15 days remaining" },
        { name: "Cheddar Cheese Slice", unit: "pcs", qty: 25.0, reorder: 10.0, max: 60.0, expiry: "9 days remaining" },
        { name: "Russet Potatoes", unit: "kg", qty: 28.5, reorder: 5.0, max: 30.0, expiry: "3 days remaining (FEFO Surplus Donor)" },
        { name: "Brioche Burger Buns", unit: "pcs", qty: 8.0, reorder: 12.0, max: 80.0, expiry: "3 days remaining (FEFO Alert)" },
        { name: "Grilled Chicken Patty", unit: "pcs", qty: 45.0, reorder: 10.0, max: 50.0, expiry: "4 days remaining (FEFO Surplus Donor)" },
        { name: "Cola Fountain Syrup", unit: "L", qty: 35.0, reorder: 8.0, max: 60.0, expiry: "28 days remaining" }
    ],
    3: [ // Bistro - Chandni Chowk (Surplus Tomatoes & Cheddar Cheese)
        { name: "Fresh Tomatoes", unit: "kg", qty: 36.0, reorder: 10.0, max: 40.0, expiry: "3 days remaining (FEFO Surplus Donor)" },
        { name: "Iceberg Lettuce", unit: "kg", qty: 15.0, reorder: 10.0, max: 40.0, expiry: "5 days remaining" },
        { name: "Crispy Veg Patty", unit: "pcs", qty: 18.0, reorder: 8.0, max: 50.0, expiry: "6 days remaining" },
        { name: "Signature Garlic Mayo", unit: "kg", qty: 12.0, reorder: 10.0, max: 35.0, expiry: "18 days remaining" },
        { name: "Cheddar Cheese Slice", unit: "pcs", qty: 54.0, reorder: 10.0, max: 60.0, expiry: "4 days remaining (FEFO Surplus Donor)" },
        { name: "Russet Potatoes", unit: "kg", qty: 14.0, reorder: 5.0, max: 30.0, expiry: "6 days remaining" },
        { name: "Brioche Burger Buns", unit: "pcs", qty: 38.0, reorder: 12.0, max: 80.0, expiry: "6 days remaining" },
        { name: "Grilled Chicken Patty", unit: "pcs", qty: 4.0, reorder: 10.0, max: 50.0, expiry: "2 days remaining (FEFO Alert)" },
        { name: "Cola Fountain Syrup", unit: "L", qty: 25.0, reorder: 8.0, max: 60.0, expiry: "40 days remaining" }
    ],
    4: [ // Outpost - South Extension (Surplus Garlic Mayo & Buns)
        { name: "Fresh Tomatoes", unit: "kg", qty: 19.0, reorder: 10.0, max: 40.0, expiry: "6 days remaining" },
        { name: "Iceberg Lettuce", unit: "kg", qty: 6.0, reorder: 10.0, max: 40.0, expiry: "2 days remaining (FEFO Alert)" },
        { name: "Crispy Veg Patty", unit: "pcs", qty: 32.0, reorder: 8.0, max: 50.0, expiry: "9 days remaining" },
        { name: "Signature Garlic Mayo", unit: "kg", qty: 31.0, reorder: 10.0, max: 35.0, expiry: "12 days remaining" },
        { name: "Cheddar Cheese Slice", unit: "pcs", qty: 40.0, reorder: 10.0, max: 60.0, expiry: "11 days remaining" },
        { name: "Russet Potatoes", unit: "kg", qty: 20.0, reorder: 5.0, max: 30.0, expiry: "7 days remaining" },
        { name: "Brioche Burger Buns", unit: "pcs", qty: 68.0, reorder: 12.0, max: 80.0, expiry: "5 days remaining" },
        { name: "Grilled Chicken Patty", unit: "pcs", qty: 28.0, reorder: 10.0, max: 50.0, expiry: "8 days remaining" },
        { name: "Cola Fountain Syrup", unit: "L", qty: 48.0, reorder: 8.0, max: 60.0, expiry: "25 days remaining" }
    ],
    5: [ // Far Branch - Rajouri Garden (Outside 10km perimeter)
        { name: "Fresh Tomatoes", unit: "kg", qty: 14.0, reorder: 10.0, max: 40.0, expiry: "8 days remaining" },
        { name: "Iceberg Lettuce", unit: "kg", qty: 16.0, reorder: 10.0, max: 40.0, expiry: "6 days remaining" },
        { name: "Crispy Veg Patty", unit: "pcs", qty: 20.0, reorder: 8.0, max: 50.0, expiry: "7 days remaining" },
        { name: "Signature Garlic Mayo", unit: "kg", qty: 18.0, reorder: 10.0, max: 35.0, expiry: "22 days remaining" },
        { name: "Cheddar Cheese Slice", unit: "pcs", qty: 22.0, reorder: 10.0, max: 60.0, expiry: "14 days remaining" },
        { name: "Russet Potatoes", unit: "kg", qty: 12.0, reorder: 5.0, max: 30.0, expiry: "9 days remaining" },
        { name: "Brioche Burger Buns", unit: "pcs", qty: 30.0, reorder: 12.0, max: 80.0, expiry: "8 days remaining" },
        { name: "Grilled Chicken Patty", unit: "pcs", qty: 19.0, reorder: 10.0, max: 50.0, expiry: "9 days remaining" },
        { name: "Cola Fountain Syrup", unit: "L", qty: 22.0, reorder: 8.0, max: 60.0, expiry: "45 days remaining" }
    ]
};

// ── 4. DISH CUSTOMIZATION CONFIG ──
const ITEM_CUSTOMIZATIONS = {
    Burgers: [
        {
            title: "Bun Selection",
            type: "single",
            hint: "Select 1",
            options: [
                { id: "brioche", label: "Toasted Brioche Bun", price: 0, default: true, bomAdd: { name: "Brioche Burger Buns", qty: 1, unit: "pcs" } },
                { id: "wholewheat", label: "Whole Wheat Bun (+₹15)", price: 15, bomAdd: { name: "Brioche Burger Buns", qty: 1, unit: "pcs" } }
            ]
        },
        {
            title: "Add-ons & Extras",
            type: "multi",
            hint: "Select any",
            options: [
                { id: "extra_cheese", label: "Extra Cheddar Slice (+₹20)", price: 20, bomAdd: { name: "Cheddar Cheese Slice", qty: 1, unit: "pcs" } },
                { id: "extra_mayo", label: "Signature Garlic Mayo (+₹15)", price: 15, bomAdd: { name: "Signature Garlic Mayo", qty: 0.02, unit: "kg" } },
                { id: "extra_tomatoes", label: "Extra Farm Tomatoes (+₹10)", price: 10, bomAdd: { name: "Fresh Tomatoes", qty: 0.03, unit: "kg" } }
            ]
        }
    ],
    Sides: [
        {
            title: "Portion Size",
            type: "single",
            hint: "Select 1",
            options: [
                { id: "regular", label: "Standard Portion", price: 0, default: true },
                { id: "large", label: "Large Portion (+₹40)", price: 40, bomAdd: { name: "Russet Potatoes", qty: 0.15, unit: "kg" } }
            ]
        },
        {
            title: "Toppings & Seasoning",
            type: "multi",
            hint: "Select any",
            options: [
                { id: "melted_cheddar", label: "Double Melted Cheddar (+₹25)", price: 25, bomAdd: { name: "Cheddar Cheese Slice", qty: 1, unit: "pcs" } },
                { id: "garlic_dip", label: "Garlic Mayo Cup (+₹15)", price: 15, bomAdd: { name: "Signature Garlic Mayo", qty: 0.02, unit: "kg" } },
                { id: "peri_peri", label: "Peri-Peri Masala (+₹10)", price: 10 }
            ]
        }
    ],
    Beverages: [
        {
            title: "Serving Size",
            type: "single",
            hint: "Select 1",
            options: [
                { id: "size_500", label: "Regular 500ml", price: 0, default: true },
                { id: "size_750", label: "King 750ml (+₹25)", price: 25, bomAdd: { name: "Cola Fountain Syrup", qty: 0.04, unit: "L" } }
            ]
        },
        {
            title: "Ice Level",
            type: "single",
            hint: "Select 1",
            options: [
                { id: "norm_ice", label: "Normal Ice ❄️", price: 0, default: true },
                { id: "less_ice", label: "Less Ice", price: 0 },
                { id: "no_ice", label: "No Ice (Extra Cold)", price: 0 }
            ]
        },
        {
            title: "Recipe Variant",
            type: "single",
            hint: "Select 1",
            options: [
                { id: "classic", label: "Classic Fountain Cola", price: 0, default: true },
                { id: "zero_sugar", label: "Zero Sugar Diet", price: 0 }
            ]
        }
    ],
    Combos: [
        {
            title: "Fries Choice",
            type: "single",
            hint: "Select 1",
            options: [
                { id: "salted", label: "Golden Salted Fries", price: 0, default: true },
                { id: "peri_fries", label: "Spicy Peri-Peri Fries (+₹15)", price: 15 }
            ]
        },
        {
            title: "Beverage Option",
            type: "single",
            hint: "Select 1",
            options: [
                { id: "drink_500", label: "Chilled Cola (500ml)", price: 0, default: true },
                { id: "drink_750", label: "Upgrade King 750ml (+₹20)", price: 20, bomAdd: { name: "Cola Fountain Syrup", qty: 0.04, unit: "L" } }
            ]
        }
    ]
};

// ── 5. SHARED APPLICATION STATE ──
let currentStoreIdx = 0;
let inventoryMatrix = STORE_INVENTORIES[0];
let cart = {}; // e.g. { "m1": { id: "m1", qty: 2, unitPrice: 149, ... } }
let activeCategory = "all";

let esgMetrics = {
    foodWasteKg: 10.5,
    costSavedInr: 850,
    transfersCompleted: 5,
    transfersTotal: 6,
    activeShortages: 2
};

let transferPings = [
    {
        id: "ping-sample-1",
        from_store_id: 3, // Bistro - Chandni Chowk (Donor)
        to_store_id: 0,   // Central Hub - Connaught Place (Recipient)
        ingredient: "Cheddar Cheese Slice",
        quantity: 6,
        unit: "pcs",
        distance_km: 1.96,
        status: "PENDING",
        created_at: new Date()
    }
];

let pendingPingData = null;
