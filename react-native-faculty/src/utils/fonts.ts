// Font utility to handle font loading and fallbacks
export const Fonts = {
  regular: 'Inter',
  semiBold: 'Inter-SemiBold',
  fallback: {
    regular: 'System',
    semiBold: 'System',
  }
};

// Helper function to get font family with fallback
export const getFontFamily = (fontType: 'regular' | 'semiBold' = 'regular'): string => {
  return fontType === 'semiBold' ? Fonts.semiBold : Fonts.regular;
};
