import './styles.css';
import { getStorageData, saveConfig } from '../utils/storage';
import { DEFAULT_CONFIG, MenuConfig } from '../types';

document.addEventListener('DOMContentLoaded', async () => {
  const apiProviderEl = document.getElementById('apiProvider') as HTMLSelectElement;
  const apiKeyEl = document.getElementById('apiKey') as HTMLInputElement;
  const preferredLanguageEl = document.getElementById('preferredLanguage') as HTMLSelectElement;
  const themeEl = document.getElementById('theme') as HTMLSelectElement;
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');
  const shortcutDisplayEl = document.getElementById('shortcutDisplay');
  const recordShortcutBtn = document.getElementById('recordShortcutBtn');
  const shortcutHelpText = document.getElementById('shortcutHelpText');

  let isRecording = false;
  let currentShortcut = 'Alt+Tab';

  // Load current settings
  const data = await getStorageData();
  const config = data.config;

  apiProviderEl.value = config.apiProvider;
  apiKeyEl.value = config.apiKey || '';
  preferredLanguageEl.value = config.preferredLanguage;
  themeEl.value = config.theme;
  currentShortcut = config.shortcut || 'Alt+Tab';
  updateShortcutDisplay(currentShortcut);

  // Handle shortcut recording
  recordShortcutBtn?.addEventListener('click', () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  });

  function startRecording() {
    isRecording = true;
    recordShortcutBtn!.textContent = '取消录制';
    recordShortcutBtn!.classList.add('recording');
    shortcutDisplayEl!.classList.add('recording');
    shortcutHelpText!.textContent = '请按下快捷键组合... (ESC 取消)';
    document.addEventListener('keydown', handleShortcutKeyDown);
  }

  function stopRecording() {
    isRecording = false;
    recordShortcutBtn!.textContent = '录制快捷键';
    recordShortcutBtn!.classList.remove('recording');
    shortcutDisplayEl!.classList.remove('recording');
    shortcutHelpText!.textContent = '点击"录制快捷键"按钮，然后按下你想要的快捷键组合';
    document.removeEventListener('keydown', handleShortcutKeyDown);
  }

  function handleShortcutKeyDown(e: KeyboardEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (e.key === 'Escape') {
      stopRecording();
      return;
    }

    // Build shortcut string
    const parts: string[] = [];
    if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');

    // Add the actual key (excluding modifiers)
    const key = e.key;
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
      // Format special keys
      const formattedKey = key === ' ' ? 'Space' : key.length === 1 ? key.toUpperCase() : key;
      parts.push(formattedKey);

      if (parts.length >= 2) {
        currentShortcut = parts.join('+');
        updateShortcutDisplay(currentShortcut);
        stopRecording();
        showToast('快捷键已设置，请点击保存按钮');
      }
    }
  }

  function updateShortcutDisplay(shortcut: string) {
    if (shortcutDisplayEl) {
      const keys = shortcut.split('+');
      shortcutDisplayEl.innerHTML = keys.map((key, index) => {
        const separator = index < keys.length - 1 ? '<span class="plus">+</span>' : '';
        return `<span class="key">${key}</span>${separator}`;
      }).join('');
    }
  }

  // Save settings
  saveBtn?.addEventListener('click', async () => {
    const newConfig: Partial<MenuConfig> = {
      apiProvider: apiProviderEl.value as MenuConfig['apiProvider'],
      apiKey: apiKeyEl.value || undefined,
      preferredLanguage: preferredLanguageEl.value,
      theme: themeEl.value as MenuConfig['theme'],
      shortcut: currentShortcut,
    };

    await saveConfig(newConfig);
    showToast('设置已保存', 'success');
  });

  // Reset settings
  resetBtn?.addEventListener('click', async () => {
    await saveConfig(DEFAULT_CONFIG);

    apiProviderEl.value = DEFAULT_CONFIG.apiProvider;
    apiKeyEl.value = '';
    preferredLanguageEl.value = DEFAULT_CONFIG.preferredLanguage;
    themeEl.value = DEFAULT_CONFIG.theme;
    currentShortcut = DEFAULT_CONFIG.shortcut;
    updateShortcutDisplay(currentShortcut);

    showToast('已重置为默认设置', 'success');
  });
});

function showToast(message: string, type: 'success' | 'error' = 'success'): void {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }
}
