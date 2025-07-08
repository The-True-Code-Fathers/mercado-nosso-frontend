# Design System Documentation

## 🎨 Color Palette

### Brand Colors

```css
--color-primary: #1B5E20 (Green - Main brand color)
--color-primary-light: #43A047 (Lighter green for hovers/accents)
--color-secondary: #FFB300 (Amber - Secondary brand color)
--color-secondary-dark: #F9A825 (Darker amber for hovers)
```

### Background Colors

```css
--color-bg: #FEFCF9 (Main background - warm white)
--color-surface: #FFFFFF (Card/surface background)
--color-elevation-1: #F5F5F5 (First elevation level)
--color-elevation-2: #EEEEEE (Second elevation level)
```

### Text Colors

```css
--color-text-primary: #212121 (Main text color)
--color-text-secondary: #757575 (Secondary text color)
--color-link: #1B5E20 (Link color - matches primary)
```

### Border & Status Colors

```css
--color-border: #E0E0E0 (Default border color)
--color-success: #4CAF50 (Success states)
--color-error: #E53935 (Error states)
--color-warning: #FB8C00 (Warning states)
--color-info: #039BE5 (Info states)
```

## 🌙 Dark Mode Colors

All colors automatically switch in dark mode with appropriate contrast ratios.

### Dark Mode Brand Colors

```css
--color-primary: #81C784 (Lighter green for dark backgrounds)
--color-primary-light: #A5D6A7 (Even lighter for hovers)
--color-secondary: #FFD54F (Lighter amber)
--color-secondary-dark: #FFB300 (Darker amber)
```

### Dark Mode Backgrounds

```css
--color-bg: #121212 (Dark background)
--color-surface: #1E1E1E (Dark surface)
--color-elevation-1: #2C2C2C (Dark elevation 1)
--color-elevation-2: #3A3A3A (Dark elevation 2)
```

## 📏 Spacing System

```css
--spacing-xs: 0.25rem (4px)
--spacing-sm: 0.5rem (8px)
--spacing-md: 1rem (16px)
--spacing-lg: 1.5rem (24px)
--spacing-xl: 2rem (32px)
--spacing-2xl: 3rem (48px)
```

### Usage Examples

```html
<div class="p-md">Padding medium</div>
<div class="mb-lg">Margin bottom large</div>
<div class="mt-xl">Margin top extra large</div>
```

## 🔄 Border Radius System

```css
--radius-sm: 4px (Small radius)
--radius-md: 8px (Medium radius - default)
--radius-lg: 12px (Large radius)
--radius-xl: 16px (Extra large radius)
```

### Usage Examples

```html
<div class="rounded-md">Medium border radius</div>
<div class="rounded-lg">Large border radius</div>
```

## 🎭 Shadow System

```css
--shadow-sm: Subtle shadow for small elements
--shadow-md: Medium shadow for cards
--shadow-lg: Large shadow for elevated elements
--shadow-xl: Extra large shadow for modals/overlays
```

### Usage Examples

```html
<div class="shadow-md">Card with medium shadow</div>
<div class="shadow-xl">Modal with large shadow</div>
```

## 🔤 Typography

### Font Families

- **Headings**: 'Poppins' - Modern, clean, professional
- **Body Text**: 'Inter' - Excellent readability, UI optimized

### Heading Scale

```css
h1: 2.25rem (36px) - font-weight: 700
h2: 1.875rem (30px) - font-weight: 600
h3: 1.5rem (24px) - font-weight: 600
```

### Text Utility Classes

```css
.text-body - Primary text color .text-muted - Secondary text color .text-primary - Brand primary color .text-secondary - Brand secondary color .text-success - Success color .text-error - Error color .text-warning - Warning color .text-info - Info color;
```

## 🎨 Background Utility Classes

```css
.bg-primary - Primary brand background .bg-secondary - Secondary brand background .bg-surface - Surface background .bg-elevation-1 - First elevation background .bg-elevation-2 - Second elevation background;
```

## 🌗 Theme Switching

### Automatic Theme Detection

The system automatically:

- Detects saved user preference
- Applies appropriate theme on load
- Persists theme choice in localStorage

### Manual Theme Toggle

```typescript
// Toggle between light and dark mode
toggleTheme() {
  this.isDarkMode = !this.isDarkMode;
  this.applyTheme();
  localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
}
```

### CSS Custom Properties Benefits

- ✅ Automatic color switching
- ✅ Consistent across all components
- ✅ Easy to maintain and extend
- ✅ Performance optimized
- ✅ No JavaScript required for styling

## 🧩 Component Integration

### PrimeNG Components

All PrimeNG components are automatically styled with the design system:

```typescript
// Import components as usual
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { InputTextModule } from "primeng/inputtext";
```

```html
<!-- Components automatically use design system colors -->
<p-button label="Primary" severity="primary"></p-button>
<p-card header="Card Title">Content</p-card>
<input pInputText placeholder="Input field" />
```

## 🚀 Best Practices

### 1. Use CSS Custom Properties

```css
/* ✅ Good */
background-color: var(--color-primary);

/* ❌ Avoid */
background-color: #1b5e20;
```

### 2. Use Utility Classes

```html
<!-- ✅ Good -->
<div class="bg-surface shadow-md rounded-lg p-lg">
  <!-- ❌ Avoid inline styles -->
  <div style="background: white; box-shadow: ...; border-radius: ...;"></div>
</div>
```

### 3. Consistent Spacing

```html
<!-- ✅ Good -->
<div class="mb-md p-lg">
  <!-- ❌ Avoid arbitrary values -->
  <div style="margin-bottom: 13px; padding: 22px;"></div>
</div>
```

### 4. Semantic Color Usage

```html
<!-- ✅ Good -->
<p class="text-success">Operation successful</p>
<p class="text-error">Error occurred</p>

<!-- ❌ Avoid -->
<p style="color: green;">Success</p>
```

## 📱 Responsive Considerations

The design system is built mobile-first and works seamlessly across all device sizes. All spacing, typography, and components automatically adapt to different screen sizes.

## 🔧 Extending the System

### Adding New Colors

```css
:root {
  --color-accent: #9c27b0;
}

.dark {
  --color-accent: #ce93d8;
}
```

### Adding New Spacing

```css
:root {
  --spacing-3xl: 4rem;
  --spacing-4xl: 6rem;
}
```

### Creating Custom Utility Classes

```css
.text-accent {
  color: var(--color-accent);
}
.bg-accent {
  background-color: var(--color-accent);
}
.p-3xl {
  padding: var(--spacing-3xl);
}
```

This design system provides a solid foundation for building consistent, beautiful, and maintainable user interfaces! 🎉
