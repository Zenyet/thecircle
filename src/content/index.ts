import './styles.css';
import { RadialMenu } from './RadialMenu';
import { MenuActions } from './MenuActions';
import { MenuItem, DEFAULT_CONFIG, DEFAULT_SELECTION_MENU, DEFAULT_GLOBAL_MENU, MenuConfig } from '../types';
import { getStorageData } from '../utils/storage';

class TheCircle {
  private radialMenu: RadialMenu;
  private menuActions: MenuActions;
  private selectionMenuItems: MenuItem[] = DEFAULT_SELECTION_MENU;
  private globalMenuItems: MenuItem[] = DEFAULT_GLOBAL_MENU;
  private config: MenuConfig = DEFAULT_CONFIG;
  private lastKeyTime: number = 0;
  private lastKey: string = '';
  private readonly DOUBLE_TAP_DELAY = 300; // ms

  constructor() {
    this.radialMenu = new RadialMenu();
    this.menuActions = new MenuActions(DEFAULT_CONFIG);
    this.init();
  }

  private async init(): Promise<void> {
    await this.loadConfig();
    this.setupKeyboardShortcut();
    this.setupMessageListener();
    this.setupStorageListener();
    console.log('The Circle: Initialized');
  }

  private async loadConfig(): Promise<void> {
    try {
      const data = await getStorageData();
      this.config = data.config;
      this.menuActions.setConfig(data.config);
      this.selectionMenuItems = data.selectionMenuItems;
      this.globalMenuItems = data.globalMenuItems;
    } catch (error) {
      console.error('The Circle: Failed to load config', error);
    }
  }

  private setupStorageListener(): void {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.thecircle_config) {
        this.config = { ...this.config, ...changes.thecircle_config.newValue };
        this.menuActions.setConfig(this.config);
      }
    });
  }

  private setupKeyboardShortcut(): void {
    const pressedKeys = new Set<string>();

    document.addEventListener('keydown', (e) => {
      pressedKeys.add(e.key);

      // Check for double-tap shortcut (format: "Double+KeyName")
      if (this.config.shortcut.startsWith('Double+')) {
        const targetKey = this.config.shortcut.slice(7); // Remove "Double+" prefix
        if (this.matchDoubleTapKey(e.key, targetKey)) {
          const now = Date.now();
          if (this.lastKey === e.key && (now - this.lastKeyTime) < this.DOUBLE_TAP_DELAY) {
            e.preventDefault();
            this.showMenu();
            this.lastKeyTime = 0; // Reset to prevent triple-tap triggering
            this.lastKey = '';
          } else {
            this.lastKeyTime = now;
            this.lastKey = e.key;
          }
        }
      } else if (this.matchShortcut(e, this.config.shortcut)) {
        e.preventDefault();
        this.showMenu();
      }
    });

    document.addEventListener('keyup', (e) => {
      pressedKeys.delete(e.key);
    });

    // Clear pressed keys when window loses focus
    window.addEventListener('blur', () => {
      pressedKeys.clear();
    });
  }

  private matchDoubleTapKey(pressedKey: string, targetKey: string): boolean {
    // Handle special key names
    const keyMap: Record<string, string[]> = {
      'Control': ['Control', 'ControlLeft', 'ControlRight'],
      'Shift': ['Shift', 'ShiftLeft', 'ShiftRight'],
      'Alt': ['Alt', 'AltLeft', 'AltRight'],
      'Meta': ['Meta', 'MetaLeft', 'MetaRight'],
      'Space': [' ', 'Space'],
      'Tab': ['Tab'],
    };

    const validKeys = keyMap[targetKey] || [targetKey];
    return validKeys.includes(pressedKey) || pressedKey.toLowerCase() === targetKey.toLowerCase();
  }

  private matchShortcut(e: KeyboardEvent, shortcut: string): boolean {
    const parts = shortcut.split('+');
    const key = parts[parts.length - 1];

    const needCtrl = parts.includes('Ctrl');
    const needAlt = parts.includes('Alt');
    const needShift = parts.includes('Shift');

    const keyMatch = key === 'Space' ? e.key === ' ' : e.key.toUpperCase() === key.toUpperCase();

    return keyMatch &&
           (e.ctrlKey || e.metaKey) === needCtrl &&
           e.altKey === needAlt &&
           e.shiftKey === needShift;
  }

  private setupMessageListener(): void {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'TOGGLE_MENU') {
        this.showMenu();
        sendResponse({ success: true });
      }
      return true;
    });
  }

  private showMenu(): void {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || '';

    // Get mouse position or use center of viewport
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;

    // Choose menu based on whether text is selected
    const menuItems = selectedText ? this.selectionMenuItems : this.globalMenuItems;
    this.menuActions.setSelectedText(selectedText);

    this.radialMenu.show(x, y, menuItems, async (item) => {
      await this.handleMenuAction(item);
    });
  }

  private async handleMenuAction(item: MenuItem): Promise<void> {
    // Show loading for AI actions
    const aiActions = ['translate', 'summarize', 'explain', 'rewrite', 'codeExplain', 'summarizePage'];

    if (aiActions.includes(item.action)) {
      this.radialMenu.showResult(item.label, '', true);
    }

    const result = await this.menuActions.execute(item);

    if (result.type === 'ai') {
      this.radialMenu.updateResult(result.result || '');
    } else if (result.type === 'error') {
      this.radialMenu.showResult('错误', result.result || '未知错误');
    } else if (result.type === 'success') {
      this.showToast(result.result || '操作成功');
    } else if (result.type === 'info') {
      this.showToast(result.result || '');
    }
  }

  private showToast(message: string): void {
    const toast = document.createElement('div');
    toast.className = 'thecircle-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('thecircle-fade-out');
      setTimeout(() => toast.remove(), 200);
    }, 2000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new TheCircle());
} else {
  new TheCircle();
}
