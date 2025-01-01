export const chatThemes = {
  default: {
    id: 'default',
    name: 'Classic Blue',
    background: `
      linear-gradient(120deg, rgba(37, 99, 235, 0.1), rgba(99, 102, 241, 0.1)),
      radial-gradient(circle at top right, rgba(37, 99, 235, 0.15), transparent 400px),
      radial-gradient(circle at bottom left, rgba(99, 102, 241, 0.15), transparent 400px)
    `,
    variables: {
      '--theme-overlay': 'rgba(255, 255, 255, 0.05)',
      '--theme-input-bg': 'rgba(255, 255, 255, 0.08)',
      '--theme-border': 'rgba(255, 255, 255, 0.1)'
    },
    sentMessage: 'bg-[#036bfc] text-black',
    receivedMessage: 'dark:bg-gradient-to-br dark:from-gray-700/90 dark:to-gray-800/90 dark:text-white bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 shadow-sm',
    buttonColor: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90',
    bubbleShadow: 'shadow-lg'
  },
  emerald: {
    id: 'emerald',
    name: 'Nature Fresh',
    background: `
      linear-gradient(120deg, rgba(16, 185, 129, 0.05), rgba(5, 150, 105, 0.05)),
      radial-gradient(circle at top right, rgba(16, 185, 129, 0.1), transparent 400px),
      radial-gradient(circle at bottom left, rgba(5, 150, 105, 0.1), transparent 400px)
    `,
    variables: {
      '--theme-overlay': 'rgba(255, 255, 255, 0.05)',
      '--theme-input-bg': 'rgba(255, 255, 255, 0.08)',
      '--theme-border': 'rgba(255, 255, 255, 0.1)'
    },
    sentMessage: 'bg-gradient-to-br from-emerald-600 to-green-600 text-white shadow-md hover:opacity-90',
    receivedMessage: 'dark:bg-gradient-to-br dark:from-gray-700/90 dark:to-gray-800/90 dark:text-white bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-900 shadow-sm',
    buttonColor: 'bg-gradient-to-r from-emerald-500 to-green-600 hover:opacity-90',
    bubbleShadow: 'shadow-sm'
  },
  rose: {
    id: 'rose',
    name: 'Sweet Rose',
    background: `
      linear-gradient(120deg, rgba(244, 63, 94, 0.05), rgba(251, 113, 133, 0.05)),
      radial-gradient(circle at top right, rgba(244, 63, 94, 0.1), transparent 400px),
      radial-gradient(circle at bottom left, rgba(251, 113, 133, 0.1), transparent 400px)
    `,
    variables: {
      '--theme-overlay': 'rgba(255, 255, 255, 0.05)',
      '--theme-input-bg': 'rgba(255, 255, 255, 0.08)',
      '--theme-border': 'rgba(255, 255, 255, 0.1)'
    },
    sentMessage: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md hover:opacity-95',
    receivedMessage: 'dark:bg-gradient-to-br dark:from-gray-700/90 dark:to-gray-800/90 dark:text-white bg-gradient-to-br from-rose-50 to-pink-50 text-rose-900 shadow-sm hover:opacity-95',
    buttonColor: 'bg-gradient-to-r from-rose-500 to-pink-600 hover:opacity-90',
    bubbleShadow: 'shadow-sm'
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Breeze',
    background: `
      linear-gradient(120deg, rgba(14, 165, 233, 0.05), rgba(56, 189, 248, 0.05)),
      radial-gradient(circle at top right, rgba(14, 165, 233, 0.1), transparent 400px),
      radial-gradient(circle at bottom left, rgba(56, 189, 248, 0.1), transparent 400px),
      repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 10px,
        rgba(14, 165, 233, 0.02) 10px,
        rgba(14, 165, 233, 0.02) 20px
      )
    `,
    variables: {
      '--theme-overlay': 'rgba(255, 255, 255, 0.05)',
      '--theme-input-bg': 'rgba(255, 255, 255, 0.08)',
      '--theme-border': 'rgba(255, 255, 255, 0.1)'
    },
    sentMessage: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md hover:opacity-95',
    receivedMessage: 'dark:bg-gradient-to-br dark:from-gray-700/90 dark:to-gray-800/90 dark:text-white bg-gradient-to-br from-sky-50 to-blue-50 text-sky-900 shadow-sm hover:opacity-95',
    buttonColor: 'bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-90',
    bubbleShadow: 'shadow-sm'
  },
  purple: {
    id: 'purple',
    name: 'Royal Violet',
    background: `
      linear-gradient(120deg, rgba(147, 51, 234, 0.05), rgba(168, 85, 247, 0.05)),
      radial-gradient(circle at top right, rgba(147, 51, 234, 0.1), transparent 400px),
      radial-gradient(circle at bottom left, rgba(168, 85, 247, 0.1), transparent 400px),
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(147, 51, 234, 0.02) 10px,
        rgba(147, 51, 234, 0.02) 20px
      )
    `,
    variables: {
      '--theme-overlay': 'rgba(255, 255, 255, 0.05)',
      '--theme-input-bg': 'rgba(255, 255, 255, 0.08)',
      '--theme-border': 'rgba(255, 255, 255, 0.1)'
    },
    sentMessage: 'bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-md hover:opacity-95',
    receivedMessage: 'dark:bg-gradient-to-br dark:from-gray-700/90 dark:to-gray-800/90 dark:text-white bg-gradient-to-br from-purple-50 to-violet-50 text-purple-900 shadow-sm hover:opacity-95',
    buttonColor: 'bg-gradient-to-r from-purple-500 to-violet-600 hover:opacity-90',
    bubbleShadow: 'shadow-sm'
  },
  sunset: {
    id: 'sunset',
    name: 'Warm Sunset',
    background: `
      linear-gradient(120deg, rgba(251, 146, 60, 0.05), rgba(251, 113, 133, 0.05)),
      radial-gradient(circle at top right, rgba(251, 146, 60, 0.1), transparent 400px),
      radial-gradient(circle at bottom left, rgba(251, 113, 133, 0.1), transparent 400px),
      repeating-radial-gradient(
        circle at 50% 50%,
        transparent,
        transparent 20px,
        rgba(251, 146, 60, 0.02) 20px,
        rgba(251, 146, 60, 0.02) 40px
      )
    `,
    variables: {
      '--theme-overlay': 'rgba(255, 255, 255, 0.05)',
      '--theme-input-bg': 'rgba(255, 255, 255, 0.08)',
      '--theme-border': 'rgba(255, 255, 255, 0.1)'
    },
    sentMessage: 'bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-md hover:opacity-95',
    receivedMessage: 'dark:bg-gradient-to-br dark:from-gray-700/90 dark:to-gray-800/90 dark:text-white bg-gradient-to-br from-orange-50 to-rose-50 text-orange-900 shadow-sm hover:opacity-95',
    buttonColor: 'bg-gradient-to-r from-orange-500 to-rose-500 hover:opacity-90',
    bubbleShadow: 'shadow-sm'
  },
  mint: {
    id: 'mint',
    name: 'Cool Mint',
    background: `
      linear-gradient(120deg, rgba(20, 184, 166, 0.05), rgba(45, 212, 191, 0.05)),
      radial-gradient(circle at top right, rgba(20, 184, 166, 0.1), transparent 400px),
      radial-gradient(circle at bottom left, rgba(45, 212, 191, 0.1), transparent 400px),
      repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 15px,
        rgba(20, 184, 166, 0.02) 15px,
        rgba(20, 184, 166, 0.02) 30px
      )
    `,
    variables: {
      '--theme-overlay': 'rgba(255, 255, 255, 0.05)',
      '--theme-input-bg': 'rgba(255, 255, 255, 0.08)',
      '--theme-border': 'rgba(255, 255, 255, 0.1)'
    },
    sentMessage: 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md hover:opacity-95',
    receivedMessage: 'dark:bg-gradient-to-br dark:from-gray-700/90 dark:to-gray-800/90 dark:text-white bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-900 shadow-sm hover:opacity-95',
    buttonColor: 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:opacity-90',
    bubbleShadow: 'shadow-sm'
  }
};
