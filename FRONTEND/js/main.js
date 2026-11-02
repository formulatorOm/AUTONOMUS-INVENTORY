/**
 * MAIN ENTRY POINT & APP ORCHESTRATOR
 * Bootstraps user profile, navigation, store switcher, and initializes all modules.
 */

// ── 1. USER PROFILE FROM LOCALSTORAGE ──
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

// ── 2. TAB NAVIGATION ──
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

// ── 3. STORE SWITCHER DROPDOWN ──
function initStoreSwitcher() {
    const select = document.getElementById("store-switcher");
    if (!select) return;

    select.addEventListener("change", (e) => {
        currentStoreIdx = parseInt(e.target.value, 10);
        const store = STORES[currentStoreIdx];

        // Switch to the selected branch's local inventory matrix
        inventoryMatrix = STORE_INVENTORIES[currentStoreIdx];

        // Update branch header displays
        document.getElementById("pos-store-display").textContent = store.name;
        document.getElementById("pos-address-display").textContent = store.address;
        document.getElementById("pos-coords-display").textContent = `${store.lat.toFixed(4)}°N, ${store.lng.toFixed(4)}°E`;
        
        document.getElementById("radar-store-display").textContent = store.name;
        document.getElementById("radar-address-display").textContent = `${store.address} · ${store.lat.toFixed(4)}°N, ${store.lng.toFixed(4)}°E`;
        document.getElementById("map-radius-sub").textContent = `Radius perimeter centered on ${store.name}`;

        // Re-center Leaflet map to selected store
        if (leafletMap && geofenceCircle) {
            leafletMap.flyTo([store.lat, store.lng], 12, { duration: 1.2 });
            geofenceCircle.setLatLng([store.lat, store.lng]);
        }

        // Re-render Micro-Inventory Matrix for the selected branch
        renderInventoryMatrix();

        // Re-render Redistribution Ping Center relative to selected store
        renderPingCenter();

        // Update Radar alert badge for current branch's shortages
        const currentShortages = inventoryMatrix.filter(i => i.qty <= i.reorder).length;
        document.getElementById("radar-alert-badge").textContent = currentShortages;

        // Update ESG Sustainability Cluster Health
        renderClusterHealth();
    });
}

// ── 4. APP BOOTSTRAP ORCHESTRATOR ──
document.addEventListener("DOMContentLoaded", () => {
    initUserProfile();
    initTabNavigation();
    initStoreSwitcher();
    initCategoryFilters();
    renderMenuCatalog("all");
    renderInventoryMatrix();
    initRadarMap();
    renderPingCenter();
    initEsgAnalytics();
    initCustomizationModal();
    initCheckout();
});
