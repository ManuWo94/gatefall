/**
 * REGISTRATION CITY SELECTOR - Modal with World Map
 */

class RegistrationCitySelector {
    private modal: HTMLElement | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private cities: any[] = [];
    private hoveredCity: any = null;
    private selectedCityId: number | null = null;
    private onSelect: ((cityId: number, cityName: string) => void) | null = null;

    async show(onSelectCallback: (cityId: number, cityName: string) => void) {
        this.onSelect = onSelectCallback;
        await this.loadCities();
        this.createModal();
        this.setupCanvas();
        this.render();
    }

    private async loadCities() {
        try {
            const response = await fetch('http://localhost:3001/api/cities/cities');
            const data = await response.json();
            this.cities = data.cities || [];
        } catch (error) {
            console.error('Error loading cities:', error);
        }
    }

    private createModal() {
        this.modal = document.createElement('div');
        this.modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        this.modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 30px; max-width: 900px; border: 2px solid rgba(100,200,255,0.3);">
                <h2 style="color: #4CAF50; margin: 0 0 20px 0; text-align: center; font-size: 1.5rem;">🌍 WÄHLE DEINE HEIMATSTADT</h2>
                <p style="text-align: center; color: rgba(255,255,255,0.7); margin-bottom: 20px;">
                    Klicke auf eine Stadt auf der Weltkarte. Reisen zur Heimatstadt ist immer kostenlos und sofort!
                </p>
                <canvas id="registration-city-canvas" width="850" height="510" style="border: 2px solid #4CAF50; border-radius: 8px; cursor: pointer; background: #0a0a0a;"></canvas>
                <div style="margin-top: 20px; display: flex; justify-content: space-between; gap: 15px;">
                    <button id="reg-city-cancel" style="flex: 1; padding: 12px; background: #f44336; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Abbrechen</button>
                    <button id="reg-city-confirm" style="flex: 1; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;" disabled>Bestätigen</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);

        // Event listeners
        document.getElementById('reg-city-cancel')?.addEventListener('click', () => this.close());
        document.getElementById('reg-city-confirm')?.addEventListener('click', () => this.confirm());
    }

    private setupCanvas() {
        this.canvas = document.getElementById('registration-city-canvas') as HTMLCanvasElement;
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mouseleave', () => {
            this.hoveredCity = null;
            this.render();
        });
    }

    private handleMouseMove(e: MouseEvent) {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / 1000;
        const scaleY = this.canvas.height / 600;
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

        this.canvas.style.cursor = 'default';
        this.render();
    }

    private handleClick(e: MouseEvent) {
        if (!this.hoveredCity) return;
        
        this.selectedCityId = this.hoveredCity.id;
        this.render();

        // Enable confirm button
        const confirmBtn = document.getElementById('reg-city-confirm') as HTMLButtonElement;
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = '1';
        }
    }

    private render() {
        if (!this.ctx || !this.canvas) return;

        const scaleX = this.canvas.width / 1000;
        const scaleY = this.canvas.height / 600;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.scale(scaleX, scaleY);

        // Draw simple world map background
        this.drawWorldMapBackground();

        // Draw cities
        for (const city of this.cities) {
            const isSelected = this.selectedCityId === city.id;
            const isHovered = this.hoveredCity?.id === city.id;
            this.drawCity(city, isSelected, isHovered);
        }

        this.ctx.restore();
    }

    private drawWorldMapBackground() {
        if (!this.ctx) return;

        const gradient = this.ctx.createLinearGradient(0, 0, 1000, 600);
        gradient.addColorStop(0, '#1a3a52');
        gradient.addColorStop(0.5, '#2d5a7b');
        gradient.addColorStop(1, '#1a3a52');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 1000, 600);

        this.ctx.fillStyle = '#3a5f3a';
        this.ctx.beginPath();
        this.ctx.ellipse(180, 200, 100, 150, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.ellipse(520, 300, 80, 200, 0.2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.ellipse(750, 250, 150, 120, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }

    private drawCity(city: any, isSelected: boolean, isHovered: boolean) {
        if (!this.ctx) return;

        const x = city.map_x;
        const y = city.map_y;
        const radius = city.map_radius;

        // Outer glow
        if (isSelected || isHovered) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius + 15, 0, Math.PI * 2);
            this.ctx.fillStyle = isSelected ? 'rgba(76, 175, 80, 0.4)' : 'rgba(255, 215, 0, 0.3)';
            this.ctx.fill();
        }

        // City circle
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        if (isSelected) {
            this.ctx.fillStyle = 'rgba(76, 175, 80, 0.6)';
            this.ctx.strokeStyle = '#4CAF50';
            this.ctx.lineWidth = 5;
        } else if (isHovered) {
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 4;
        } else {
            this.ctx.fillStyle = 'rgba(100, 150, 200, 0.4)';
            this.ctx.strokeStyle = '#6496C8';
            this.ctx.lineWidth = 3;
        }
        
        this.ctx.fill();
        this.ctx.stroke();

        // City marker
        this.ctx.fillStyle = isSelected ? '#4CAF50' : (isHovered ? '#FFD700' : '#6496C8');
        this.ctx.beginPath();
        this.ctx.arc(x, y, 12, 0, Math.PI * 2);
        this.ctx.fill();

        // City name
        this.ctx.font = 'bold 18px Arial';
        this.ctx.fillStyle = isSelected ? '#4CAF50' : (isHovered ? '#FFD700' : '#FFF');
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 5;
        this.ctx.strokeText(city.display_name, x, y - radius - 20);
        this.ctx.fillText(city.display_name, x, y - radius - 20);
    }

    private confirm() {
        if (!this.selectedCityId) return;
        
        const selectedCity = this.cities.find(c => c.id === this.selectedCityId);
        if (selectedCity && this.onSelect) {
            this.onSelect(selectedCity.id, selectedCity.display_name);
        }
        
        this.close();
    }

    private close() {
        if (this.modal) {
            this.modal.remove();
        }
    }
}

// Global instance
let regCitySelector: RegistrationCitySelector | null = null;

// Add to window for access from HTML
(window as any).showRegistrationCitySelector = () => {
    regCitySelector = new RegistrationCitySelector();
    regCitySelector.show((cityId, cityName) => {
        const hiddenInput = document.getElementById('register-home-city') as HTMLInputElement;
        const displaySpan = document.getElementById('register-selected-city-display');
        
        if (hiddenInput) hiddenInput.value = cityId.toString();
        if (displaySpan) displaySpan.textContent = `🏙️ ${cityName}`;
    });
};
