
    // Initialize map
        const map = L.map('map').setView([37.7749, -122.4194], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        let mode = 'tower';
        let towers = [];
        let links = [];
        let towerCounter = 1;
        let linkCounter = 1;
        let selectedTower = null;
        let selectedLink = null;
        let fresnelLayer = null;

        // Tower icon
        const towerIcon = L.divIcon({
            className: 'custom-tower-icon',
            html: '<div style="background: #667eea; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;"></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        // Mode switching
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                mode = btn.dataset.mode;
                selectedTower = null;
                updateInstruction();
                updateMapOverlay();
            });
        });

        // Map click handler
        map.on('click', (e) => {
            if (mode === 'tower') {
                addTower(e.latlng);
            } else if (mode === 'link') {
                selectTowerForLink(e.latlng);
            }
        });

        function addTower(latlng) {
            const tower = {
                id: towerCounter++,
                name: `Tower ${towers.length + 1}`,
                lat: latlng.lat,
                lng: latlng.lng,
                frequency: 5,
                unit: 'GHz',
                marker: null
            };

            const marker = L.marker([latlng.lat, latlng.lng], { icon: towerIcon })
                .addTo(map)
                .bindPopup(`<strong>${tower.name}</strong><br>Frequency: ${tower.frequency} ${tower.unit}`);

            marker.on('click', (e) => {
                L.DomEvent.stopPropagation(e);
                if (mode === 'link') {
                    handleTowerClickForLink(tower);
                }
            });

            tower.marker = marker;
            towers.push(tower);
            updateTowerList();
            updateMapOverlay();
        }

        function handleTowerClickForLink(tower) {
            if (!selectedTower) {
                selectedTower = tower;
                updateInstruction();
                updateMapOverlay();
                highlightTower(tower);
            } else if (selectedTower.id !== tower.id) {
                createLink(selectedTower, tower);
                selectedTower = null;
                updateInstruction();
                updateMapOverlay();
                clearTowerHighlight();
            }
        }

        function selectTowerForLink(latlng) {
            // This is for clicking on empty space - do nothing in link mode
        }

        function highlightTower(tower) {
            if (tower.marker) {
                const iconHtml = tower.marker.getElement();
                if (iconHtml) {
                    const div = iconHtml.querySelector('div');
                    if (div) {
                        div.style.background = '#ff6b6b';
                        div.style.transform = 'scale(1.2)';
                    }
                }
            }
        }

        function clearTowerHighlight() {
            towers.forEach(tower => {
                if (tower.marker) {
                    const iconHtml = tower.marker.getElement();
                    if (iconHtml) {
                        const div = iconHtml.querySelector('div');
                        if (div) {
                            div.style.background = '#667eea';
                            div.style.transform = 'scale(1)';
                        }
                    }
                }
            });
        }

        function createLink(tower1, tower2) {
            // Check frequency match
            const freq1 = tower1.frequency * (tower1.unit === 'GHz' ? 1 : 0.001);
            const freq2 = tower2.frequency * (tower2.unit === 'GHz' ? 1 : 0.001);

            if (Math.abs(freq1 - freq2) > 0.001) {
                alert('Cannot create link: Frequencies do not match!');
                return;
            }

            // Check if link already exists
            const exists = links.some(link => 
                (link.tower1.id === tower1.id && link.tower2.id === tower2.id) ||
                (link.tower1.id === tower2.id && link.tower2.id === tower1.id)
            );

            if (exists) {
                alert('Link already exists between these towers!');
                return;
            }

            const distance = calculateDistance(tower1.lat, tower1.lng, tower2.lat, tower2.lng);

            const link = {
                id: linkCounter++,
                tower1: tower1,
                tower2: tower2,
                frequency: freq1,
                distance: distance,
                polyline: null,
                fresnelZone: null
            };

            const polyline = L.polyline(
                [[tower1.lat, tower1.lng], [tower2.lat, tower2.lng]], 
                { color: '#667eea', weight: 3, opacity: 0.7 }
            ).addTo(map);

            polyline.on('click', () => {
                selectLink(link);
            });

            link.polyline = polyline;
            links.push(link);
            updateLinkList();
            updateMapOverlay();
        }

        function selectLink(link) {
            if (selectedLink === link) {
                // Deselect
                selectedLink = null;
                link.polyline.setStyle({ color: '#667eea', weight: 3 });
                removeFresnelZone();
            } else {
                // Select new link
                if (selectedLink) {
                    selectedLink.polyline.setStyle({ color: '#667eea', weight: 3 });
                }
                selectedLink = link;
                link.polyline.setStyle({ color: '#ff6b6b', weight: 4 });
                showFresnelZone(link);
            }
            updateLinkList();
        }

        function calculateDistance(lat1, lng1, lat2, lng2) {
            const R = 6371000; // Earth radius in meters
            const φ1 = lat1 * Math.PI / 180;
            const φ2 = lat2 * Math.PI / 180;
            const Δφ = (lat2 - lat1) * Math.PI / 180;
            const Δλ = (lng2 - lng1) * Math.PI / 180;

            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                      Math.cos(φ1) * Math.cos(φ2) *
                      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            return R * c; // Distance in meters
        }

        function showFresnelZone(link) {
            removeFresnelZone();

            const c = 3e8; // Speed of light
            const freqHz = link.frequency * 1e9; // Convert GHz to Hz
            const wavelength = c / freqHz;

            const d = link.distance; // Total distance
            const d1 = d / 2; // Midpoint
            const d2 = d / 2;

            // Calculate Fresnel radius at midpoint
            const radius = Math.sqrt((wavelength * d1 * d2) / (d1 + d2));

            // Calculate bearing between towers
            const lat1 = link.tower1.lat * Math.PI / 180;
            const lat2 = link.tower2.lat * Math.PI / 180;
            const lng1 = link.tower1.lng * Math.PI / 180;
            const lng2 = link.tower2.lng * Math.PI / 180;

            const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
            const x = Math.cos(lat1) * Math.sin(lat2) - 
                      Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
            const bearing = Math.atan2(y, x);

            // Create ellipse points
            const numPoints = 32;
            const ellipsePoints = [];

            for (let i = 0; i <= numPoints; i++) {
                const angle = (i / numPoints) * 2 * Math.PI;
                
                // Position along the link (from 0 to 1)
                const t = 0.5 + 0.5 * Math.cos(angle);
                
                // Calculate Fresnel radius at this point
                const d1_t = t * d;
                const d2_t = (1 - t) * d;
                const r_t = Math.sqrt((wavelength * d1_t * d2_t) / (d1_t + d2_t));
                
                // Perpendicular offset
                const offset = r_t * Math.sin(angle);

                // Interpolate position along link
                const lat = link.tower1.lat + t * (link.tower2.lat - link.tower1.lat);
                const lng = link.tower1.lng + t * (link.tower2.lng - link.tower1.lng);

                // Apply perpendicular offset
                const latRad = lat * Math.PI / 180;
                const offsetLat = offset * Math.cos(bearing) / 111320;
                const offsetLng = offset * Math.sin(bearing) / (111320 * Math.cos(latRad));

                ellipsePoints.push([lat + offsetLat, lng + offsetLng]);
            }

            fresnelLayer = L.polygon(ellipsePoints, {
                color: '#ffd700',
                fillColor: '#ffd700',
                fillOpacity: 0.15,
                weight: 2,
                dashArray: '5, 5'
            }).addTo(map);

            fresnelLayer.bindPopup(`
                <strong>First Fresnel Zone</strong><br>
                Frequency: ${link.frequency.toFixed(2)} GHz<br>
                Max Radius: ${radius.toFixed(2)} m<br>
                Distance: ${(d / 1000).toFixed(2)} km
            `);
        }

        function removeFresnelZone() {
            if (fresnelLayer) {
                map.removeLayer(fresnelLayer);
                fresnelLayer = null;
            }
        }

        function updateTowerList() {
            const list = document.getElementById('tower-list');
            document.getElementById('tower-count').textContent = towers.length;

            if (towers.length === 0) {
                list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📡</div><div>No towers placed yet</div></div>';
                return;
            }

            list.innerHTML = towers.map(tower => `
                <div class="tower-item">
                    <div class="tower-header">
                        <div class="tower-name">${tower.name}</div>
                        <div class="tower-actions">
                            <button class="icon-btn" onclick="editTower(${tower.id})" title="Edit">✏️</button>
                            <button class="icon-btn" onclick="removeTower(${tower.id})" title="Delete">🗑️</button>
                        </div>
                    </div>
                    <div class="tower-details">
                        <div>📍 ${tower.lat.toFixed(5)}, ${tower.lng.toFixed(5)}</div>
                        <div class="frequency-input">
                            <input type="number" value="${tower.frequency}" 
                                   onchange="updateFrequency(${tower.id}, this.value, '${tower.unit}')" 
                                   step="0.1" min="0.1" max="100">
                            <select onchange="updateFrequency(${tower.id}, ${tower.frequency}, this.value)">
                                <option value="GHz" ${tower.unit === 'GHz' ? 'selected' : ''}>GHz</option>
                                <option value="MHz" ${tower.unit === 'MHz' ? 'selected' : ''}>MHz</option>
                            </select>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function updateLinkList() {
            const list = document.getElementById('link-list');
            document.getElementById('link-count').textContent = links.length;

            if (links.length === 0) {
                list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔗</div><div>No links created yet</div></div>';
                return;
            }

            list.innerHTML = links.map(link => `
                <div class="link-item ${selectedLink === link ? 'selected' : ''}" onclick="selectLinkFromList(${link.id})">
                    <div class="link-header">
                        <div class="link-name">${link.tower1.name} ↔ ${link.tower2.name}</div>
                        <button class="icon-btn" onclick="event.stopPropagation(); removeLink(${link.id})" title="Delete">🗑️</button>
                    </div>
                    <div class="link-details">
                        <div>📏 Distance: ${(link.distance / 1000).toFixed(2)} km</div>
                        <div>📡 Frequency: ${link.frequency.toFixed(2)} GHz</div>
                    </div>
                </div>
            `).join('');
        }

        function selectLinkFromList(linkId) {
            const link = links.find(l => l.id === linkId);
            if (link) selectLink(link);
        }

        function updateFrequency(towerId, freq, unit) {
            const tower = towers.find(t => t.id === towerId);
            if (tower) {
                tower.frequency = parseFloat(freq);
                tower.unit = unit;
                tower.marker.setPopupContent(`<strong>${tower.name}</strong><br>Frequency: ${tower.frequency} ${tower.unit}`);
            }
        }

        function removeTower(towerId) {
            const tower = towers.find(t => t.id === towerId);
            if (tower) {
                // Remove associated links
                const associatedLinks = links.filter(l => 
                    l.tower1.id === towerId || l.tower2.id === towerId
                );
                associatedLinks.forEach(link => removeLink(link.id));

                // Remove marker
                map.removeLayer(tower.marker);

                // Remove from array
                towers = towers.filter(t => t.id !== towerId);
                updateTowerList();
                updateMapOverlay();
            }
        }

        function removeLink(linkId) {
            const link = links.find(l => l.id === linkId);
            if (link) {
                if (selectedLink === link) {
                    removeFresnelZone();
                    selectedLink = null;
                }
                map.removeLayer(link.polyline);
                links = links.filter(l => l.id !== linkId);
                updateLinkList();
                updateMapOverlay();
            }
        }

        function editTower(towerId) {
            const tower = towers.find(t => t.id === towerId);
            if (tower) {
                const newName = prompt('Enter new tower name:', tower.name);
                if (newName) {
                    tower.name = newName;
                    tower.marker.setPopupContent(`<strong>${tower.name}</strong><br>Frequency: ${tower.frequency} ${tower.unit}`);
                    updateTowerList();
                    updateLinkList();
                }
            }
        }

        function clearAll() {
            if (confirm('Are you sure you want to clear all towers and links?')) {
                towers.forEach(tower => map.removeLayer(tower.marker));
                links.forEach(link => map.removeLayer(link.polyline));
                removeFresnelZone();
                towers = [];
                links = [];
                selectedTower = null;
                selectedLink = null;
                updateTowerList();
                updateLinkList();
                updateMapOverlay();
            }
        }

        function updateInstruction() {
            const instruction = document.getElementById('instruction');
            if (mode === 'tower') {
                instruction.textContent = 'Click on the map to place a tower';
            } else {
                if (selectedTower) {
                    instruction.textContent = `Click another tower to create a link from ${selectedTower.name}`;
                } else {
                    instruction.textContent = 'Click on a tower to start creating a link';
                }
            }
        }

        function updateMapOverlay() {
            const overlay = document.getElementById('map-overlay');
            if (mode === 'tower') {
                overlay.textContent = `Click to add towers (${towers.length} placed)`;
            } else {
                if (selectedTower) {
                    overlay.textContent = `Creating link from ${selectedTower.name}...`;
                } else {
                    overlay.textContent = `Click towers to create links (${links.length} created)`;
                }
            }
        }

        // Initialize
        updateInstruction();
        updateMapOverlay();