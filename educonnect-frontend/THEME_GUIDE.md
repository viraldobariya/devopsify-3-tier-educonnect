# EduConnect Premium Dark Theme Guide

## Overview
This document provides guidance on using the new premium dark theme classes and styling patterns implemented across the EduConnect application.

## Color Palette

### Primary Colors
- **Background Primary**: `#0a0a0a` (Deep black)
- **Background Secondary**: `#111111` (Dark gray)
- **Background Tertiary**: `#1a1a1a` (Lighter dark)
- **Background Card**: `#1f1f1f` (Card background)
- **Background Elevated**: `#252525` (Elevated elements)

### Accent Colors
- **Gold Primary**: `#d4af37` (Main gold accent)
- **Gold Light**: `#e6c653` (Hover states)
- **Gold Dark**: `#b8941f` (Active states)
- **Royal Blue**: `#4169e1` (Secondary accent)

### Text Colors
- **Text Primary**: `#ffffff` (Main text)
- **Text Secondary**: `#e5e5e5` (Secondary text)
- **Text Muted**: `#a1a1a1` (Muted text)
- **Text Disabled**: `#6b7280` (Disabled text)

## CSS Custom Classes

### Buttons
```css
.btn-premium        /* Primary gold button with glow effect */
.btn-secondary      /* Glass effect secondary button */
```

### Cards
```css
.card-glass         /* Glassmorphism card with backdrop blur */
.card-elevated      /* Solid dark card with shadow */
```

### Form Elements
```css
.input-premium      /* Premium styled input with focus effects */
.select-premium     /* Premium styled select dropdown */
.checkbox-premium   /* Custom checkbox with gold accent */
```

### Typography & Layout
```css
.form-label         /* Premium form labels */
.form-error         /* Error message styling */
.form-success       /* Success message styling */
.badge-premium      /* Gold accent badges */
.badge-secondary    /* Secondary gray badges */
```

### Animations
```css
.fade-in            /* Fade in animation */
.slide-up           /* Slide up animation */
.scale-in           /* Scale in animation */
```

## Font Usage

### Primary Font
- **Inter**: Used for body text, UI elements, and most content
- Classes: `font-body` (or default)

### Display Font
- **Playfair Display**: Used for headings and brand text
- Classes: `font-display`

### Alternative
- **Poppins**: Available for special use cases
- Classes: `font-alt`

## Component Examples

### Premium Button
```jsx
<button className="btn-premium">
  <Icon className="w-5 h-5" />
  Click Me
</button>
```

### Premium Card
```jsx
<div className="card-glass p-8">
  <h3 className="text-white font-bold mb-4">Card Title</h3>
  <p className="text-gray-300">Card content...</p>
</div>
```

### Premium Input
```jsx
<input 
  type="text" 
  className="input-premium" 
  placeholder="Enter text..."
/>
```

### Page Layout Pattern
```jsx
<div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
  {/* Background Elements */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl"></div>
    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
  </div>
  
  {/* Content */}
  <div className="relative z-10">
    {/* Your content here */}
  </div>
</div>
```

## Loading States

### Premium Loading Animation
```jsx
<div className="loading-dots">
  <div></div>
  <div></div>
  <div></div>
  <div></div>
</div>
```

## Best Practices

### 1. Consistent Spacing
- Use Tailwind's spacing scale consistently
- Cards should have `p-6` or `p-8` for padding
- Sections should have `py-16` or `py-24` for vertical spacing

### 2. Animation Timing
- Use `duration-300` for quick interactions (hover, focus)
- Use `duration-500` for component transitions
- Use `duration-1000` for page transitions

### 3. Color Usage
- Gold accent for primary actions and highlights
- White text for headings and important content
- Gray variants for secondary content
- Blue accent sparingly for special cases

### 4. Typography Hierarchy
```jsx
// Page Title
<h1 className="text-5xl font-bold font-display text-white">

// Section Title  
<h2 className="text-3xl font-bold font-display text-white">

// Card Title
<h3 className="text-xl font-bold text-white">

// Body Text
<p className="text-gray-300 leading-relaxed">

// Muted Text
<p className="text-gray-400">
```

### 5. Responsive Design
- Always test components on mobile devices
- Use responsive Tailwind classes (`md:`, `lg:`, etc.)
- Ensure touch targets are at least 44px on mobile

## Common Patterns

### Hero Section
```jsx
<section className="py-32 text-center bg-gradient-to-b from-yellow-900/10 via-transparent to-transparent relative overflow-hidden">
  <div className="slide-up">
    <h1 className="text-6xl font-bold font-display text-white mb-8">
      <span className="text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text">
        Premium
      </span>
      Title
    </h1>
  </div>
</section>
```

### Modal Pattern
```jsx
<div className="modal-overlay">
  <div className="modal-content p-8 max-w-md w-full">
    {/* Modal content */}
  </div>
</div>
```

### Navigation Link
```jsx
<Link to="/path" className="nav-link">
  <Icon className="w-5 h-5" />
  Link Text
</Link>
```

## File Structure

The theme is implemented across these key files:
- `src/index.css` - Global styles and CSS custom properties
- `src/components/Header.jsx` - Premium navigation
- `src/components/Footer.jsx` - Premium footer
- `src/layouts/MainLayout.jsx` - Main layout wrapper
- Individual page/component files for specific implementations

## Performance Considerations

- Background blur effects are optimized for modern browsers
- Animations use CSS transforms for better performance
- Images should be optimized and use proper loading strategies
- Consider reducing motion for users with accessibility preferences

## Accessibility

- Maintain proper color contrast ratios
- Ensure all interactive elements are keyboard accessible
- Use semantic HTML elements
- Provide alternative text for decorative elements
- Test with screen readers

---

For questions or suggestions about the theme implementation, please refer to the component files or consult the development team.
