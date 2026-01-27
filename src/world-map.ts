/**
 * WORLD MAP - Weltkarte mit Städten
 */

const API_BASE = 'http://localhost:3001';

interface City {
    id: number;
    name: string;
    display_name: string;
    map_x: number;
    map_y: number;
    map_radius: number;
    travel_time_minutes: number;
    description: string;
    active: boolean;
}

interface TravelData {
    currentCity: number;
    travelingTo: number;
    progress: number;
}

class WorldMap {
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private mapImage: HTMLImageElement | null = null;
    private cities: City[] = [];
    private hoveredCity: City | null = null;
    private travelData: TravelData | null = null;

    async init() {
        this.canvas = document.getElementById('world-map-canvas') as HTMLCanvasElement;
        if (!this.canvas) {
            console.error('World map canvas not found');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get canvas context');
            return;
        }

        // Set canvas to fixed size (850x510 = 85% of 1000x600)
        this.canvas.width = 850;
        this.canvas.height = 510;

        await this.loadWorldMap();
        await this.loadCities();
        this.setupEvents();
        this.render();
    }

    async loadWorldMap() {
        try {
            const response = await fetch(`${API_BASE}/api/admin/world-map-image`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.imageUrl) {
                this.mapImage = new Image();
                this.mapImage.crossOrigin = 'anonymous';
                this.mapImage.onload = () => {
                    console.log('World map image loaded successfully');
                    this.render();
                };
                this.mapImage.onerror = () => {
                    console.warn('Failed to load world map image, using canvas fallback');
                    this.mapImage = null;
                    this.render();
                };
                this.mapImage.src = data.imageUrl;
            } else {
                console.log('No image URL, using canvas fallback');
                this.mapImage = null;
                this.render();
            }
        } catch (error) {
            console.error('Error loading world map:', error);
            this.mapImage = null;
            this.render();
        }
    }

    drawWorldMapBackground() {
        if (!this.ctx) return;

        // Draw ocean background
        const gradient = this.ctx.createLinearGradient(0, 0, 1000, 600);
        gradient.addColorStop(0, '#1a3a52');
        gradient.addColorStop(0.5, '#2d5a7b');
        gradient.addColorStop(1, '#1a3a52');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 1000, 600);

        // Draw continents (simplified)
        this.ctx.fillStyle = '#3a5f3a';
        
        // North America
        this.ctx.beginPath();
        this.ctx.ellipse(180, 200, 100, 150, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Europe/Africa
        this.ctx.beginPath();
        this.ctx.ellipse(520, 300, 80, 200, 0.2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Asia
        this.ctx.beginPath();
        this.ctx.ellipse(750, 250, 150, 120, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Grid overlay
        this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= 1000; i += 100) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, 600);
            this.ctx.stroke();
        }
        for (let i = 0; i <= 600; i += 100) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(1000, i);
            this.ctx.stroke();
        }
    }

    async loadCities() {
        try {
            const response = await fetch(`${API_BASE}/api/cities/cities`, {
                credentials: 'include'
            });
            const data = await response.json();
            this.cities = data.cities || [];
            this.render();
        } catch (error) {
            console.error('Error loading cities:', error);
        }
    }

    setupEvents() {
        if (!this.canvas) return;

        // Hover detection
        this.canvas.addEventListener('mousemove', (e) => {
            // Check hover over cities
            const rect = this.canvas!.getBoundingClientRect();
            const scaleX = this.canvas!.width / 1000;
            const scaleY = this.canvas!.height / 600;
            const mouseX = (e.clientX - rect.left) / scaleX;
            const mouseY = (e.clientY - rect.top) / scaleY;

            this.hoveredCity = null;
            for (const city of this.cities) {
                const dx = mouseX - city.map_x;
                const dy = mouseY - city.map_y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= city.map_radius) {
                    this.hoveredCity = city;
                    this.canvas!.style.cursor = 'pointer';
                    this.render();
                    return;
                }
            }

            this.canvas!.style.cursor = 'default';
            this.render();
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.hoveredCity = null;
            this.canvas!.style.cursor = 'default';
            this.render();
        });

        // Click to select city
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas!.getBoundingClientRect();
            const scaleX = this.canvas!.width / 1000;
            const scaleY = this.canvas!.height / 600;
            const mx = (e.clientX - rect.left) / scaleX;
            const my = (e.clientY - rect.top) / scaleY;

            for (const city of this.cities) {
                const dx = mx - city.map_x;
                const dy = my - city.map_y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= city.map_radius) {
                    this.selectCity(city);
                    return;
                }
            }
        });
    }

    selectCity(city: City) {
        console.log('Selected city:', city.display_name);
        
        // Emit event for travel system
        const event = new CustomEvent('citySelected', { detail: city });
        window.dispatchEvent(event);
    }

    render() {
        if (!this.ctx || !this.canvas) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        
        // Scale context to fit 1000x600 map into 700x420 canvas
        const scaleX = this.canvas.width / 1000;
        const scaleY = this.canvas.height / 600;
        this.ctx.scale(scaleX, scaleY);

        // Draw world map - use image if loaded, otherwise use canvas background
        if (this.mapImage && this.mapImage.complete) {
            this.ctx.drawImage(this.mapImage, 0, 0, 1000, 600);
        } else {
            this.drawWorldMapBackground();
        }

        // Draw cities
        for (const city of this.cities) {
            this.drawCity(city, this.hoveredCity?.id === city.id);
        }

        // Draw travel path if traveling
        if (this.travelData) {
            this.drawTravelPath();
        }

        this.ctx.restore();
    }

    drawCity(city: City, isHovered: boolean) {
        if (!this.ctx || !this.canvas) return;

        // No scaling needed - canvas is 1000x600, same as coordinates
        const x = city.map_x;
        const y = city.map_y;
        const radius = city.map_radius;

        this.ctx.save();

        // Outer glow for better visibility
        if (isHovered) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius + 10, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            this.ctx.fill();
        }

        // City circle (larger and more visible)
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        if (isHovered) {
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 4;
        } else {
            this.ctx.fillStyle = 'rgba(76, 175, 80, 0.4)';
            this.ctx.strokeStyle = '#4CAF50';
            this.ctx.lineWidth = 3;
        }
        
        this.ctx.fill();
        this.ctx.stroke();

        // City marker (pin) - larger
        this.ctx.fillStyle = isHovered ? '#FFD700' : '#4CAF50';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Inner white dot
        this.ctx.fillStyle = '#FFF';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, Math.PI * 2);
        this.ctx.fill();

        // City name - better contrast and larger
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillStyle = isHovered ? '#FFD700' : '#FFF';
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 4;
        this.ctx.strokeText(city.display_name, x, y - radius - 15);
        this.ctx.fillText(city.display_name, x, y - radius - 15);

        this.ctx.restore();
    }

    // Travel visualization
    setTravelData(data: TravelData | null) {
        this.travelData = data;
        this.render();
    }

    private drawTravelPath() {
        if (!this.ctx || !this.travelData) return;

        const fromCity = this.cities.find(c => c.id === this.travelData!.currentCity);
        const toCity = this.cities.find(c => c.id === this.travelData!.travelingTo);

        if (!fromCity || !toCity) return;

        const progress = this.travelData.progress / 100;

        // Draw path line
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(149, 117, 255, 0.5)';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(fromCity.map_x, fromCity.map_y);
        this.ctx.lineTo(toCity.map_x, toCity.map_y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw moving player icon
        const currentX = fromCity.map_x + (toCity.map_x - fromCity.map_x) * progress;
        const currentY = fromCity.map_y + (toCity.map_y - fromCity.map_y) * progress;

        // Glowing circle
        this.ctx.beginPath();
        this.ctx.arc(currentX, currentY, 15, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(149, 117, 255, 0.3)';
        this.ctx.fill();

        // Player icon
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🚶', currentX, currentY);

        this.ctx.restore();
    }
}

// Initialize
const worldMap = new WorldMap();

export { worldMap, WorldMap };
