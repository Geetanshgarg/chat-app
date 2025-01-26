export const chatThemes = {
  default: {
    id: 'default',
    name: 'Modern Light',
    colors: {
      background: '#ffffff',
      darkBackground: '#0f172a',
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#60a5fa',
      sent: '#3b82f6',
      received: '#64748b',
      overlay: 'rgba(0, 0, 0, 0.5)',
      inputBg: '#f8fafc'
    },
    chat: {
      sent: 'bg-[#3b82f6] text-white',
      received: 'bg-[#64748b] text-white',
      inputBar: 'bg-[#f8fafc]'
    }
  },
  dark: {
    id: 'dark',
    name: 'Modern Dark',
    colors: {
      background: '#0f172a',
      darkBackground: '#0f172a',
      primary: '#60a5fa',
      secondary: '#94a3b8',
      accent: '#3b82f6',
      sent: '#3b82f6',
      received: '#475569',
      overlay: 'rgba(0, 0, 0, 0.7)',
      inputBg: '#1e293b'
    },
    chat: {
      sent: 'bg-[#3b82f6] text-white',
      received: 'bg-[#475569] text-white',
      inputBar: 'bg-[#1e293b]'
    }
  }
};

export const getThemeColors = (theme, isDark = false) => ({
  '--app-background': isDark ? theme.colors.darkBackground : theme.colors.background,
  '--primary': theme.colors.primary,
  '--secondary': theme.colors.secondary,
  '--accent': theme.colors.accent,
  '--overlay': theme.colors.overlay,
  '--input-bg': theme.colors.inputBg
});
