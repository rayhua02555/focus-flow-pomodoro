import { BackgroundConfig, BackgroundType } from '../types';

export interface BackgroundPreset {
  id: string;
  name: string;
  category: 'default' | 'gradient' | 'wallpaper';
  type: BackgroundType;
  styleValue: string; // CSS background string or image URL
  previewStyle?: React.CSSProperties;
  description?: string;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  // 系統預設
  {
    id: 'default',
    name: '極簡原生',
    category: 'default',
    type: 'default',
    styleValue: '',
    description: '保持極簡俐落的純粹工作氛圍',
  },

  // 質感漸層
  {
    id: 'aurora',
    name: '晨曦極光',
    category: 'gradient',
    type: 'gradient',
    styleValue: 'linear-gradient(135deg, #091b29 0%, #0d3b38 50%, #082823 100%)',
    description: '靜謐深邃的深綠與藍綠極光',
  },
  {
    id: 'sunset',
    name: '日落暖陽',
    category: 'gradient',
    type: 'gradient',
    styleValue: 'linear-gradient(135deg, #2e0854 0%, #6b1135 50%, #7c2d12 100%)',
    description: '溫暖醉人的紫紅與晚霞晚景',
  },
  {
    id: 'deep-forest',
    name: '幽靜深林',
    category: 'gradient',
    type: 'gradient',
    styleValue: 'linear-gradient(135deg, #031e17 0%, #064032 50%, #022019 100%)',
    description: '沉穩內斂的深苔綠色系',
  },
  {
    id: 'cyberpunk',
    name: '霓虹夜幕',
    category: 'gradient',
    type: 'gradient',
    styleValue: 'linear-gradient(135deg, #18052e 0%, #3b0764 50%, #1e1b4b 100%)',
    description: '科技感氛圍的深紫與靛藍',
  },
  {
    id: 'warm-latte',
    name: '溫潤拿鐵',
    category: 'gradient',
    type: 'gradient',
    styleValue: 'linear-gradient(135deg, #201815 0%, #3e2723 50%, #2e1c14 100%)',
    description: '如咖啡館般的沉靜木質與深褐',
  },
  {
    id: 'cosmic',
    name: '浩瀚星雲',
    category: 'gradient',
    type: 'gradient',
    styleValue: 'linear-gradient(135deg, #030712 0%, #171138 50%, #240a34 100%)',
    description: '星空宇宙般的午夜深紫與深黑',
  },
  {
    id: 'ocean-depth',
    name: '幽藍深海',
    category: 'gradient',
    type: 'gradient',
    styleValue: 'linear-gradient(135deg, #041b2d 0%, #073b4c 50%, #062335 100%)',
    description: '沉靜的大洋深處蔚藍色系',
  },
  {
    id: 'lavender-dusk',
    name: '暮色薰衣',
    category: 'gradient',
    type: 'gradient',
    styleValue: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)',
    description: '舒緩放鬆的薰衣草靛紫色調',
  },

  // 精選高畫質桌布
  {
    id: 'rainy-window',
    name: '靜心雨窗',
    category: 'wallpaper',
    type: 'wallpaper',
    styleValue: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1920&q=80',
    description: '雨滴滑落窗前，伴隨雨聲進入深層心流',
  },
  {
    id: 'misty-forest',
    name: '迷霧松林',
    category: 'wallpaper',
    type: 'wallpaper',
    styleValue: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80',
    description: '晨霧瀰漫的高聳針葉林，淨化思緒',
  },
  {
    id: 'cozy-library',
    name: '古典書房',
    category: 'wallpaper',
    type: 'wallpaper',
    styleValue: 'https://images.unsplash.com/photo-1507842229453-764273295964?auto=format&fit=crop&w=1920&q=80',
    description: '沉浸在書香與昏黃燈光的靜謐書房',
  },
  {
    id: 'calm-ocean',
    name: '靜止海岸',
    category: 'wallpaper',
    type: 'wallpaper',
    styleValue: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
    description: '微風輕拂的海邊，放鬆焦慮緊繃情緒',
  },
  {
    id: 'starry-sky',
    name: '璀璨星空',
    category: 'wallpaper',
    type: 'wallpaper',
    styleValue: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80',
    description: '仰望漫天銀河星斗，探索專注極限',
  },
  {
    id: 'coffee-shop',
    name: '街角咖啡館',
    category: 'wallpaper',
    type: 'wallpaper',
    styleValue: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1920&q=80',
    description: '微醺暖光的咖啡館角落，最適合靈感創作',
  },
  {
    id: 'mountains',
    name: '雲海群峰',
    category: 'wallpaper',
    type: 'wallpaper',
    styleValue: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80',
    description: '壯闊雲海與巍峨山脈，登高遠眺開闊心境',
  },
  {
    id: 'lofi-study',
    name: '暖心書桌',
    category: 'wallpaper',
    type: 'wallpaper',
    styleValue: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1920&q=80',
    description: '一杯熱飲、一台筆電的舒適極簡工作空間',
  },
];

/**
 * Resolves the CSS style object based on current background configuration
 */
export function getBackgroundStyles(bg: BackgroundConfig): {
  wrapperStyle: React.CSSProperties;
  overlayStyle: React.CSSProperties;
  hasCustomBackground: boolean;
} {
  if (!bg || bg.type === 'default' || bg.presetId === 'default') {
    return {
      wrapperStyle: {},
      overlayStyle: { display: 'none' },
      hasCustomBackground: false,
    };
  }

  let backgroundValue = '';

  if (bg.type === 'custom' || bg.presetId === 'custom') {
    if (bg.customUrl) {
      backgroundValue = `url("${bg.customUrl}") center center / cover no-repeat fixed`;
    }
  } else if (bg.type === 'gradient') {
    const preset = BACKGROUND_PRESETS.find((p) => p.id === bg.presetId);
    backgroundValue = preset ? preset.styleValue : '';
  } else if (bg.type === 'wallpaper') {
    const preset = BACKGROUND_PRESETS.find((p) => p.id === bg.presetId);
    if (preset) {
      backgroundValue = `url("${preset.styleValue}") center center / cover no-repeat fixed`;
    }
  }

  if (!backgroundValue) {
    return {
      wrapperStyle: {},
      overlayStyle: { display: 'none' },
      hasCustomBackground: false,
    };
  }

  const blurPx = Math.max(0, bg.blur || 0);
  const opacityPercent = Math.min(95, Math.max(0, bg.opacity ?? 35));

  return {
    wrapperStyle: {
      background: backgroundValue,
      filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
      transform: blurPx > 0 ? 'scale(1.03)' : undefined, // prevents blur edge bleeding
    },
    overlayStyle: {
      backgroundColor: `rgba(0, 0, 0, ${opacityPercent / 100})`,
    },
    hasCustomBackground: true,
  };
}

