// Responsive Header Component Test
// This file demonstrates the responsive behavior of the header component

/**
 * Responsive Breakpoints and Behavior:
 *
 * 1. Mobile (< 768px):
 *    - Quick categories are hidden completely
 *    - Only "Categorias" button remains visible
 *    - Categories accessible via mobile menu
 *
 * 2. Tablet (768px - 1023px):
 *    - Shows 4 quick categories
 *    - Button label: "Todas as categorias"
 *    - Smaller font size and padding
 *
 * 3. Small Desktop (1024px - 1399px):
 *    - Shows 6 quick categories
 *    - Button label: "Todas as categorias"
 *    - Optimized spacing
 *
 * 4. Large Desktop (≥ 1400px):
 *    - Shows all 11 quick categories
 *    - Button label: "Todas as categorias"
 *    - Full spacing
 */

export const RESPONSIVE_BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1200,
  LARGE_DESKTOP: 1400,
};

export const CATEGORIES_PER_SCREEN = {
  MOBILE: 0,
  TABLET: 4,
  SMALL_DESKTOP: 6,
  LARGE_DESKTOP: 11,
};

/**
 * Test scenarios for responsive behavior:
 */
export const TEST_SCENARIOS = [
  {
    screenWidth: 375,
    expected: {
      quickCategoriesCount: 0,
      buttonLabel: 'Categorias',
      screenSize: 'mobile',
      shouldShowQuickCategories: false,
    },
  },
  {
    screenWidth: 768,
    expected: {
      quickCategoriesCount: 4,
      buttonLabel: 'Todas as categorias',
      screenSize: 'tablet',
      shouldShowQuickCategories: true,
    },
  },
  {
    screenWidth: 1024,
    expected: {
      quickCategoriesCount: 6,
      buttonLabel: 'Todas as categorias',
      screenSize: 'desktop',
      shouldShowQuickCategories: true,
    },
  },
  {
    screenWidth: 1400,
    expected: {
      quickCategoriesCount: 11,
      buttonLabel: 'Todas as categorias',
      screenSize: 'desktop',
      shouldShowQuickCategories: true,
    },
  },
];
