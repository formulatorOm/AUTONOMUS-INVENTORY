/**
 * ESG & COMMERCIAL FOOD WASTE ANALYTICS MODULE
 * Manages sustainability KPIs, Chart.js rebalanced ingredients graph, and cluster health.
 */

let materialsChart = null;

function initEsgAnalytics() {
    updateEsgMetricsDisplay();
    renderMaterialsChart();
    renderClusterHealth();
}

function updateEsgMetricsDisplay() {
    const wasteEl = document.getElementById("kpi-waste-kg");
    const costEl = document.getElementById("kpi-cost-saved");
    const transfersEl = document.getElementById("kpi-transfers");

    if (wasteEl) wasteEl.textContent = esgMetrics.foodWasteKg.toFixed(1);
    if (costEl) costEl.textContent = `₹${esgMetrics.costSavedInr}`;
    if (transfersEl) transfersEl.textContent = `${esgMetrics.transfersCompleted} / ${esgMetrics.transfersTotal}`;
}

function renderMaterialsChart() {
    const canvas = document.getElementById("materialsChart");
    if (!canvas || typeof Chart === "undefined") return;

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
        const storeInv = STORE_INVENTORIES[store.id] || [];
        const shortages = storeInv.filter(i => i.qty <= i.reorder);
        
        let badgeClass = "branch-health-badge--optimal";
        let badgeText = `${storeInv.length} items · OPTIMAL`;

        if (!store.inRadius) {
            badgeClass = "branch-health-badge--outside";
            badgeText = "OUT OF 10KM RADAR";
        } else if (shortages.length > 0) {
            badgeClass = "branch-health-badge--critical";
            badgeText = `${shortages.length} shortage${shortages.length > 1 ? "s" : ""} · CRITICAL`;
        } else if (store.surplus && (store.surplus.includes("pcs") || store.surplus.includes("kg"))) {
            badgeClass = "branch-health-badge--surplus";
            badgeText = "FEFO SURPLUS DONOR";
        }

        const isCurrentActive = store.id === currentStoreIdx;
        const item = document.createElement("div");
        item.className = `cluster-branch-item ${isCurrentActive ? "cluster-branch-item--active" : ""}`;
        item.innerHTML = `
            <div class="branch-info">
                <h5>${store.name} ${isCurrentActive ? '<span class="active-store-pill">ACTIVE</span>' : ''}</h5>
                <p>${store.address}</p>
            </div>
            <span class="branch-health-badge ${badgeClass}">${badgeText}</span>
        `;
        list.appendChild(item);
    });
}
