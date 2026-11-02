/**
 * ECOBITE AUTONOMOUS KITCHEN CONSOLE
 * Core Modules: 1. POS Terminal & BOM Micro-Deduction
 *               2. 10km Geospatial Radar & FEFO Store Manager
 *               3. ESG & Commercial Food Waste Analytics
 */

// ── STORE NODES (Delhi NCR Cluster) ──
const STORES = [
    { id: 0, name: "Central Hub - Connaught Place", address: "Block B, Inner Circle, Connaught Place, New Delhi", lat: 28.6315, lng: 77.2167, dist: "0.0 km", isHub: true, inRadius: true },
    { id: 1, name: "Express - Paharganj", address: "Main Bazaar Road, Paharganj, New Delhi (~1.8km)", lat: 28.6435, lng: 77.2119, dist: "1.8 km", isHub: false, inRadius: true, surplus: "Crispy Veg Patty (50 pcs) · 3 days to expiry" },
    { id: 2, name: "Kitchen - Karol Bagh", address: "Ajmal Khan Road, Karol Bagh, New Delhi (~3.8km)", lat: 28.6514, lng: 77.1907, dist: "3.8 km", isHub: false, inRadius: true, surplus: "Russet Potatoes (40 kg) · 5 days to expiry" },
    { id: 3, name: "Bistro - Chandni Chowk", address: "Near Metro Gate 1, Chandni Chowk, Old Delhi (~2.9km)", lat: 28.6506, lng: 77.2303, dist: "2.9 km", isHub: false, inRadius: true, surplus: "Fresh Tomatoes (20 kg) · 4 days to expiry" },
    { id: 4, name: "Outpost - South Extension", address: "Part 2 Market, South Extension, New Delhi (~7.2km)", lat: 28.5729, lng: 77.2215, dist: "7.2 km", isHub: false, inRadius: true, surplus: "Cheddar Cheese Slice (30 pcs) · 7 days to expiry" },
    { id: 5, name: "Far Branch - Rajouri Garden", address: "Major Sudesh Kumar Marg, Rajouri Garden (~11.5km)", lat: 28.6492, lng: 77.1219, dist: "11.5 km", isHub: false, inRadius: false, surplus: "Outside 10km perimeter" }
];

// ── MENU ITEMS & BILL OF MATERIALS (BOM) ──
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
        image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80",
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

// ── REAL-TIME MICRO-INVENTORY MATRIX ──
let inventoryMatrix = [
    { name: "Fresh Tomatoes", unit: "kg", qty: 25.0, reorder: 10.0, max: 40.0, expiry: "5 days remaining" },
    { name: "Iceberg Lettuce", unit: "kg", qty: 25.0, reorder: 10.0, max: 40.0, expiry: "4 days remaining" },
    { name: "Crispy Veg Patty", unit: "pcs", qty: 3.0, reorder: 8.0, max: 50.0, expiry: "3 days remaining (FEFO Alert)" },
    { name: "Signature Garlic Mayo", unit: "kg", qty: 24.55, reorder: 10.0, max: 35.0, expiry: "14 days remaining" },
    { name: "Cheddar Cheese Slice", unit: "pcs", qty: 15.0, reorder: 10.0, max: 60.0, expiry: "12 days remaining" },
    { name: "Russet Potatoes", unit: "kg", qty: 2.0, reorder: 5.0, max: 30.0, expiry: "2 days remaining (FEFO Alert)" },
    { name: "Brioche Burger Buns", unit: "pcs", qty: 45.0, reorder: 12.0, max: 80.0, expiry: "4 days remaining" },
    { name: "Grilled Chicken Patty", unit: "pcs", qty: 30.0, reorder: 10.0, max: 50.0, expiry: "6 days remaining" },
    { name: "Cola Fountain Syrup", unit: "L", qty: 40.0, reorder: 8.0, max: 60.0, expiry: "30 days remaining" }
];

// ── CART STATE ──
let cart = {}; // { m1: 2, m3: 1 }

// ── ESG ANALYTICS METRICS ──
let esgMetrics = {
    foodWasteKg: 10.5,
    costSavedInr: 850,
    transfersCompleted: 5,
    transfersTotal: 6,
    activeShortages: 1
};

// ── GLOBAL REFERENCES ──
let currentStoreIdx = 0;
let leafletMap = null;
let geofenceCircle = null;
let storeMarkers = [];
let materialsChart = null;

// ====================================================
// INITIALIZATION
// ====================================================
document.addEventListener("DOMContentLoaded", () => {
    initUserProfile();
    initTabNavigation();
    initStoreSwitcher();
    renderMenuCatalog("all");
    initCategoryFilters();
    renderInventoryMatrix();
    initRadarMap();
    initEsgAnalytics();
    initHyperpureModal();
});

// ── USER PROFILE FROM LOCALSTORAGE ──
function initUserProfile() {
    const stored = localStorage.getItem("ecobite_user");
    if (stored) {
        try {
            const user = JSON.parse(stored);
            const avatarEl = document.getElementById("app-user-avatar");
            const nameEl = document.getElementById("app-user-name");
            if (user.avatar && avatarEl) avatarEl.src = user.avatar;
            if (user.name && nameEl) nameEl.textContent = user.name.split(" ")[0];
        } catch (e) {
            console.error("Error parsing user profile", e);
        }
    }
}

// ── TAB SWITCHING ──
function initTabNavigation() {
    const tabs = document.querySelectorAll(".app-tab-btn");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const target = tab.getAttribute("data-tab");
            tabs.forEach(t => {
                t.classList.remove("active");
                t.setAttribute("aria-selected", "false");
            });
            tab.classList.add("active");
            tab.setAttribute("aria-selected", "true");

            document.querySelectorAll(".app-tab-panel").forEach(p => p.classList.remove("active"));
            const targetPanel = document.getElementById(`panel-${target}`);
            if (targetPanel) targetPanel.classList.add("active");

            // Invalidate Leaflet map size when switching to Radar tab
            if (target === "radar" && leafletMap) {
                setTimeout(() => leafletMap.invalidateSize(), 150);
            }
        });
    });
}

// ── STORE SWITCHER ──
function initStoreSwitcher() {
    const select = document.getElementById("store-switcher");
    if (!select) return;

    select.addEventListener("change", (e) => {
        currentStoreIdx = parseInt(e.target.value, 10);
        const store = STORES[currentStoreIdx];

        // Update displays
        document.getElementById("pos-store-display").textContent = store.name;
        document.getElementById("pos-address-display").textContent = store.address;
        document.getElementById("pos-coords-display").textContent = `${store.lat.toFixed(4)}°N, ${store.lng.toFixed(4)}°E`;
        
        document.getElementById("radar-store-display").textContent = store.name;
        document.getElementById("radar-address-display").textContent = `${store.address} · ${store.lat.toFixed(4)}°N, ${store.lng.toFixed(4)}°E`;
        document.getElementById("map-radius-sub").textContent = `Radius perimeter centered on ${store.name}`;

        // Re-center map to selected store
        if (leafletMap && geofenceCircle) {
            leafletMap.flyTo([store.lat, store.lng], 12, { duration: 1.2 });
            geofenceCircle.setLatLng([store.lat, store.lng]);
        }
    });
}

// ====================================================
// MODULE 1: POS TERMINAL & INVENTORY MICRO-DEDUCTION
// ====================================================

function initCategoryFilters() {
    const chips = document.querySelectorAll(".pos-cat-chip");
    chips.forEach(chip => {
        chip.addEventListener("click", () => {
            chips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            const cat = chip.getAttribute("data-cat");
            renderMenuCatalog(cat);
        });
    });
}

let activeCategory = "all";

function getCartItemTotalQty(itemId) {
    let total = 0;
    Object.values(cart).forEach(entry => {
        if (entry.id === itemId) total += entry.qty;
    });
    return total;
}

function renderMenuCatalog(filterCategory = activeCategory) {
    activeCategory = filterCategory;
    const grid = document.getElementById("pos-menu-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const items = filterCategory === "all" 
        ? MENU_ITEMS 
        : MENU_ITEMS.filter(m => m.category.toLowerCase() === filterCategory.toLowerCase());

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "pos-menu-card gb-dish-card";
        
        const bomTagsHtml = item.bom.map(b => 
            `<span class="bom-pill">${b.name} (${b.qty}${b.unit})</span>`
        ).join("");

        const qtyInCart = getCartItemTotalQty(item.id);
        const actionControls = qtyInCart > 0
            ? `
                <div class="dish-card-stepper">
                    <button type="button" class="btn-card-step btn-card-step--minus" data-id="${item.id}" aria-label="Decrease quantity">−</button>
                    <span class="card-step-qty">${qtyInCart} in Cart</span>
                    <button type="button" class="btn-card-step btn-card-step--plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
                </div>
              `
            : `
                <button type="button" class="btn-add-dish gb-btn-add" data-id="${item.id}" title="Quick Add">
                    <span>+ Add to Cart</span>
                </button>
              `;

        card.innerHTML = `
            <div class="gb-card-thumb-wrap">
                <img src="${item.image}" alt="${item.name}" class="gb-card-img" loading="lazy">
                <span class="gb-badge-veg ${item.isVeg ? 'veg' : 'non-veg'}">
                    <span class="veg-icon-dot"></span> ${item.isVeg ? '100% Veg' : 'Chicken'}
                </span>
                <span class="gb-badge-floating">${item.badge || 'Always Fresh 🌱'}</span>
            </div>
            <div class="gb-card-content">
                <div class="menu-card-top">
                    <span class="menu-card-category">${item.category}</span>
                    <span class="gb-card-rating">⭐ ${item.rating || '4.9'}</span>
                </div>
                <h3 class="menu-card-title">${item.name}</h3>
                <div class="menu-card-bom-box">
                    <div class="bom-header-row">
                        <span class="bom-label">🌱 BOM Farm Micro-Deduction:</span>
                    </div>
                    <div class="bom-tags">${bomTagsHtml}</div>
                </div>
                <div class="gb-card-footer">
                    <div class="gb-price-wrap">
                        <span class="gb-currency">₹</span>
                        <span class="menu-card-price">${item.price}</span>
                    </div>
                    <div class="dish-btn-group">
                        ${actionControls}
                        <button type="button" class="btn-customize-dish" data-id="${item.id}" title="Select options & quantity">
                            <span>Options ⚙</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Direct Quick Add Button
        const addBtn = card.querySelector(".btn-add-dish");
        if (addBtn) {
            addBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                addToCart(item.id, 1);
            });
        }

        // Stepper Plus Button
        const stepPlus = card.querySelector(".btn-card-step--plus");
        if (stepPlus) {
            stepPlus.addEventListener("click", (e) => {
                e.stopPropagation();
                addToCart(item.id, 1);
            });
        }

        // Stepper Minus Button
        const stepMinus = card.querySelector(".btn-card-step--minus");
        if (stepMinus) {
            stepMinus.addEventListener("click", (e) => {
                e.stopPropagation();
                const matchingKey = Object.keys(cart).find(k => cart[k].id === item.id);
                if (matchingKey) updateCartQty(matchingKey, -1);
            });
        }

        // Options Button
        const custBtn = card.querySelector(".btn-customize-dish");
        custBtn?.addEventListener("click", (e) => {
            e.stopPropagation();
            openHyperpureModal(item);
        });

        // Click card body opens options & quantity modal
        card.addEventListener("click", () => {
            openHyperpureModal(item);
        });

        grid.appendChild(card);
    });
}

function addToCart(itemId, qty = 1) {
    const item = MENU_ITEMS.find(m => m.id === itemId);
    if (!item) return;

    const cartKey = itemId;
    if (!cart[cartKey]) {
        cart[cartKey] = {
            key: cartKey,
            id: itemId,
            qty: 0,
            unitPrice: item.price,
            optionsText: "",
            bomAddons: []
        };
    }
    cart[cartKey].qty += qty;
    if (cart[cartKey].qty <= 0) {
        delete cart[cartKey];
    }
    renderCart();
    renderMenuCatalog(activeCategory);
}

function updateCartQty(key, delta) {
    if (cart[key]) {
        cart[key].qty += delta;
        if (cart[key].qty <= 0) {
            delete cart[key];
        }
        renderCart();
        renderMenuCatalog(activeCategory);
    }
}

function addCustomizedToCart(item, qty, selectedOptions) {
    let extraPrice = 0;
    const labels = [];
    const bomAddons = [];

    selectedOptions.forEach(opt => {
        if (opt.price) extraPrice += opt.price;
        labels.push(opt.label.replace(/\s*\(\+₹\d+\)/, ""));
        if (opt.bomAdd) bomAddons.push(opt.bomAdd);
    });

    const optKeySuffix = selectedOptions.map(o => o.id).sort().join("_");
    const cartKey = optKeySuffix ? `${item.id}__${optKeySuffix}` : item.id;

    if (!cart[cartKey]) {
        cart[cartKey] = {
            key: cartKey,
            id: item.id,
            qty: 0,
            unitPrice: item.price + extraPrice,
            optionsText: labels.join(" · "),
            bomAddons: bomAddons
        };
    }
    cart[cartKey].qty += qty;
    renderCart();
    renderMenuCatalog(activeCategory);
}

function renderCart() {
    const cartList = document.getElementById("cart-items-list");
    const cartFooter = document.getElementById("cart-footer");
    const bomSummaryEl = document.getElementById("bom-items-summary");
    const subtotalEl = document.getElementById("cart-subtotal");
    const taxEl = document.getElementById("cart-tax");
    const grandtotalEl = document.getElementById("cart-grandtotal");

    const cartKeys = Object.keys(cart);

    if (cartKeys.length === 0) {
        cartList.innerHTML = `
            <div class="cart-empty-state" id="cart-empty-placeholder">
                <div class="cart-empty-icon">🛒</div>
                <h4>Cart is empty</h4>
                <p>Add dishes from the menu to simulate live order intake & micro-deduction.</p>
            </div>
        `;
        cartFooter.style.display = "none";
        return;
    }

    cartFooter.style.display = "block";
    cartList.innerHTML = "";

    let subtotal = 0;
    const computedBom = {};

    cartKeys.forEach(key => {
        const entry = cart[key];
        const item = MENU_ITEMS.find(m => m.id === entry.id);
        if (!item) return;

        const lineTotal = entry.unitPrice * entry.qty;
        subtotal += lineTotal;

        // Base BOM deductions
        item.bom.forEach(b => {
            if (!computedBom[b.name]) {
                computedBom[b.name] = { totalQty: 0, unit: b.unit };
            }
            computedBom[b.name].totalQty += b.qty * entry.qty;
        });

        // Addon BOM deductions
        if (entry.bomAddons && entry.bomAddons.length) {
            entry.bomAddons.forEach(b => {
                if (!computedBom[b.name]) {
                    computedBom[b.name] = { totalQty: 0, unit: b.unit };
                }
                computedBom[b.name].totalQty += b.qty * entry.qty;
            });
        }

        const row = document.createElement("div");
        row.className = "cart-item-row";
        row.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
            <div class="cart-item-info">
                <h5>${item.name}</h5>
                ${entry.optionsText ? `<span class="cart-item-options-tag">✦ ${entry.optionsText}</span>` : ""}
                <span class="cart-item-price">₹${entry.unitPrice} × ${entry.qty} = ₹${lineTotal}</span>
            </div>
            <div class="cart-item-stepper">
                <button type="button" class="btn-step btn-step--dec" data-key="${entry.key}" aria-label="Decrease quantity">−</button>
                <span class="step-qty">${entry.qty}</span>
                <button type="button" class="btn-step btn-step--inc" data-key="${entry.key}" aria-label="Increase quantity">+</button>
            </div>
        `;

        row.querySelector(".btn-step--dec").addEventListener("click", () => updateCartQty(entry.key, -1));
        row.querySelector(".btn-step--inc").addEventListener("click", () => updateCartQty(entry.key, 1));
        cartList.appendChild(row);
    });

    // Render BOM micro-deduction summary
    bomSummaryEl.innerHTML = Object.keys(computedBom).map(ingName => {
        const data = computedBom[ingName];
        return `<li>- ${ingName}: ${data.totalQty.toFixed(2)}${data.unit}</li>`;
    }).join("");

    // Calculate totals
    const gst = Math.round(subtotal * 0.05);
    const grandTotal = subtotal + gst;

    subtotalEl.textContent = `₹${subtotal}`;
    taxEl.textContent = `₹${gst}`;
    grandtotalEl.textContent = `₹${grandTotal}`;
}

// Clear cart
document.getElementById("btn-clear-cart")?.addEventListener("click", () => {
    cart = {};
    renderCart();
    renderMenuCatalog(activeCategory);
});

// ====================================================
// ATOMIC ORDER CHECKOUT & 10KM FEFO REDISTRIBUTION PING
// ====================================================

let pendingPingData = null;

document.getElementById("btn-checkout-order")?.addEventListener("click", async () => {
    const cartKeys = Object.keys(cart);
    if (cartKeys.length === 0) return;

    const deductionsSummary = [];
    const criticalShortages = [];
    let orderSubtotal = 0;

    // 1. Calculate and deduct from local Inventory Matrix
    cartKeys.forEach(key => {
        const entry = cart[key];
        const item = MENU_ITEMS.find(m => m.id === entry.id);
        if (!item) return;
        const count = entry.qty;
        orderSubtotal += entry.unitPrice * count;

        // Base BOM deduction
        item.bom.forEach(b => {
            const match = inventoryMatrix.find(i => i.name === b.name);
            if (match) {
                const deductAmt = parseFloat((b.qty * count).toFixed(2));
                match.qty = Math.max(0, parseFloat((match.qty - deductAmt).toFixed(2)));

                let existing = deductionsSummary.find(d => d.name === match.name);
                if (existing) {
                    existing.deducted = parseFloat((existing.deducted + deductAmt).toFixed(2));
                    existing.remaining = match.qty;
                } else {
                    deductionsSummary.push({
                        name: match.name,
                        unit: match.unit,
                        deducted: deductAmt,
                        remaining: match.qty,
                        reorder: match.reorder
                    });
                }

                // Check for critical threshold breach
                if (match.qty <= match.reorder && !criticalShortages.some(c => c.name === match.name)) {
                    criticalShortages.push(match);
                }
            }
        });

        // Addon BOM deduction
        if (entry.bomAddons && entry.bomAddons.length) {
            entry.bomAddons.forEach(b => {
                const match = inventoryMatrix.find(i => i.name === b.name);
                if (match) {
                    const deductAmt = parseFloat((b.qty * count).toFixed(2));
                    match.qty = Math.max(0, parseFloat((match.qty - deductAmt).toFixed(2)));
                    let existing = deductionsSummary.find(d => d.name === match.name);
                    if (existing) {
                        existing.deducted = parseFloat((existing.deducted + deductAmt).toFixed(2));
                        existing.remaining = match.qty;
                    } else {
                        deductionsSummary.push({
                            name: match.name,
                            unit: match.unit,
                            deducted: deductAmt,
                            remaining: match.qty,
                            reorder: match.reorder
                        });
                    }

                    if (match.qty <= match.reorder && !criticalShortages.some(c => c.name === match.name)) {
                        criticalShortages.push(match);
                    }
                }
            });
        }
    });

    const gst = Math.round(orderSubtotal * 0.05);
    const grandTotal = orderSubtotal + gst;
    const orderId = "ORD-" + Math.random().toString(36).substring(2, 7).toUpperCase();

    // 2. Confetti Explosion
    if (typeof confetti === "function") {
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 }
        });
    }

    // 3. Clear cart & re-render
    cart = {};
    renderCart();
    renderMenuCatalog(activeCategory);
    renderInventoryMatrix();
    checkShortagesAndNotify();

    // 4. Populate and Show Order Success Receipt Modal
    const receiptModal = document.getElementById("receipt-modal");
    document.getElementById("receipt-order-id").textContent = `Receipt: ${orderId} · Central Hub - Connaught Place`;
    document.getElementById("receipt-total-val").textContent = `₹${grandTotal}`;

    const receiptList = document.getElementById("receipt-deductions-list");
    receiptList.innerHTML = deductionsSummary.map(d => `
        <div class="receipt-bom-row">
            <span class="ing-name">${d.name}</span>
            <span class="ing-stat">-${d.deducted} ${d.unit} (Left: ${d.remaining} ${d.unit})</span>
        </div>
    `).join("");

    const pingBanner = document.getElementById("receipt-ping-banner");
    if (criticalShortages.length > 0) {
        pingBanner.style.display = "block";
        document.getElementById("receipt-ping-desc").textContent = 
            `Critical stock breach on ${criticalShortages.map(c => c.name).join(", ")}. 10km FEFO Geospatial Algorithm triggered!`;
    } else {
        pingBanner.style.display = "none";
    }

    receiptModal.style.display = "flex";

    // 5. Trigger 10km Geospatial Redistribution Ping Modal (matching PingAlertModal.jsx)
    if (criticalShortages.length > 0) {
        const shortage = criticalShortages[0];
        pendingPingData = {
            id: "ping-" + Date.now(),
            ingredient: shortage.name,
            quantity: 8,
            unit: shortage.unit,
            fromStore: "Kitchen - Karol Bagh",
            toStore: "Central Hub (Connaught Place)",
            distanceKm: 3.8
        };

        document.getElementById("ping-store-name").textContent = pendingPingData.toStore;
        document.getElementById("ping-ing-name").textContent = pendingPingData.ingredient;
        document.getElementById("ping-ing-qty").textContent = `${pendingPingData.quantity} ${pendingPingData.unit}`;
        document.getElementById("ping-donor-name").textContent = pendingPingData.fromStore;
        document.getElementById("ping-distance-km").textContent = `${pendingPingData.distanceKm} km`;

        setTimeout(() => {
            document.getElementById("emergency-ping-alert").style.display = "block";
        }, 600);
    }
});

// Close Receipt Modal
document.getElementById("btn-receipt-close")?.addEventListener("click", () => {
    document.getElementById("receipt-modal").style.display = "none";
});

// Accept Emergency Ping Alert
document.getElementById("btn-ping-accept")?.addEventListener("click", () => {
    if (!pendingPingData) return;

    if (typeof confetti === "function") {
        confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.8 }
        });
    }

    // Replenish stock
    const match = inventoryMatrix.find(i => i.name === pendingPingData.ingredient);
    if (match) {
        match.qty = Math.round((match.qty + pendingPingData.quantity) * 10) / 10;
        match.expiry = "6 days remaining";
    }

    // Update ESG Analytics
    esgMetrics.foodWasteKg = parseFloat((esgMetrics.foodWasteKg + 4.5).toFixed(1));
    esgMetrics.costSavedInr += 320;
    esgMetrics.transfersCompleted += 1;
    esgMetrics.activeShortages = Math.max(0, inventoryMatrix.filter(i => i.qty <= i.reorder).length);

    renderInventoryMatrix();
    updateEsgMetricsDisplay();
    document.getElementById("radar-alert-badge").textContent = esgMetrics.activeShortages;

    document.getElementById("emergency-ping-alert").style.display = "none";
    pendingPingData = null;
});

// Dismiss Emergency Ping Alert
document.getElementById("btn-ping-dismiss")?.addEventListener("click", () => {
    document.getElementById("emergency-ping-alert").style.display = "none";
});

document.getElementById("btn-ping-ignore")?.addEventListener("click", () => {
    document.getElementById("emergency-ping-alert").style.display = "none";
});

// ====================================================
// MODULE 2: 10KM RADAR & STORE INVENTORY MATRIX
// ====================================================

function renderInventoryMatrix() {
    const container = document.getElementById("matrix-items-list");
    if (!container) return;
    container.innerHTML = "";

    let shortagesCount = 0;

    inventoryMatrix.forEach(item => {
        const isReorder = item.qty <= item.reorder;
        if (isReorder) shortagesCount++;

        const pct = Math.min(100, Math.round((item.qty / item.max) * 100));
        const statusClass = isReorder ? "matrix-status-pill--reorder" : "matrix-status-pill--optimal";
        const statusText = isReorder ? "Reorder Zone" : "Optimal";
        const fillClass = isReorder ? "matrix-bar-fill--warning" : "";

        const row = document.createElement("div");
        row.className = "matrix-row";
        row.innerHTML = `
            <div class="matrix-row-header">
                <div class="matrix-item-name">
                    <span>${item.name}</span>
                    <span class="matrix-status-pill ${statusClass}">${statusText}</span>
                </div>
                <span class="matrix-qty-val">${item.qty} ${item.unit}</span>
            </div>
            <div class="matrix-bar-track">
                <div class="matrix-bar-fill ${fillClass}" style="width: ${pct}%;"></div>
            </div>
            <div class="matrix-meta-row">
                <span>Threshold: ${item.reorder} ${item.unit}</span>
                <span>FEFO Expiry: ${item.expiry}</span>
            </div>
        `;
        container.appendChild(row);
    });

    // Update alert badges
    document.getElementById("radar-alert-badge").textContent = shortagesCount;
    document.getElementById("kpi-shortages").textContent = shortagesCount;
}

function initRadarMap() {
    const mapEl = document.getElementById("geofence-map");
    if (!mapEl) return;

    // Centered on Central Hub Connaught Place
    const center = [28.6315, 77.2167];
    leafletMap = L.map("geofence-map", {
        center: center,
        zoom: 12,
        scrollWheelZoom: false
    });

    // Free OpenStreetMap tiles (No API key required)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(leafletMap);

    // 10KM Geofence Radius Circle (10,000 meters)
    geofenceCircle = L.circle(center, {
        radius: 10000,
        color: "#1b4e2b",
        fillColor: "#22c55e",
        fillOpacity: 0.12,
        weight: 2.5,
        dashArray: "6, 8"
    }).addTo(leafletMap);

    // Store custom icon pins
    STORES.forEach(store => {
        const markerColor = store.isHub ? "#3b82f6" : (store.inRadius ? "#10b981" : "#ef4444");
        const markerHtml = `
            <div style="
                background: ${markerColor};
                color: white;
                width: 26px;
                height: 26px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 13px;
                font-weight: bold;
                border: 2px solid white;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            ">
                ${store.isHub ? "★" : "📍"}
            </div>
        `;
        const icon = L.divIcon({
            html: markerHtml,
            className: "custom-leaflet-pin",
            iconSize: [26, 26],
            iconAnchor: [13, 13]
        });

        const marker = L.marker([store.lat, store.lng], { icon: icon }).addTo(leafletMap);
        marker.bindPopup(`
            <div style="font-family: sans-serif; font-size: 13px; min-width: 180px;">
                <strong style="color: #0f172a; font-size: 14px;">${store.name}</strong><br>
                <span style="color: #64748b;">Distance: <strong>${store.dist}</strong></span><br>
                <span style="color: ${store.inRadius ? '#059669' : '#dc2626'}; font-weight: 600;">
                    ${store.inRadius ? '✓ Inside 10km Geofence' : '✕ Outside 10km Radius'}
                </span><br>
                <small style="color: #475569; display: block; margin-top: 4px;">${store.surplus || 'Hub Center'}</small>
            </div>
        `);
        storeMarkers.push(marker);
    });

    // Refresh button
    document.getElementById("btn-radar-refresh")?.addEventListener("click", () => {
        leafletMap.flyTo(center, 12);
        renderInventoryMatrix();
    });

    // Run Autonomous 10km Scan Button
    document.getElementById("btn-radar-scan")?.addEventListener("click", runAutonomous10kmScan);
}

function runAutonomous10kmScan() {
    const overlay = document.getElementById("map-scan-overlay");
    if (overlay) overlay.style.display = "flex";

    // Simulate scanning network
    setTimeout(() => {
        if (overlay) overlay.style.display = "none";

        // Find shortage item
        const shortage = inventoryMatrix.find(i => i.qty <= i.reorder);
        const drawer = document.getElementById("transfer-alert-drawer");
        const drawerText = document.getElementById("transfer-drawer-text");

        if (drawer && drawerText) {
            const donorStore = STORES[1]; // Paharganj (~1.8km)
            const itemToTransfer = shortage ? shortage.name : "Crispy Veg Patty";
            drawerText.textContent = `${donorStore.name} (${donorStore.dist}) has 40 ${shortage?.unit || 'pcs'} surplus ${itemToTransfer} expiring in 3 days. FEFO dispatch recommended!`;
            drawer.style.display = "block";
        }
    }, 1400);
}

// Accept Transfer
document.getElementById("btn-drawer-accept")?.addEventListener("click", () => {
    // Restock low items
    const vegPatty = inventoryMatrix.find(i => i.name === "Crispy Veg Patty");
    const potatoes = inventoryMatrix.find(i => i.name === "Russet Potatoes");
    if (vegPatty) vegPatty.qty += 25;
    if (potatoes) potatoes.qty += 15;

    renderInventoryMatrix();

    // Update ESG Analytics
    esgMetrics.foodWasteKg += 4.5;
    esgMetrics.costSavedInr += 320;
    esgMetrics.transfersCompleted += 1;
    updateEsgMetricsDisplay();

    // Dismiss drawer
    document.getElementById("transfer-alert-drawer").style.display = "none";
});

document.getElementById("btn-drawer-dismiss")?.addEventListener("click", () => {
    document.getElementById("transfer-alert-drawer").style.display = "none";
});

function checkShortagesAndNotify() {
    const shortage = inventoryMatrix.find(i => i.qty <= i.reorder);
    if (shortage) {
        document.getElementById("radar-alert-badge").textContent = "1";
    }
}

// ====================================================
// MODULE 3: ESG ANALYTICS & COMMERCIAL WASTE TELEMETRY
// ====================================================

function initEsgAnalytics() {
    updateEsgMetricsDisplay();
    renderMaterialsChart();
    renderClusterHealth();
}

function updateEsgMetricsDisplay() {
    document.getElementById("kpi-waste-kg").textContent = esgMetrics.foodWasteKg.toFixed(1);
    document.getElementById("kpi-cost-saved").textContent = `₹${esgMetrics.costSavedInr}`;
    document.getElementById("kpi-transfers").textContent = `${esgMetrics.transfersCompleted} / ${esgMetrics.transfersTotal}`;
}

function renderMaterialsChart() {
    const canvas = document.getElementById("materialsChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (materialsChart) materialsChart.destroy();

    materialsChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Crispy Veg Patty", "Russet Potatoes", "Cheddar Cheese", "Chicken Patty", "Brioche Buns"],
            datasets: [{
                label: "Units Transferred (FEFO Saved)",
                data: [12, 9, 6, 6, 5],
                backgroundColor: [
                    "#1b4e2b",
                    "#d97706",
                    "#22c55e",
                    "#40916c",
                    "#f59e0b"
                ],
                borderRadius: 10,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "#1b4e2b",
                    titleFont: { family: "'Plus Jakarta Sans', sans-serif", weight: "700" },
                    bodyFont: { family: "'Plus Jakarta Sans', sans-serif" },
                    padding: 10,
                    cornerRadius: 10
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: "#edf2e8" },
                    ticks: {
                        font: { family: "'JetBrains Mono', monospace", size: 11 },
                        color: "#6b8f7e"
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        font: { family: "'Plus Jakarta Sans', sans-serif", weight: "600", size: 12 },
                        color: "#2d6a4f"
                    }
                }
            }
        }
    });
}

function renderClusterHealth() {
    const list = document.getElementById("cluster-health-list");
    if (!list) return;
    list.innerHTML = "";

    STORES.forEach(store => {
        const isCritical = store.isHub && inventoryMatrix.some(i => i.qty <= i.reorder);
        const badgeClass = isCritical ? "branch-health-badge--critical" : "branch-health-badge--optimal";
        const badgeText = isCritical ? "1 shortages · CRITICAL" : "9 items · OPTIMAL";

        const item = document.createElement("div");
        item.className = "cluster-branch-item";
        item.innerHTML = `
            <div class="branch-info">
                <h5>${store.name}</h5>
                <p>${store.address}</p>
            </div>
            <span class="branch-health-badge ${badgeClass}">${badgeText}</span>
        `;
        list.appendChild(item);
    });
}

// ====================================================
// GREENBASKET DISH CUSTOMIZATION & QUANTITY MODAL
// ====================================================

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

let modalState = {
    item: null,
    qty: 1,
    selectedOptions: []
};

function initHyperpureModal() {
    const backdrop = document.getElementById("hyperpure-modal");
    const closeBtn = document.getElementById("hp-close-btn");
    const stepMinus = document.getElementById("hp-step-minus");
    const stepPlus = document.getElementById("hp-step-plus");
    const presets = document.querySelectorAll(".hp-preset-pill");
    const addCartBtn = document.getElementById("btn-modal-add-cart");

    closeBtn?.addEventListener("click", () => {
        backdrop.classList.remove("active");
    });

    backdrop?.addEventListener("click", (e) => {
        if (e.target === backdrop) backdrop.classList.remove("active");
    });

    stepMinus?.addEventListener("click", () => {
        if (modalState.qty > 1) {
            modalState.qty--;
            updateModalUI();
        }
    });

    stepPlus?.addEventListener("click", () => {
        modalState.qty++;
        updateModalUI();
    });

    presets.forEach(pill => {
        pill.addEventListener("click", () => {
            const q = parseInt(pill.getAttribute("data-qty"), 10);
            modalState.qty = q;
            updateModalUI();
        });
    });

    addCartBtn?.addEventListener("click", () => {
        if (!modalState.item) return;
        addCustomizedToCart(modalState.item, modalState.qty, modalState.selectedOptions);
        backdrop.classList.remove("active");
    });
}

function openHyperpureModal(item) {
    modalState.item = item;
    modalState.qty = 1;
    modalState.selectedOptions = [];

    const backdrop = document.getElementById("hyperpure-modal");
    if (!backdrop) return;

    // Header & Summary info
    document.getElementById("hp-modal-head-title").textContent = `Customize ${item.name}`;
    document.getElementById("hp-modal-title").textContent = item.name;
    document.getElementById("hp-modal-price").textContent = `₹${item.price}`;
    document.getElementById("hp-modal-veg").textContent = item.isVeg ? "🟢 100% Veg" : "🔴 Non-Veg";
    document.getElementById("hp-modal-veg").style.color = item.isVeg ? "#15803d" : "#b91c1c";
    document.getElementById("hp-modal-rating").textContent = `★ ${item.rating || "4.8"}`;

    const emojiMap = {
        Burgers: "🍔",
        Sides: "🍟",
        Beverages: "🥤",
        Combos: "🍱"
    };
    document.getElementById("hp-modal-img").textContent = emojiMap[item.category] || "🍽️";

    // Build options list
    const optionsGroups = ITEM_CUSTOMIZATIONS[item.category] || [];
    const container = document.getElementById("hp-options-container");
    container.innerHTML = "";

    // Set defaults
    optionsGroups.forEach(group => {
        if (group.type === "single") {
            const defOpt = group.options.find(o => o.default) || group.options[0];
            if (defOpt) modalState.selectedOptions.push(defOpt);
        }
    });

    // Render options DOM
    optionsGroups.forEach((group, gIdx) => {
        const groupEl = document.createElement("div");
        groupEl.className = "hp-option-group";
        groupEl.innerHTML = `
            <div class="hp-option-group-title">
                <span>${group.title}</span>
                <span class="hp-option-group-hint">${group.hint}</span>
            </div>
            <div class="hp-option-choices" data-group-index="${gIdx}">
                ${group.options.map(opt => {
                    const isSelected = modalState.selectedOptions.some(o => o.id === opt.id);
                    const indicator = group.type === "single" 
                        ? `<span class="hp-custom-radio"></span>` 
                        : `<span class="hp-custom-check">✓</span>`;
                    const priceTag = opt.price > 0 ? `<span class="hp-choice-price">+₹${opt.price}</span>` : "";

                    return `
                        <div class="hp-choice-item ${isSelected ? "selected" : ""}" data-opt-id="${opt.id}">
                            <div class="hp-choice-left">
                                ${indicator}
                                <span>${opt.label}</span>
                            </div>
                            ${priceTag}
                        </div>
                    `;
                }).join("")}
            </div>
        `;

        // Click handlers on choices
        groupEl.querySelectorAll(".hp-choice-item").forEach(choiceEl => {
            choiceEl.addEventListener("click", () => {
                const optId = choiceEl.getAttribute("data-opt-id");
                const opt = group.options.find(o => o.id === optId);
                if (!opt) return;

                if (group.type === "single") {
                    // Remove other options in this group
                    group.options.forEach(o => {
                        modalState.selectedOptions = modalState.selectedOptions.filter(so => so.id !== o.id);
                    });
                    modalState.selectedOptions.push(opt);
                    groupEl.querySelectorAll(".hp-choice-item").forEach(c => c.classList.remove("selected"));
                    choiceEl.classList.add("selected");
                } else {
                    // Toggle multi-select
                    const exists = modalState.selectedOptions.some(so => so.id === opt.id);
                    if (exists) {
                        modalState.selectedOptions = modalState.selectedOptions.filter(so => so.id !== opt.id);
                        choiceEl.classList.remove("selected");
                    } else {
                        modalState.selectedOptions.push(opt);
                        choiceEl.classList.add("selected");
                    }
                }

                updateModalUI();
            });
        });

        container.appendChild(groupEl);
    });

    updateModalUI();
    backdrop.classList.add("active");
}

function updateModalUI() {
    if (!modalState.item) return;

    // Update stepper & preset pills
    document.getElementById("hp-modal-qty-val").textContent = modalState.qty;
    document.querySelectorAll(".hp-preset-pill").forEach(pill => {
        const q = parseInt(pill.getAttribute("data-qty"), 10);
        pill.classList.toggle("active", q === modalState.qty);
    });

    // Compute total price
    let optionExtra = 0;
    modalState.selectedOptions.forEach(opt => {
        if (opt.price) optionExtra += opt.price;
    });
    const unitPrice = modalState.item.price + optionExtra;
    const totalPrice = unitPrice * modalState.qty;

    document.getElementById("hp-modal-total-price").textContent = `₹${totalPrice}`;
    document.getElementById("btn-modal-add-label").textContent = `Add ${modalState.qty} to Order`;

    // Compute BOM preview text
    const baseBomSummary = modalState.item.bom.map(b => `${(b.qty * modalState.qty).toFixed(2)}${b.unit} ${b.name}`);
    const addonBom = [];
    modalState.selectedOptions.forEach(opt => {
        if (opt.bomAdd) {
            addonBom.push(`${(opt.bomAdd.qty * modalState.qty).toFixed(2)}${opt.bomAdd.unit} ${opt.bomAdd.name}`);
        }
    });

    const allDeductions = [...baseBomSummary, ...addonBom];
    document.getElementById("hp-modal-bom-text").textContent = allDeductions.join(" · ");
}
