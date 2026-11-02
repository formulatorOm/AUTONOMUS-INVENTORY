/**
 * POS TERMINAL & INVENTORY MICRO-DEDUCTION MODULE
 * Handles dish catalog, multi-item cart, steppers, customizations, and checkout deduction.
 */

// ── 1. CATEGORY FILTERS ──
function initCategoryFilters() {
    const chips = document.querySelectorAll(".pos-cat-chip");
    chips.forEach(chip => {
        chip.addEventListener("click", () => {
            chips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            activeCategory = chip.getAttribute("data-cat");
            renderMenuCatalog(activeCategory);
        });
    });
}

// ── 2. MENU CATALOG & DIRECT CARD STEPPERS ──
function renderMenuCatalog(category = "all") {
    const grid = document.getElementById("pos-catalog-grid");
    if (!grid) return;

    const filtered = category === "all" 
        ? MENU_ITEMS 
        : MENU_ITEMS.filter(m => m.category.toLowerCase() === category.toLowerCase());

    grid.innerHTML = filtered.map(item => {
        // Count total quantity of this dish in cart (base + customized variants)
        let totalDishInCart = 0;
        Object.values(cart).forEach(entry => {
            if (entry.id === item.id) totalDishInCart += entry.qty;
        });

        // BOM recipe breakdown preview
        const bomTags = item.bom.map(b => 
            `<span class="bom-tag">${b.name} (${b.qty}${b.unit})</span>`
        ).join("");

        const vegIcon = item.isVeg 
            ? `<span class="dish-badge-pill dish-badge-pill--veg">● 100% Veg</span>` 
            : `<span class="dish-badge-pill dish-badge-pill--nonveg">● Non-Veg</span>`;

        // Action controls: Direct Stepper if in cart, or "+ Add to Cart"
        const actionControl = totalDishInCart > 0 ? `
            <div class="dish-btn-group">
                <div class="dish-card-stepper">
                    <button type="button" class="btn-card-step" onclick="updateItemBaseQty('${item.id}', -1)" aria-label="Decrease quantity">−</button>
                    <span class="card-step-val">${totalDishInCart} in Cart</span>
                    <button type="button" class="btn-card-step" onclick="updateItemBaseQty('${item.id}', 1)" aria-label="Increase quantity">+</button>
                </div>
                <button type="button" class="btn-customize-dish" onclick="openCustomizationModalById('${item.id}')" title="Customize extras & portions">
                    Options ⚙
                </button>
            </div>
        ` : `
            <div class="dish-btn-group">
                <button type="button" class="btn-add-dish" onclick="addToCart('${item.id}', 1)">
                    + Add to Cart
                </button>
                <button type="button" class="btn-customize-dish" onclick="openCustomizationModalById('${item.id}')" title="Customize extras & portions">
                    Options ⚙
                </button>
            </div>
        `;

        return `
            <div class="pos-dish-card" data-dish-id="${item.id}">
                <div class="dish-image-wrapper">
                    <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80';">
                    <div class="dish-overlay-badges">
                        ${vegIcon}
                        <span class="dish-badge-pill dish-badge-pill--custom">${item.badge}</span>
                    </div>
                </div>
                <div class="dish-body">
                    <div class="dish-meta">
                        <span class="dish-category">${item.category.toUpperCase()}</span>
                        <span class="dish-rating">★ ${item.rating}</span>
                    </div>
                    <h4 class="dish-title">${item.name}</h4>
                    <div class="dish-bom-box">
                        <span class="bom-label">🌱 BOM Farm Micro-Deduction:</span>
                        <div class="bom-tags-cloud">${bomTags}</div>
                    </div>
                    <div class="dish-footer">
                        <div class="dish-price">₹${item.price}</div>
                        ${actionControl}
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// ── 3. CART OPERATIONS ──
function addToCart(itemId, qty = 1) {
    const item = MENU_ITEMS.find(m => m.id === itemId);
    if (!item) return;

    const cartKey = item.id;
    if (!cart[cartKey]) {
        cart[cartKey] = {
            key: cartKey,
            id: item.id,
            qty: 0,
            unitPrice: item.price,
            optionsText: "Standard Kitchen Prep",
            bomAddons: []
        };
    }
    cart[cartKey].qty += qty;
    if (cart[cartKey].qty <= 0) delete cart[cartKey];

    renderCart();
    renderMenuCatalog(activeCategory);
}

function updateItemBaseQty(itemId, delta) {
    // Finds first matching cart entry for this item
    const matchingKey = Object.keys(cart).find(k => cart[k].id === itemId) || itemId;
    if (!cart[matchingKey] && delta > 0) {
        addToCart(itemId, delta);
        return;
    }
    updateCartQty(matchingKey, delta);
}

function updateCartQty(key, delta) {
    if (cart[key]) {
        cart[key].qty += delta;
        if (cart[key].qty <= 0) delete cart[key];
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
            optionsText: labels.length ? labels.join(" · ") : "Custom Kitchen Prep",
            bomAddons: bomAddons
        };
    }
    cart[cartKey].qty += qty;

    renderCart();
    renderMenuCatalog(activeCategory);
}

// ── 4. RENDER CUSTOMER CART & BOM BREAKDOWN ──
function renderCart() {
    const container = document.getElementById("cart-items-container");
    const subtotalEl = document.getElementById("cart-subtotal");
    const gstEl = document.getElementById("cart-gst");
    const grandTotalEl = document.getElementById("cart-grand-total");
    const deductionsBox = document.getElementById("cart-deductions-list");

    if (!container) return;

    const cartEntries = Object.values(cart);

    if (cartEntries.length === 0) {
        container.innerHTML = `
            <div class="cart-empty-state">
                <span class="empty-cart-icon">🛒</span>
                <p>Your order is empty</p>
                <small>Select burgers, fries, or chilled drinks to begin</small>
            </div>
        `;
        if (subtotalEl) subtotalEl.textContent = "₹0";
        if (gstEl) gstEl.textContent = "₹0";
        if (grandTotalEl) grandTotalEl.textContent = "₹0";
        if (deductionsBox) deductionsBox.innerHTML = `<em>Add items to preview recipe raw material deductions</em>`;
        return;
    }

    let subtotal = 0;
    const bomTotals = {}; // Cumulative raw ingredients deducted

    container.innerHTML = cartEntries.map(entry => {
        const item = MENU_ITEMS.find(m => m.id === entry.id);
        if (!item) return "";

        const lineTotal = entry.unitPrice * entry.qty;
        subtotal += lineTotal;

        // Calculate base BOM
        item.bom.forEach(b => {
            const totalQty = b.qty * entry.qty;
            if (!bomTotals[b.name]) bomTotals[b.name] = { qty: 0, unit: b.unit };
            bomTotals[b.name].qty += totalQty;
        });

        // Calculate addon BOM
        if (entry.bomAddons) {
            entry.bomAddons.forEach(b => {
                const totalQty = b.qty * entry.qty;
                if (!bomTotals[b.name]) bomTotals[b.name] = { qty: 0, unit: b.unit };
                bomTotals[b.name].qty += totalQty;
            });
        }

        return `
            <div class="cart-item-row">
                <img src="${item.image}" alt="${item.name}" class="cart-item-thumb" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80';">
                <div class="cart-item-info">
                    <h6>${item.name}</h6>
                    <small class="cart-item-custom">${entry.optionsText}</small>
                    <span class="cart-item-rate">₹${entry.unitPrice} × ${entry.qty} = ₹${lineTotal}</span>
                </div>
                <div class="cart-stepper">
                    <button type="button" class="btn-step" onclick="updateCartQty('${entry.key}', -1)">−</button>
                    <span class="cart-qty">${entry.qty}</span>
                    <button type="button" class="btn-step" onclick="updateCartQty('${entry.key}', 1)">+</button>
                </div>
            </div>
        `;
    }).join("");

    const gst = Math.round(subtotal * 0.05);
    const grandTotal = subtotal + gst;

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
    if (gstEl) gstEl.textContent = `₹${gst}`;
    if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal}`;

    // Display BOM Micro-Deduction Telemetry
    if (deductionsBox) {
        deductionsBox.innerHTML = Object.entries(bomTotals).map(([name, data]) => `
            <div class="deduction-row">
                <span class="deduct-name">• ${name}:</span>
                <span class="deduct-qty">-${data.qty.toFixed(2)}${data.unit}</span>
            </div>
        `).join("");
    }
}

// ── 5. DISH CUSTOMIZATION MODAL ──
let modalState = {
    item: null,
    qty: 1,
    selectedOptions: []
};

function initCustomizationModal() {
    const backdrop = document.getElementById("hyperpure-modal");
    const closeBtn = document.getElementById("hp-close-btn");
    const stepMinus = document.getElementById("hp-step-minus");
    const stepPlus = document.getElementById("hp-step-plus");
    const presets = document.querySelectorAll(".hp-preset-pill");
    const addCartBtn = document.getElementById("btn-modal-add-cart");

    closeBtn?.addEventListener("click", () => backdrop.classList.remove("active"));
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
            modalState.qty = parseInt(pill.getAttribute("data-qty"), 10);
            updateModalUI();
        });
    });

    addCartBtn?.addEventListener("click", () => {
        if (!modalState.item) return;
        addCustomizedToCart(modalState.item, modalState.qty, modalState.selectedOptions);
        backdrop.classList.remove("active");
    });
}

function openCustomizationModalById(itemId) {
    const item = MENU_ITEMS.find(m => m.id === itemId);
    if (item) openCustomizationModal(item);
}

function openCustomizationModal(item) {
    modalState.item = item;
    modalState.qty = 1;
    modalState.selectedOptions = [];

    const backdrop = document.getElementById("hyperpure-modal");
    if (!backdrop) return;

    document.getElementById("hp-modal-head-title").textContent = `Customize ${item.name}`;
    document.getElementById("hp-modal-title").textContent = item.name;
    document.getElementById("hp-modal-price").textContent = `₹${item.price}`;
    document.getElementById("hp-modal-veg").textContent = item.isVeg ? "🟢 100% Veg" : "🔴 Non-Veg";
    document.getElementById("hp-modal-veg").style.color = item.isVeg ? "#15803d" : "#b91c1c";
    document.getElementById("hp-modal-rating").textContent = `★ ${item.rating || "4.8"}`;

    const emojiMap = { Burgers: "🍔", Sides: "🍟", Beverages: "🥤", Combos: "🍱" };
    document.getElementById("hp-modal-img").textContent = emojiMap[item.category] || "🍽️";

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

        groupEl.querySelectorAll(".hp-choice-item").forEach(choiceEl => {
            choiceEl.addEventListener("click", () => {
                const optId = choiceEl.getAttribute("data-opt-id");
                const opt = group.options.find(o => o.id === optId);
                if (!opt) return;

                if (group.type === "single") {
                    group.options.forEach(o => {
                        modalState.selectedOptions = modalState.selectedOptions.filter(so => so.id !== o.id);
                    });
                    modalState.selectedOptions.push(opt);
                    groupEl.querySelectorAll(".hp-choice-item").forEach(c => c.classList.remove("selected"));
                    choiceEl.classList.add("selected");
                } else {
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

    document.getElementById("hp-modal-qty-val").textContent = modalState.qty;
    document.querySelectorAll(".hp-preset-pill").forEach(pill => {
        const q = parseInt(pill.getAttribute("data-qty"), 10);
        pill.classList.toggle("active", q === modalState.qty);
    });

    let optionExtra = 0;
    modalState.selectedOptions.forEach(opt => {
        if (opt.price) optionExtra += opt.price;
    });
    const unitPrice = modalState.item.price + optionExtra;
    const totalPrice = unitPrice * modalState.qty;

    document.getElementById("hp-modal-total-price").textContent = `₹${totalPrice}`;
    document.getElementById("btn-modal-add-label").textContent = `Add ${modalState.qty} to Order`;

    const baseBomSummary = modalState.item.bom.map(b => `${(b.qty * modalState.qty).toFixed(2)}${b.unit} ${b.name}`);
    const addonBom = [];
    modalState.selectedOptions.forEach(opt => {
        if (opt.bomAdd) {
            addonBom.push(`${(opt.bomAdd.qty * modalState.qty).toFixed(2)}${opt.bomAdd.unit} ${opt.bomAdd.name}`);
        }
    });

    document.getElementById("hp-modal-bom-text").textContent = [...baseBomSummary, ...addonBom].join(" · ");
}

// ── 6. ATOMIC CHECKOUT & INVENTORY DEDUCTION ──
function initCheckout() {
    const checkoutBtn = document.getElementById("btn-checkout");
    const clearBtn = document.getElementById("btn-clear-cart");
    const receiptCloseBtn = document.getElementById("btn-receipt-close");

    clearBtn?.addEventListener("click", () => {
        cart = {};
        renderCart();
        renderMenuCatalog(activeCategory);
    });

    receiptCloseBtn?.addEventListener("click", () => {
        document.getElementById("receipt-modal").style.display = "none";
    });

    checkoutBtn?.addEventListener("click", () => {
        const cartEntries = Object.values(cart);
        if (cartEntries.length === 0) {
            alert("Cart is empty! Add items to place an order.");
            return;
        }

        const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
        let orderSubtotal = 0;
        const deductionsSummary = [];
        const criticalShortages = [];

        // 1. Atomically deduct BOM ingredients from active branch inventory
        cartEntries.forEach(entry => {
            const item = MENU_ITEMS.find(m => m.id === entry.id);
            if (!item) return;

            const count = entry.qty;
            orderSubtotal += entry.unitPrice * count;

            // Deduct base BOM
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
                            deducted: deductAmt,
                            remaining: match.qty,
                            unit: match.unit
                        });
                    }

                    if (match.qty <= match.reorder && !criticalShortages.some(c => c.name === match.name)) {
                        criticalShortages.push(match);
                    }
                }
            });

            // Deduct addon BOM
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
                                deducted: deductAmt,
                                remaining: match.qty,
                                unit: match.unit
                            });
                        }

                        if (match.qty <= match.reorder && !criticalShortages.some(c => c.name === match.name)) {
                            criticalShortages.push(match);
                        }
                    }
                });
            }
        });

        const grandTotal = orderSubtotal + Math.round(orderSubtotal * 0.05);

        // 2. Confetti effect
        if (typeof confetti === "function") {
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
        }

        // 3. Clear cart and refresh views
        cart = {};
        renderCart();
        renderMenuCatalog(activeCategory);
        renderInventoryMatrix();
        checkShortagesAndNotify();

        // 4. Show Order Success Receipt Modal
        const receiptModal = document.getElementById("receipt-modal");
        document.getElementById("receipt-order-id").textContent = `Receipt: ${orderId} · ${STORES[currentStoreIdx].name}`;
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

        // 5. Trigger 10km Geospatial Redistribution Ping Modal if shortage reached
        if (criticalShortages.length > 0) {
            const shortage = criticalShortages[0];
            const pingId = "ping-" + Date.now();
            
            // Find best donor branch within 10km with maximum available surplus
            let bestDonorId = 1;
            let maxDonorQty = -1;

            STORES.forEach(s => {
                if (s.id !== currentStoreIdx && s.inRadius) {
                    const sInv = STORE_INVENTORIES[s.id] || [];
                    const itemMatch = sInv.find(i => i.name === shortage.name);
                    if (itemMatch && itemMatch.qty > itemMatch.reorder && itemMatch.qty > maxDonorQty) {
                        maxDonorQty = itemMatch.qty;
                        bestDonorId = s.id;
                    }
                }
            });

            const donorStore = STORES[bestDonorId];
            const transferQty = shortage.unit === "kg" ? 5 : 8;

            const newPing = {
                id: pingId,
                from_store_id: donorStore.id,
                to_store_id: currentStoreIdx,
                ingredient: shortage.name,
                quantity: transferQty,
                unit: shortage.unit,
                distance_km: parseFloat(donorStore.dist.replace(" km", "")),
                status: "PENDING",
                created_at: new Date()
            };

            transferPings.unshift(newPing);
            renderPingCenter();

            pendingPingData = {
                id: pingId,
                ingredient: shortage.name,
                quantity: transferQty,
                unit: shortage.unit,
                fromStore: STORES[newPing.from_store_id].name,
                toStore: STORES[newPing.to_store_id].name,
                distanceKm: newPing.distance_km
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
}
