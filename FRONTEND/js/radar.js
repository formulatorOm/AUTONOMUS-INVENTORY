/**
 * 10KM GEOSPATIAL RADAR & MAP MODULE
 * Initializes Leaflet map, renders 10km geofencing circle, and manages store markers.
 */

let leafletMap = null;
let geofenceCircle = null;
let storeMarkers = [];

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

    // OpenStreetMap tile layer (Free, no API key required)
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

    // Refresh Map Button
    document.getElementById("btn-radar-refresh")?.addEventListener("click", () => {
        const store = STORES[currentStoreIdx];
        leafletMap.flyTo([store.lat, store.lng], 12);
        renderInventoryMatrix();
    });

    // Run Autonomous 10km Scan Button
    document.getElementById("btn-radar-scan")?.addEventListener("click", runAutonomous10kmScan);

    // Radar Drawer Action Listeners
    document.getElementById("btn-drawer-accept")?.addEventListener("click", () => {
        const vegPatty = inventoryMatrix.find(i => i.name === "Crispy Veg Patty");
        const potatoes = inventoryMatrix.find(i => i.name === "Russet Potatoes");
        if (vegPatty) vegPatty.qty += 25;
        if (potatoes) potatoes.qty += 15;

        renderInventoryMatrix();
        renderClusterHealth();

        esgMetrics.foodWasteKg += 4.5;
        esgMetrics.costSavedInr += 320;
        esgMetrics.transfersCompleted += 1;
        updateEsgMetricsDisplay();

        document.getElementById("transfer-alert-drawer").style.display = "none";
    });

    document.getElementById("btn-drawer-dismiss")?.addEventListener("click", () => {
        document.getElementById("transfer-alert-drawer").style.display = "none";
    });
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
