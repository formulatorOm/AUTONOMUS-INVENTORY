/**
 * MICRO-INVENTORY & REDISTRIBUTION PING MODULE
 * Renders local stock matrix, manages incoming/outgoing transfer pings, and handles alert modals.
 */

// ── 1. RENDER MICRO-INVENTORY MATRIX ──
function renderInventoryMatrix() {
    const container = document.getElementById("matrix-items-container");
    if (!container) return;
    container.innerHTML = "";

    let shortagesCount = 0;

    inventoryMatrix.forEach(item => {
        const isReorder = item.qty <= item.reorder;
        if (isReorder) shortagesCount++;

        const pct = Math.min(100, Math.round((item.qty / item.max) * 100));
        const statusClass = isReorder ? "matrix-status-pill--reorder" : "matrix-status-pill--optimal";
        const statusText = isReorder ? "Reorder Zone" : "Optimal";
        const fillClass = isReorder ? "matrix-bar-fill--danger" : "matrix-bar-fill--green";

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
    const badgeEl = document.getElementById("radar-alert-badge");
    const kpiEl = document.getElementById("kpi-shortages");
    if (badgeEl) badgeEl.textContent = shortagesCount;
    if (kpiEl) kpiEl.textContent = shortagesCount;
}

// ── 2. AUTONOMOUS REDISTRIBUTION PING CENTER ──
function renderPingCenter() {
    const incomingList = document.getElementById("ping-incoming-list");
    const outgoingList = document.getElementById("ping-outgoing-list");
    const incomingCountEl = document.getElementById("ping-incoming-count");
    const outgoingCountEl = document.getElementById("ping-outgoing-count");

    if (!incomingList || !outgoingList) return;

    // Incoming: when active store is the donor
    const incomingPings = transferPings.filter(p => p.from_store_id === currentStoreIdx && p.status === "PENDING");

    // Outgoing: when active store is the recipient
    const outgoingPings = transferPings.filter(p => p.to_store_id === currentStoreIdx && p.status === "PENDING");

    if (incomingCountEl) incomingCountEl.textContent = `${incomingPings.length} Incoming`;
    if (outgoingCountEl) outgoingCountEl.textContent = `${outgoingPings.length} Outgoing`;

    // 1. Render Incoming Pings
    if (incomingPings.length === 0) {
        incomingList.innerHTML = `
            <div class="ping-empty-state">
                No active incoming pings. Store is not currently designated as a donor.
            </div>
        `;
    } else {
        incomingList.innerHTML = incomingPings.map(ping => {
            const recipientStore = STORES[ping.to_store_id] || { name: "Branch Node" };
            return `
                <div class="ping-card ping-card--incoming" data-ping-id="${ping.id}">
                    <div class="ping-item-top">
                        <div>
                            <span class="ping-tag-badge ping-tag-badge--critical">CRITICAL SHORTAGE</span>
                            <h5 class="ping-item-title">${recipientStore.name}</h5>
                            <span class="ping-item-dist">Distance: ${ping.distance_km || 2.5} km (&lt; 10km geofence)</span>
                        </div>
                        <div class="ping-item-qty">
                            <span class="ping-qty-val ping-qty-val--crimson">${ping.quantity} ${ping.unit}</span>
                            <span class="ping-qty-name">${ping.ingredient}</span>
                        </div>
                    </div>
                    <div class="ping-item-actions">
                        <button type="button" class="btn-dispatch-accept" onclick="acceptTransferPingById('${ping.id}')">
                            ✓ Accept & Dispatch Stock
                        </button>
                        <button type="button" class="btn-dispatch-decline" onclick="rejectTransferPingById('${ping.id}')">
                            ✕ Decline
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    }

    // 2. Render Outgoing Pings
    if (outgoingPings.length === 0) {
        outgoingList.innerHTML = `
            <div class="ping-empty-state">
                No active outgoing pings. Store inventory is operating above threshold.
            </div>
        `;
    } else {
        outgoingList.innerHTML = outgoingPings.map(ping => {
            const donorStore = STORES[ping.from_store_id] || { name: "Cluster Store" };
            return `
                <div class="ping-card ping-card--outgoing" data-ping-id="${ping.id}">
                    <div class="ping-item-top">
                        <div>
                            <span class="ping-tag-badge ping-tag-badge--dispatched">DISPATCHED PING</span>
                            <h5 class="ping-item-title">Donor: ${donorStore.name}</h5>
                            <span class="ping-item-dist">Distance: ${ping.distance_km || 2.5} km</span>
                        </div>
                        <div class="ping-item-qty">
                            <span class="ping-qty-val ping-qty-val--green">+${ping.quantity} ${ping.unit}</span>
                            <span class="ping-qty-name">${ping.ingredient}</span>
                        </div>
                    </div>
                    <div class="ping-item-footer">
                        <span class="ping-await-text">⏱ Awaiting partner branch dispatch</span>
                        <button type="button" class="btn-restock-received" onclick="acceptTransferPingById('${ping.id}')">
                            Mark Received ✓
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    }
}

// ── 3. ACCEPT / DECLINE TRANSFER PINGS ──
function acceptTransferPingById(pingId) {
    const ping = transferPings.find(p => p.id === pingId);
    if (!ping) return;

    if (typeof confetti === "function") {
        confetti({ particleCount: 55, spread: 65, origin: { y: 0.8 } });
    }

    ping.status = "COMPLETED";

    // Deduct stock from donor branch inventory
    const donorInv = STORE_INVENTORIES[ping.from_store_id];
    if (donorInv) {
        const donorMatch = donorInv.find(i => i.name === ping.ingredient);
        if (donorMatch) {
            donorMatch.qty = Math.max(0, Math.round((donorMatch.qty - ping.quantity) * 10) / 10);
        }
    }

    // Replenish stock at recipient branch inventory
    const recipInv = STORE_INVENTORIES[ping.to_store_id];
    if (recipInv) {
        const recipMatch = recipInv.find(i => i.name === ping.ingredient);
        if (recipMatch) {
            recipMatch.qty = Math.round((recipMatch.qty + ping.quantity) * 10) / 10;
            recipMatch.expiry = "6 days remaining (FEFO Rebalanced)";
        }
    }

    // Keep active inventory reference in sync
    inventoryMatrix = STORE_INVENTORIES[currentStoreIdx];

    // Update ESG Sustainability Metrics
    esgMetrics.foodWasteKg = parseFloat((esgMetrics.foodWasteKg + 4.5).toFixed(1));
    esgMetrics.costSavedInr += 320;
    esgMetrics.transfersCompleted += 1;
    esgMetrics.activeShortages = Math.max(0, inventoryMatrix.filter(i => i.qty <= i.reorder).length);

    renderInventoryMatrix();
    renderPingCenter();
    renderClusterHealth();
    updateEsgMetricsDisplay();

    const emergencyModal = document.getElementById("emergency-ping-alert");
    if (emergencyModal) emergencyModal.style.display = "none";
}

function rejectTransferPingById(pingId) {
    const ping = transferPings.find(p => p.id === pingId);
    if (!ping) return;
    ping.status = "REJECTED";
    renderPingCenter();
}

function checkShortagesAndNotify() {
    const shortage = inventoryMatrix.find(i => i.qty <= i.reorder);
    const badgeEl = document.getElementById("radar-alert-badge");
    if (shortage && badgeEl) {
        badgeEl.textContent = "1";
    }
}

// ── 4. EMERGENCY PING ALERT MODAL LISTENERS ──
document.addEventListener("DOMContentLoaded", () => {
    // Accept Emergency Ping Alert
    document.getElementById("btn-ping-accept")?.addEventListener("click", () => {
        if (!pendingPingData) return;
        acceptTransferPingById(pendingPingData.id);
        pendingPingData = null;
    });

    // Dismiss Emergency Ping Alert
    document.getElementById("btn-ping-dismiss")?.addEventListener("click", () => {
        document.getElementById("emergency-ping-alert").style.display = "none";
    });

    document.getElementById("btn-ping-ignore")?.addEventListener("click", () => {
        document.getElementById("emergency-ping-alert").style.display = "none";
    });
});
