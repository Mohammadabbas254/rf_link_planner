# 📡 RF Outdoor Link Planner

A web-based tool for planning point-to-point RF (Radio Frequency) links between communication towers. Visualize tower locations, create frequency-matched links, and analyze First Fresnel Zone clearance.

![RF Link Planner](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🗼 Tower Management
- **Interactive Placement**: Click on the map to place communication towers
- **Frequency Configuration**: Set operating frequency in GHz or MHz for each tower
- **Easy Editing**: Rename towers, adjust frequencies, or delete towers with a single click
- **Visual Markers**: Custom tower icons with real-time position display

### 🔗 Link Creation
- **Point-to-Point Links**: Connect two towers with a visual line representation
- **Frequency Matching**: Automatic validation ensures only towers with matching frequencies can be linked
- **Distance Calculation**: Accurate distance measurement using Haversine formula
- **Duplicate Prevention**: System prevents creating multiple links between the same tower pair

### 📊 Fresnel Zone Visualization
- **First Fresnel Zone**: Click any link to display the First Fresnel Zone ellipse
- **Accurate Calculations**: Uses standard RF propagation formulas
```
  r = √((λ × d₁ × d₂) / (d₁ + d₂))
  where λ = c / f
```
- **Visual Clearance Analysis**: Golden ellipse overlay shows zone boundaries
- **Detailed Information**: Popup displays frequency, max radius, and total distance

### 🎨 User Interface
- **Dual-Mode Operation**: Toggle between "Add Tower" and "Create Link" modes
- **Sidebar Controls**: Comprehensive tower and link management panel
- **Real-time Updates**: Live counters and status indicators
- **Responsive Design**: Works on desktop and tablet devices
- **Contextual Help**: Dynamic instructions guide users through each action

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for map tiles)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rf-link-planner.git
cd rf-link-planner
```

2. Open `index.html` in your web browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

**No build process or dependencies required!** This is a pure vanilla JavaScript application.

## 📖 Usage Guide

### Adding Towers
1. Click the **"Add Tower"** mode button (active by default)
2. Click anywhere on the map to place a tower
3. Configure the tower's frequency in the sidebar
4. Repeat to add more towers

### Creating Links
1. Click the **"Create Link"** mode button
2. Click on the first tower (it will highlight in red)
3. Click on a second tower with **matching frequency**
4. A link line will appear connecting the towers

### Viewing Fresnel Zones
1. Click on any existing link line
2. The First Fresnel Zone ellipse will appear in gold
3. Click the link again to hide the zone

### Managing Elements
- **Edit Tower**: Click the pencil icon to rename a tower
- **Change Frequency**: Use the inline frequency input in the sidebar
- **Delete Tower**: Click the trash icon (removes tower and all its links)
- **Delete Link**: Click the trash icon on the link item

## 🛠️ Technical Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Pure CSS3 (no frameworks)
- **Mapping**: Leaflet.js 1.9.4
- **Map Data**: OpenStreetMap

## 📐 RF Calculations

### Distance Calculation
Uses the Haversine formula for accurate great-circle distance:
```javascript
a = sin²(Δφ/2) + cos(φ₁) × cos(φ₂) × sin²(Δλ/2)
c = 2 × atan2(√a, √(1−a))
distance = R × c  // R = Earth's radius (6,371 km)
```

### Fresnel Zone Calculation
Implements standard First Fresnel Zone formula:
- **Wavelength**: λ = c / f (where c = 3×10⁸ m/s)
- **Radius**: r = √((λ × d₁ × d₂) / (d₁ + d₂))
- **Ellipse Generation**: 32-point polygon with variable radius along link path

### Frequency Matching
- Converts all frequencies to GHz for comparison
- Allows 0.001 GHz tolerance for floating-point precision
- Prevents mismatched links with clear error messages

## 🎯 Key Features Explained

### Why Frequency Matching?
In real RF planning, links require both ends to operate on the same frequency for communication. This tool enforces this constraint to simulate realistic planning scenarios.

### What is the Fresnel Zone?
The Fresnel zone is an elliptical region around the direct line-of-sight path where RF signals can reflect and interfere. The First Fresnel Zone should ideally be clear of obstacles (trees, buildings, terrain) for optimal link performance.

### Distance Accuracy
The tool uses geodesic calculations accounting for Earth's curvature, providing accuracy suitable for real-world RF planning over distances up to hundreds of kilometers.

## 🎨 Design Philosophy

- **Simplicity First**: Clean, intuitive interface requiring no training
- **Visual Feedback**: Every action provides immediate visual confirmation
- **Error Prevention**: Validates inputs and prevents invalid operations
- **Progressive Disclosure**: Advanced features appear only when needed

## 🔧 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📝 Future Enhancements

- [ ] Terrain elevation profile integration (Open-Elevation API)
- [ ] Multi-hop link planning
- [ ] Link budget calculations
- [ ] Export/Import tower and link data (JSON)
- [ ] Path loss calculations
- [ ] Antenna pattern visualization
- [ ] KML/KMZ export for Google Earth

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Leaflet.js](https://leafletjs.com/) - Interactive map library
- [OpenStreetMap](https://www.openstreetmap.org/) - Map data
- RF engineering community for propagation formulas

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Email: mohammadabbasiiit@gmail.com

---
Made with ❤️ 
