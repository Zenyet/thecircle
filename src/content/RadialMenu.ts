import { MenuItem } from '../types';
import { icons } from '../icons';

export class RadialMenu {
  private container: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private menuItems: MenuItem[] = [];
  private selectedIndex: number = -1;
  private centerX: number = 0;
  private centerY: number = 0;
  private isVisible: boolean = false;
  private onSelect: ((item: MenuItem) => void) | null = null;
  private resultPanel: HTMLElement | null = null;

  constructor() {
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleEscape = this.handleEscape.bind(this);
  }

  public show(
    x: number,
    y: number,
    items: MenuItem[],
    onSelect: (item: MenuItem) => void
  ): void {
    if (this.isVisible) {
      this.hide();
    }

    this.menuItems = items;
    this.onSelect = onSelect;
    this.centerX = x;
    this.centerY = y;
    this.selectedIndex = -1;
    this.isVisible = true;

    this.createOverlay();
    this.createMenu();
    this.attachEventListeners();
  }

  public hide(): void {
    this.isVisible = false;
    this.detachEventListeners();

    if (this.overlay) {
      this.overlay.classList.add('thecircle-fade-out');
      setTimeout(() => {
        this.overlay?.remove();
        this.overlay = null;
        this.container = null;
      }, 200);
    }
  }

  public hideResultPanel(): void {
    if (this.resultPanel) {
      this.resultPanel.classList.add('thecircle-fade-out');
      setTimeout(() => {
        this.resultPanel?.remove();
        this.resultPanel = null;
      }, 200);
    }
  }

  public showResult(title: string, content: string, isLoading: boolean = false): void {
    this.hideResultPanel();

    this.resultPanel = document.createElement('div');
    this.resultPanel.className = 'thecircle-result-panel';
    this.resultPanel.innerHTML = `
      <div class="thecircle-result-header">
        <span class="thecircle-result-title">${title}</span>
        <button class="thecircle-result-close">×</button>
      </div>
      <div class="thecircle-result-content ${isLoading ? 'thecircle-loading' : ''}">
        ${isLoading ? '<div class="thecircle-spinner"></div>' : content}
      </div>
      ${!isLoading ? '<div class="thecircle-result-actions"><button class="thecircle-copy-btn">复制</button></div>' : ''}
    `;

    document.body.appendChild(this.resultPanel);

    // Position near mouse
    const rect = this.resultPanel.getBoundingClientRect();
    let left = this.centerX + 100;
    let top = this.centerY - rect.height / 2;

    // Keep within viewport
    if (left + rect.width > window.innerWidth - 20) {
      left = this.centerX - rect.width - 100;
    }
    if (top < 20) top = 20;
    if (top + rect.height > window.innerHeight - 20) {
      top = window.innerHeight - rect.height - 20;
    }

    this.resultPanel.style.left = `${left}px`;
    this.resultPanel.style.top = `${top}px`;

    // Event listeners
    const closeBtn = this.resultPanel.querySelector('.thecircle-result-close');
    closeBtn?.addEventListener('click', () => this.hideResultPanel());

    const copyBtn = this.resultPanel.querySelector('.thecircle-copy-btn');
    copyBtn?.addEventListener('click', () => {
      navigator.clipboard.writeText(content);
      if (copyBtn) {
        copyBtn.textContent = '已复制!';
        setTimeout(() => {
          if (copyBtn) copyBtn.textContent = '复制';
        }, 1500);
      }
    });
  }

  public updateResult(content: string): void {
    if (this.resultPanel) {
      const contentEl = this.resultPanel.querySelector('.thecircle-result-content');
      if (contentEl) {
        contentEl.classList.remove('thecircle-loading');
        contentEl.innerHTML = content;
      }

      // Add copy button if not present
      const actionsEl = this.resultPanel.querySelector('.thecircle-result-actions');
      if (!actionsEl) {
        const actions = document.createElement('div');
        actions.className = 'thecircle-result-actions';
        actions.innerHTML = '<button class="thecircle-copy-btn">复制</button>';
        this.resultPanel.appendChild(actions);

        const copyBtn = actions.querySelector('.thecircle-copy-btn');
        copyBtn?.addEventListener('click', () => {
          navigator.clipboard.writeText(content);
          if (copyBtn) {
            copyBtn.textContent = '已复制!';
            setTimeout(() => {
              if (copyBtn) copyBtn.textContent = '复制';
            }, 1500);
          }
        });
      }
    }
  }

  private createOverlay(): void {
    this.overlay = document.createElement('div');
    this.overlay.className = 'thecircle-overlay';
    document.body.appendChild(this.overlay);
  }

  private createMenu(): void {
    this.container = document.createElement('div');
    this.container.className = 'thecircle-menu';
    this.container.style.left = `${this.centerX}px`;
    this.container.style.top = `${this.centerY}px`;

    // Create center indicator
    const center = document.createElement('div');
    center.className = 'thecircle-center';
    center.innerHTML = `
      <span class="thecircle-center-icon">${icons.circle}</span>
      <span class="thecircle-center-label">选择操作</span>
    `;
    this.container.appendChild(center);

    // Create menu items (8 items in a circle)
    const itemCount = this.menuItems.length;
    const radius = 120;

    this.menuItems.forEach((item, index) => {
      const angle = (index / itemCount) * 2 * Math.PI - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const itemEl = document.createElement('div');
      itemEl.className = 'thecircle-item';
      itemEl.dataset.index = String(index);
      itemEl.style.transform = `translate(${x}px, ${y}px)`;
      itemEl.innerHTML = `
        <span class="thecircle-item-icon">${item.icon}</span>
        <span class="thecircle-item-label">${item.label}</span>
      `;

      this.container!.appendChild(itemEl);
    });

    this.overlay!.appendChild(this.container);

    // Trigger entrance animation
    requestAnimationFrame(() => {
      this.container?.classList.add('thecircle-menu-visible');
    });
  }

  private attachEventListeners(): void {
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('click', this.handleClick);
    document.addEventListener('keydown', this.handleEscape);
  }

  private detachEventListeners(): void {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('click', this.handleClick);
    document.removeEventListener('keydown', this.handleEscape);
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isVisible || !this.container) return;

    const dx = e.clientX - this.centerX;
    const dy = e.clientY - this.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only highlight if mouse is far enough from center
    if (distance < 40) {
      this.setSelectedIndex(-1);
      return;
    }

    // Calculate angle and determine which item is being hovered
    let angle = Math.atan2(dy, dx);
    angle = angle + Math.PI / 2; // Adjust so top is 0
    if (angle < 0) angle += 2 * Math.PI;

    const itemCount = this.menuItems.length;
    const segmentSize = (2 * Math.PI) / itemCount;
    const index = Math.floor((angle + segmentSize / 2) % (2 * Math.PI) / segmentSize);

    this.setSelectedIndex(index);
  }

  private setSelectedIndex(index: number): void {
    if (this.selectedIndex === index) return;

    // Remove highlight from previous item
    if (this.selectedIndex >= 0) {
      const prevItem = this.container?.querySelector(`[data-index="${this.selectedIndex}"]`);
      prevItem?.classList.remove('thecircle-item-selected');
    }

    this.selectedIndex = index;

    // Highlight current item
    if (index >= 0 && index < this.menuItems.length) {
      const currentItem = this.container?.querySelector(`[data-index="${index}"]`);
      currentItem?.classList.add('thecircle-item-selected');

      // Update center label
      const centerLabel = this.container?.querySelector('.thecircle-center-label');
      const centerIcon = this.container?.querySelector('.thecircle-center-icon');
      if (centerLabel && centerIcon) {
        centerLabel.textContent = this.menuItems[index].label;
        centerIcon.innerHTML = this.menuItems[index].icon;
      }
    } else {
      // Reset center
      const centerLabel = this.container?.querySelector('.thecircle-center-label');
      const centerIcon = this.container?.querySelector('.thecircle-center-icon');
      if (centerLabel && centerIcon) {
        centerLabel.textContent = '选择操作';
        centerIcon.innerHTML = icons.circle;
      }
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    // On Alt key release, execute selected action
    if (e.key === 'Alt' && this.selectedIndex >= 0) {
      this.executeSelection();
    }
  }

  private handleClick(e: MouseEvent): void {
    if (!this.isVisible) return;

    // Check if clicked on a menu item
    const target = e.target as HTMLElement;
    const itemEl = target.closest('.thecircle-item');

    if (itemEl) {
      const index = parseInt(itemEl.getAttribute('data-index') || '-1');
      if (index >= 0) {
        this.selectedIndex = index;
        this.executeSelection();
      }
    } else if (!target.closest('.thecircle-menu')) {
      // Clicked outside menu, close it
      this.hide();
    }
  }

  private handleEscape(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.hide();
    }
  }

  private executeSelection(): void {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.menuItems.length) {
      const item = this.menuItems[this.selectedIndex];
      this.hide();
      this.onSelect?.(item);
    }
  }
}
