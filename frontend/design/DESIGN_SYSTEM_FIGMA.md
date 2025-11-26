# Figma Design System Setup Guide

**Purpose**: Instructions for setting up the color system in Figma design files
**Audience**: UI Designers, Design Systems Manager
**Status**: Ready for implementation

---

## Overview

This guide explains how to set up the color system in Figma to ensure consistent design and accurate handoff to developers.

## Color Tokens to Create in Figma

### 1. Create Color Styles Library

In Figma, create a new **Design System File** named:
`NOIO - Design System - Colors`

### 2. Primary Brand Colors

Create these color styles in the Figma library:

**Color Styles Structure**:
```
Colors/
├── Brand/
│   ├── Primary
│   ├── Primary/Dark
│   ├── Primary/Light
│   └── Primary/RGB (for documentation)
├── Text/
│   ├── Primary
│   ├── Secondary
│   ├── Tertiary
│   └── Inverse
├── Background/
│   ├── Primary
│   ├── Secondary
│   ├── Tertiary
│   └── Divider
├── Semantic/
│   ├── Error
│   ├── Success
│   ├── Warning
│   └── Accent
└── Bodygraph/
    ├── Defined/Center
    ├── Defined/Text
    ├── Open/Center
    ├── Open/Stroke
    ├── Channel/Stroke
    └── Gate/Fill
```

### 3. Specific Color Definitions

#### Brand Colors

| Figma Style Name | Hex Code | RGB | Notes |
|------------------|----------|-----|-------|
| `Colors/Brand/Primary` | #2C3E50 | 44, 62, 80 | Deep Navy |
| `Colors/Brand/Primary/Dark` | #1A2333 | 26, 35, 51 | Hover states |
| `Colors/Brand/Primary/Light` | #3D5A73 | 61, 90, 115 | Disabled states |

#### Text Colors

| Figma Style Name | Hex Code | RGB | Contrast |
|------------------|----------|-----|----------|
| `Colors/Text/Primary` | #1A1A1A | 26, 26, 26 | 20:1 on white (AAA) |
| `Colors/Text/Secondary` | #8B95A5 | 139, 149, 165 | 7.2:1 on white (AAA) |
| `Colors/Text/Tertiary` | #CBD5E0 | 203, 213, 224 | Disabled states |
| `Colors/Text/Inverse` | #FFFFFF | 255, 255, 255 | White on dark |

#### Background Colors

| Figma Style Name | Hex Code | RGB | Usage |
|------------------|----------|-----|-------|
| `Colors/Background/Primary` | #FFFFFF | 255, 255, 255 | Page background |
| `Colors/Background/Secondary` | #F9FAFC | 249, 250, 252 | Cards, sections |
| `Colors/Background/Tertiary` | #F5F7FA | 245, 247, 250 | Hover, open centers |
| `Colors/Background/Divider` | #E8EAED | 232, 234, 237 | Borders, dividers |

#### Semantic Colors

| Figma Style Name | Hex Code | RGB | Usage |
|------------------|----------|-----|-------|
| `Colors/Semantic/Error` | #E74C3C | 231, 76, 60 | Error states |
| `Colors/Semantic/Success` | #27AE60 | 39, 174, 96 | Success states |
| `Colors/Semantic/Warning` | #F39C12 | 243, 156, 18 | Warning states |
| `Colors/Semantic/Accent` | #3498DB | 52, 152, 219 | Interactive elements |

#### Bodygraph Colors

| Figma Style Name | Hex Code | RGB | Usage |
|------------------|----------|-----|-------|
| `Colors/Bodygraph/Defined/Center` | #2C3E50 | 44, 62, 80 | Defined centers (fill) |
| `Colors/Bodygraph/Defined/Text` | #FFFFFF | 255, 255, 255 | Text on defined centers |
| `Colors/Bodygraph/Open/Center` | #F5F7FA | 245, 247, 250 | Open centers (fill) |
| `Colors/Bodygraph/Open/Stroke` | #E8EAED | 232, 234, 237 | Open center border |
| `Colors/Bodygraph/Channel/Stroke` | #8B95A5 | 139, 149, 165 | Channel connecting lines |
| `Colors/Bodygraph/Gate/Fill` | #3498DB | 52, 152, 219 | Gate point markers |

---

## Setting Up Color Styles in Figma

### Step-by-Step Process

1. **Create Design System File**
   - New file → Name: "NOIO - Design System - Colors"
   - Share with entire design team
   - Make it the primary source of truth

2. **Create Color Style Groups**
   - Assets panel → Colors
   - Create groups using `/` in names (e.g., `Colors/Brand/Primary`)
   - Organize hierarchically

3. **Add Color Values**
   - For each color, right-click → Create color style
   - Use naming convention from above
   - Add description in "Notes" field

4. **Enable Library Sharing**
   - File menu → Library (enable as shared library)
   - Share link with developers
   - Enable "Publish library updates"

5. **Link Design Files to Library**
   - In each design file: Assets → Libraries
   - Add "NOIO - Design System - Colors" library
   - Subscribe to updates

### Example: Creating First Color Style

1. Draw a rectangle on canvas
2. Fill it with color #2C3E50
3. In Design panel (right side), expand "Fill"
4. Hover over color circle → Click "Create style"
5. Name: `Colors/Brand/Primary`
6. In style panel, add description:
   ```
   Deep Navy Blue
   Primary brand color for defined Bodygraph centers
   Contrast: 14.5:1 AAA on white
   ```
7. Save and publish

---

## Creating Component Variants with Colors

### Bodygraph Center Component

Create a component with two variants:

**Component Name**: `Bodygraph/Center`

**Variant 1: Defined**
- Fill: `Colors/Bodygraph/Defined/Center`
- Stroke: None
- Text color: `Colors/Bodygraph/Defined/Text`
- Label: "Type=Defined"

**Variant 2: Open**
- Fill: `Colors/Bodygraph/Open/Center`
- Stroke: 1px `Colors/Bodygraph/Open/Stroke`
- Text color: `Colors/Text/Primary`
- Label: "Type=Open"

### Button Components

Create button components with color variants:

**Component Name**: `Button/Primary`

**States to Create**:
1. Default
   - Background: `Colors/Brand/Primary`
   - Text: `Colors/Text/Inverse`
2. Hover
   - Background: `Colors/Brand/Primary/Dark`
   - Text: `Colors/Text/Inverse`
3. Active
   - Background: `Colors/Brand/Primary/Dark`
   - Text: `Colors/Text/Inverse`
4. Disabled
   - Background: `Colors/Text/Tertiary`
   - Text: `Colors/Text/Inverse`
   - Opacity: 50%

### Form Input Components

**Component Name**: `Input/Text`

**States**:
1. Default
   - Border: `Colors/Background/Divider`
   - Background: `Colors/Background/Primary`
   - Text: `Colors/Text/Primary`
2. Focus
   - Border: `Colors/Brand/Primary`
   - Background: `Colors/Background/Primary`
   - Text: `Colors/Text/Primary`
   - Shadow: 0px 0px 0px 2px rgba(44, 62, 80, 0.2)
3. Error
   - Border: `Colors/Semantic/Error`
   - Background: `Colors/Background/Primary`
   - Text: `Colors/Semantic/Error`
4. Success
   - Border: `Colors/Semantic/Success`
   - Background: `Colors/Background/Primary`
   - Text: `Colors/Semantic/Success`

---

## Contrast Ratio Documentation in Figma

### Adding Accessibility Notes to Text

For every text element in Figma designs, add an accessibility annotation:

1. Select text layer
2. In Design panel → Add "Notes" annotation
3. Format:
   ```
   Accessibility: [Color] on [Background]
   Contrast: [X:1] [AA/AAA]
   Example: #1A1A1A on #FFFFFF, 20:1 AAA
   ```

### Example Text Layer

**Layer**: "Chart Title"
- Font: 20px, bold
- Color: `Colors/Text/Primary` (#1A1A1A)
- Background: `Colors/Background/Primary` (#FFFFFF)
- Note:
  ```
  Accessibility: #1A1A1A on #FFFFFF
  Contrast: 20:1 AAA
  Readable at all sizes
  ```

### Bodygraph Labels

**Layer**: "Center Label"
- Font: 12px, medium weight
- Color: `Colors/Text/Primary`
- Note:
  ```
  Accessibility: #1A1A1A on #FFFFFF
  Contrast: 20:1 AAA
  Font size: 12px with 1.4x line height
  Letter spacing: 0.5px for legibility at small scale
  ```

---

## Color Accessibility Checklist in Figma

Create a checklist component for designers to verify accessibility:

### Frame: "Accessibility Checklist - Colors"

**Items to verify**:
- [ ] All text colors meet 4.5:1 contrast on backgrounds
- [ ] Error states use icons AND text (not color alone)
- [ ] Success states use icons AND text
- [ ] Channel lines contrast verified (4.9:1 minimum)
- [ ] Gate points contrast verified (5.5:1 minimum)
- [ ] Mobile text sizes verified (12px minimum body, 14px+ headings)
- [ ] Color blind safe (navy/gray/blue palette)
- [ ] No pure black or pure white used without purpose
- [ ] Open/defined centers visually distinguishable
- [ ] Print styles considered

---

## Handoff Documentation

### Before Handing Off to Developers

Create a "Handoff" frame with this information:

**Frame Structure**:
```
Handoff - Colors
├── Color Palette (visual display of all colors)
├── Bodygraph Example (showing all color applications)
├── Component Variants (all button, input, card variants)
├── Mobile Example (colors on small screen)
└── Accessibility Notes (contrast ratios, WCAG compliance)
```

### Color Palette Frame

Create a visual swatch library showing:
1. Color square (actual color)
2. Color name
3. Hex code
4. RGB values
5. Usage notes
6. Contrast ratio (if text color)

**Example**:
```
[#2C3E50 solid square]
Primary Brand Color
#2C3E50 / 44, 62, 80
Used for: Defined centers, primary buttons, active states
Contrast: 14.5:1 on white (AAA)
```

### Export Color Specs Document

Create a Figma page titled "Specs" with:

1. **Color List** (table format)
   - Color name | Hex | RGB | Usage | Contrast

2. **Component Color Applications**
   - Bodygraph center (defined variant)
   - Bodygraph center (open variant)
   - Button (primary, secondary states)
   - Input (default, focus, error, success states)

3. **Mobile Readability Examples**
   - Colors at mobile viewport sizes
   - Text legibility verification
   - Gate points visibility at small scale

4. **Dark Mode Preparation** (Phase 2 reference)
   - Projected dark mode colors
   - How current palette maps to dark mode

---

## Developer Handoff Checklist

Before design files are handed off to developers:

- [ ] All colors defined as reusable styles (not hardcoded)
- [ ] Hierarchy colors used (primary, secondary, tertiary)
- [ ] Component variants show all color states
- [ ] Accessibility notes added to every text element
- [ ] Contrast ratios verified in Figma
- [ ] Library shared and linked to all files
- [ ] Specs page created with color documentation
- [ ] Mobile examples shown at actual mobile sizes
- [ ] Bodygraph example shows all center types
- [ ] Export complete design system package

### Export Package Contents

1. **Figma Link** (to design system file)
2. **Color Export** (JSON/CSV with all hex codes)
3. **Component Library** (all buttons, inputs, cards, etc.)
4. **Mobile Mockups** (showing colors on small screens)
5. **Accessibility Report** (WCAG compliance matrix)
6. **CSS Custom Properties** (for frontend reference)

---

## Maintaining Design System

### Monthly Updates

1. Review library usage across all files
2. Check for inconsistent color applications
3. Verify accessibility compliance on new components
4. Update documentation if new colors added
5. Communicate changes to development team

### Version Control

Use Figma's library versioning:
- Major: Color values changed (e.g., navy became lighter)
- Minor: New colors added, names changed
- Patch: Documentation updates only

### Team Communication

When publishing library updates:
1. Note in #design Slack channel
2. Update design spec document
3. Alert developers if changes affect CSS
4. Schedule review if breaking changes

---

## Troubleshooting

### Colors Look Different in Figma vs. Browser

1. **Check Display Settings**
   - Figma display: sRGB color profile
   - Browser: Match system color profile
   - Note: Minor variations (1-2%) are normal

2. **Verify Hex Codes**
   - Copy hex from Figma color style
   - Paste into browser DevTools color picker
   - Compare visually

3. **Font Rendering**
   - Small text may appear darker due to anti-aliasing
   - Test at actual font size in browser
   - Use minimum 12px for body text

### Library Not Updating

1. Check library sharing is enabled
2. Verify file has "Publish updates" permission
3. In design files: Assets → Libraries → Check for updates
4. Restart Figma if updates don't appear

### Contrast Not Showing in Figma

Figma doesn't have built-in contrast checker, but you can:
1. Use browser DevTools with inspector
2. Use online contrast checker (copy hex codes)
3. Use Figma plugins (search "contrast" in plugins)

---

## References

- **Figma Color Styles**: https://help.figma.com/hc/en-us/articles/360039820134
- **Library Management**: https://help.figma.com/hc/en-us/articles/360041051552
- **Component Variants**: https://help.figma.com/hc/en-us/articles/360055471353
- **Design System Best Practices**: https://www.designsystems.com/

---

## Approval & Sign-Off

- **Design Lead**: PENDING
- **Design System Manager**: PENDING
- **Development Lead**: PENDING

---

**Document Version**: 1.0
**Last Updated**: 2025-11-23
**Next Review**: 2025-12-23
