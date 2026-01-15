import { icons } from './icons';

export interface MenuItem {
  id: string;
  icon: string;
  label: string;
  action: string;
}

export interface MenuConfig {
  shortcut: string;
  theme: 'dark' | 'light' | 'system';
  preferredLanguage: string;
  apiProvider: 'groq' | 'openai' | 'anthropic' | 'gemini';
  apiKey?: string;
}

export interface StorageData {
  config: MenuConfig;
  selectionMenuItems: MenuItem[];
  globalMenuItems: MenuItem[];
}

export const DEFAULT_CONFIG: MenuConfig = {
  shortcut: 'Double+Tab',
  theme: 'dark',
  preferredLanguage: 'zh-CN',
  apiProvider: 'groq',
};

export const DEFAULT_SELECTION_MENU: MenuItem[] = [
  { id: 'translate', icon: icons.translate, label: '翻译', action: 'translate' },
  { id: 'summarize', icon: icons.summarize, label: '总结', action: 'summarize' },
  { id: 'explain', icon: icons.explain, label: '解释', action: 'explain' },
  { id: 'rewrite', icon: icons.rewrite, label: '改写', action: 'rewrite' },
  { id: 'search', icon: icons.search, label: '搜索', action: 'search' },
  { id: 'copy', icon: icons.copy, label: '复制', action: 'copy' },
  { id: 'sendToAI', icon: icons.sendToAI, label: '发送到 AI', action: 'sendToAI' },
  { id: 'codeExplain', icon: icons.codeExplain, label: '代码解释', action: 'codeExplain' },
];

export const DEFAULT_GLOBAL_MENU: MenuItem[] = [
  { id: 'aiChat', icon: icons.aiChat, label: 'AI 对话', action: 'aiChat' },
  { id: 'summarizePage', icon: icons.summarizePage, label: '总结页面', action: 'summarizePage' },
  { id: 'switchTab', icon: icons.switchTab, label: '标签切换', action: 'switchTab' },
  { id: 'history', icon: icons.history, label: '历史记录', action: 'history' },
  { id: 'screenshot', icon: icons.screenshot, label: '截图', action: 'screenshot' },
  { id: 'bookmark', icon: icons.bookmark, label: '书签', action: 'bookmark' },
  { id: 'newTab', icon: icons.newTab, label: '新标签', action: 'newTab' },
  { id: 'settings', icon: icons.settings, label: '设置', action: 'settings' },
];

export type MessageType =
  | 'TOGGLE_MENU'
  | 'AI_REQUEST'
  | 'AI_RESPONSE'
  | 'OPEN_URL'
  | 'GET_TABS'
  | 'SWITCH_TAB'
  | 'NEW_TAB'
  | 'SCREENSHOT'
  | 'ADD_BOOKMARK'
  | 'GET_PAGE_CONTENT';

export interface Message {
  type: MessageType;
  payload?: unknown;
}
