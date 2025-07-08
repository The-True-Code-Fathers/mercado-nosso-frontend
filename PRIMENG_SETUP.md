# PrimeNG Setup Guide

## What has been configured:

### 1. Packages Installed

- `primeng` - The main PrimeNG library
- `primeicons` - PrimeNG icon library
- `@primeng/themes` - New PrimeNG theming system

### 2. Configuration Files Updated

#### `src/app/app.config.ts`

- Added `providePrimeNG()` with Aura theme configuration
- Added `provideAnimationsAsync()` for Angular animations (required by PrimeNG)

#### `src/styles.scss`

- Added PrimeIcons CSS import (only icons are needed with new theme system)

#### `src/app/app.component.ts`

- Imported commonly used PrimeNG modules:
  - `ButtonModule`
  - `CardModule`
  - `InputTextModule`

#### `src/app/app.component.html`

- Created a test page with various PrimeNG components to verify setup

## How to use PrimeNG in your components:

### 1. Import the module you need in your component:

```typescript
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  // ...
  imports: [ButtonModule, CardModule],
  // ...
})
```

### 2. Use the components in your template:

```html
<p-button label="Click me" severity="primary"></p-button> <p-card header="My Card">Card content</p-card>
```

## Available Components

PrimeNG provides 100+ components including:

- **Form Controls**: Button, InputText, Dropdown, Calendar, etc.
- **Data**: Table, DataView, Tree, etc.
- **Panels**: Card, Panel, Accordion, etc.
- **Overlays**: Dialog, Tooltip, Menu, etc.
- **File**: FileUpload
- **Menu**: MenuBar, Menu, ContextMenu, etc.
- **Charts**: Chart (with Chart.js integration)
- **Messages**: Toast, Message, etc.
- **Media**: Carousel, Galleria, Image, etc.
- **Misc**: Avatar, Badge, Chip, ProgressBar, etc.

## Documentation

Visit [PrimeNG Documentation](https://primeng.org/) for detailed component documentation and examples.

## Theme Customization

The current setup uses the Aura theme. You can:

1. Switch themes by changing the theme preset in `app.config.ts`
2. Enable dark mode by adding the `p-dark` class to your application
3. Create custom themes using the PrimeNG theme designer

## Development Server

Run `npm start` to start the development server and see your PrimeNG components in action!
