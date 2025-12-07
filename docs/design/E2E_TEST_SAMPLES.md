# End-to-End Test Plan: Human Design Chart Generator

**Document Purpose**: Comprehensive E2E testing plan with sample birth data sets and manual testing checklist
**Created**: 2025-11-26
**Test Environment**: Frontend (Next.js) + Backend (FastAPI) + External HD API
**Target Performance**: <3 seconds chart generation, 100% data accuracy

---

## 1. Sample Birth Data Sets

The following sample birth data sets cover different Type/Authority/Profile combinations to ensure comprehensive testing of the chart generation system.

### Test Case 1: Manifestor with Emotional Authority

**Profile**: Manifestor, Emotional Authority, Profile 1/3
**Test Purpose**: Verify Manifestor type rendering and Emotional Authority decision hints

```
firstName: "Max"
birthDate: "15.03.1990"
birthTime: "14:30"
birthPlace: "Berlin, Germany"
```

**Expected Chart Elements**:
- Type: Manifestante (Italian) with German description about initiating and informing
- Authority: Emotional Authority with decision hint about waiting through emotional wave
- Profile: 1/3 with description about investigator/martyr energy
- Centers: Mix of defined/open centers (Kehlzentrum likely defined for Manifestor)
- Channels: Variable count based on defined gates
- Gates: Distributed between conscious/unconscious
- Bodygraph: SVG rendering with defined centers in Deep Navy Blue (#2C3E50)
- Incarnation Cross: 4 gates displayed with name
- Impulse: Personalized German message

---

### Test Case 2: Generator with Sacral Authority

**Profile**: Generator, Sacral Authority, Profile 4/6
**Test Purpose**: Verify Generator type and Sacral Authority rendering

```
firstName: "Anna"
birthDate: "22.07.1985"
birthTime: "09:15"
birthPlace: "München, Germany"
```

**Expected Chart Elements**:
- Type: Generatore (Italian) with German description about responding and sustainable work
- Authority: Sacral Authority with decision hint about gut response
- Profile: 4/6 with description about opportunist/role model energy
- Centers: Sakral center MUST be defined (Generator requirement)
- Channels: Include at least one channel connected to Sacral
- Gates: Gate distribution showing Sacral activation
- Bodygraph: Sakral center filled with navy blue, connected channels visible
- Incarnation Cross: 4 gates with cross name
- Impulse: German personalized message

---

### Test Case 3: Manifestor Generator with Emotional Authority

**Profile**: Manifesting Generator, Emotional Authority, Profile 5/1
**Test Purpose**: Verify dual-type (Manifestor Generator) rendering

```
firstName: "Sophie"
birthDate: "03.11.1992"
birthTime: "18:45"
birthPlace: "Hamburg, Germany"
```

**Expected Chart Elements**:
- Type: Manifestante Generatore (Italian) with German description about multi-passionate energy
- Authority: Emotional Authority with decision hint about waiting for clarity
- Profile: 5/1 with description about heretic/investigator energy
- Centers: Sakral defined + channel to throat (Motor to Throat connection)
- Channels: Motor-to-Throat channel activation (34-20, 20-57, etc.)
- Gates: Activation pattern showing Generator + Manifestor qualities
- Bodygraph: Motor centers connected to throat
- Incarnation Cross: 4 gates with cross name
- Impulse: German personalized message

---

### Test Case 4: Projector with Splenic Authority

**Profile**: Projector, Splenic Authority, Profile 2/4
**Test Purpose**: Verify Projector type with Splenic Authority (in-the-moment knowing)

```
firstName: "Lukas"
birthDate: "18.05.1988"
birthTime: "06:20"
birthPlace: "Köln, Germany"
```

**Expected Chart Elements**:
- Type: Proiettore (Italian) with German description about guidance and waiting for invitation
- Authority: Splenic Authority with decision hint about spontaneous knowing
- Profile: 2/4 with description about hermit/opportunist energy
- Centers: Sakral center MUST be open/undefined (Projector requirement)
- Channels: NO motor-to-throat channels (Projector requirement)
- Gates: Distribution showing non-Sacral being
- Bodygraph: Open Sakral center (light blue-gray #F5F7FA)
- Incarnation Cross: 4 gates with cross name
- Impulse: German personalized message

---

### Test Case 5: Reflector with Lunar Authority

**Profile**: Reflector, Lunar Authority, Profile 6/2
**Test Purpose**: Verify rarest type (Reflector) with Lunar Authority

```
firstName: "Marie"
birthDate: "29.12.1995"
birthTime: "23:55"
birthPlace: "Frankfurt, Germany"
```

**Expected Chart Elements**:
- Type: Riflettore (Italian) with German description about mirrors and lunar cycle
- Authority: Lunar Authority with decision hint about waiting full lunar cycle (28 days)
- Profile: 6/2 with description about role model/hermit energy
- Centers: ALL 9 centers MUST be open/undefined (Reflector requirement)
- Channels: NO defined channels (Reflector requirement)
- Gates: Only hanging gates (no channel connections)
- Bodygraph: All centers light blue-gray (#F5F7FA), no filled centers
- Incarnation Cross: 4 gates with cross name
- Impulse: German personalized message

---

### Test Case 6: Generator with Ego Authority

**Profile**: Generator, Ego Authority, Profile 3/5
**Test Purpose**: Verify rare Ego Authority (Heart/Ego center projected)

```
firstName: "Jonas"
birthDate: "07.09.1987"
birthTime: "12:00"
birthPlace: "Stuttgart, Germany"
```

**Expected Chart Elements**:
- Type: Generatore (Italian) with Generator description
- Authority: Ego Authority with decision hint about willpower and commitment
- Profile: 3/5 with description about martyr/heretic energy
- Centers: Herz/Ego center defined and connected to throat or G-center
- Channels: Channel 25-51 (Ego to G) or 21-45 (Ego to Throat)
- Gates: Ego center activation visible
- Bodygraph: Herz/Ego center filled navy blue
- Incarnation Cross: 4 gates with cross name
- Impulse: German personalized message

---

### Test Case 7: Approximate Birth Time (Unknown Time)

**Profile**: Any Type, Testing birthTimeApproximate flag
**Test Purpose**: Verify handling of unknown/approximate birth time (uses 12:00 default)

```
firstName: "Lisa"
birthDate: "14.02.1991"
birthTime: "" (empty)
birthTimeApproximate: true
birthPlace: "Düsseldorf, Germany"
```

**Expected Behavior**:
- Backend receives birthTime: "12:00" (auto-filled by frontend)
- Chart generates successfully with noon calculation
- Note/warning displayed about approximate time affecting accuracy
- All chart sections display normally
- Email capture still works

---

### Test Case 8: Edge Case - Very Early Birth Time

**Profile**: Testing early morning edge case
**Test Purpose**: Verify timezone handling for early morning births

```
firstName: "Tom"
birthDate: "01.01.2000"
birthTime: "00:05"
birthPlace: "Leipzig, Germany"
```

**Expected Behavior**:
- Correct timezone conversion (Europe/Berlin)
- No date boundary errors (midnight crossing)
- Accurate Sun position calculation
- Chart generates within 3 seconds

---

## 2. Frontend Component Verification

### ChartForm Component (/frontend/app/page.tsx, /frontend/components/ChartForm.tsx)

**Required Fields Check**:
- [x] firstName input field (type: text, validation: 2-50 chars)
- [x] birthDate input field (type: text, format: TT.MM.JJJJ, placeholder: "23.11.1992")
- [x] birthTime input field (type: text, format: HH:MM, placeholder: "14:30")
- [x] birthTimeApproximate checkbox (disables birthTime field when checked)
- [x] birthPlace input field (type: text, validation: 2-200 chars, placeholder: "Berlin, Germany")
- [x] Submit button with loading state ("Generiere..." when loading)

**German Language Validation**:
- [x] All labels in German (LABELS from /frontend/utils/constants.ts)
- [x] Error messages in German (ERROR_MESSAGES)
- [x] Placeholders in German (PLACEHOLDERS)
- [x] No English text visible to users

**Error Message Display**:
- [x] Individual field errors appear below each field
- [x] Error text color: Alert Red (#E74C3C)
- [x] Error border color on input fields
- [x] Global error message displayed if API fails (red box at bottom)

**Loading States**:
- [x] Submit button disabled during loading
- [x] Button text changes to "Generiere..." during submission
- [x] Button opacity reduced (disabled:opacity-50)
- [x] Cursor changes to not-allowed (disabled:cursor-not-allowed)

**Validation Tests**:
| Test Case | Input | Expected Error |
|-----------|-------|----------------|
| Empty firstName | "" | "Bitte geben Sie einen gültigen Namen ein (2-50 Zeichen)." |
| Short firstName | "A" | "Bitte geben Sie einen gültigen Namen ein (2-50 Zeichen)." |
| Invalid date format | "15-03-1990" | "Ungültiges Datumsformat. Bitte verwenden Sie TT.MM.JJJJ." |
| Invalid time format | "14.30" | "Ungültiges Zeitformat. Bitte verwenden Sie HH:MM." |
| Empty birthPlace | "" | "Dieses Feld ist erforderlich." |
| Valid form | All fields correct | No errors, form submits |

---

## 3. Expected Chart Output Structure

### All 9 Required Sections (ChartDisplay Component)

**Display Order** (per /frontend/components/ChartDisplay.tsx):
1. **Type Section** - TypeSection.tsx
2. **Authority Section** - AuthoritySection.tsx
3. **Profile Section** - ProfileSection.tsx
4. **Centers Section** - CentersSection.tsx
5. **Channels Section** - ChannelsSection.tsx
6. **Gates Section** - GatesSection.tsx
7. **Incarnation Cross Section** - IncarnationCrossSection.tsx
8. **Bodygraph Section** - Bodygraph.tsx
9. **Impulse Section** - ImpulseSection.tsx
10. **Email Capture Section** - EmailCaptureSection.tsx (appears at bottom)

### Performance Requirements

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Chart Generation Time | <2 seconds | <3 seconds (MUST NOT exceed) |
| Bodygraph SVG Render | <500ms | <1 second |
| Layout Shift (CLS) | <0.1 | <0.25 |
| First Contentful Paint | <1 second | <2 seconds |
| Time to Interactive | <2 seconds | <3 seconds |

### Bodygraph SVG Requirements

**Visual Verification**:
- [x] All 9 centers visible (Kopf, Ajna, Kehlzentrum, G-Zentrum, Herz/Ego, Sakral, Wurzel, Milz, Solarplexus)
- [x] Defined centers filled with Deep Navy Blue (#2C3E50)
- [x] Open centers filled with Light Blue-Gray (#F5F7FA)
- [x] Channels rendered as Steel Gray lines (#8B95A5)
- [x] Gate points rendered as Bright Blue circles (#3498DB)
- [x] No layout shift during rendering (reserved space)
- [x] Responsive scaling on mobile (375px-480px)
- [x] No pixelation on zoom (SVG vector scaling)
- [x] Accessible screen reader support (title elements)

**Mobile Responsiveness** (iPhone SE 375px reference):
- [x] SVG scales proportionally without overflow
- [x] All text labels readable without zoom
- [x] Touch targets >44px for accessibility
- [x] No horizontal scrolling required
- [x] Bodygraph centered in viewport

---

## 4. Manual Testing Checklist

### Pre-Test Setup

- [ ] Backend running at http://localhost:8000 (or production URL)
- [ ] Frontend running at http://localhost:3000 (or production URL)
- [ ] External HD API credentials configured (HumanDesign.ai API key)
- [ ] PostgreSQL database accessible (email capture working)
- [ ] Browser DevTools open (Network, Console tabs)
- [ ] Performance profiler enabled (Lighthouse ready)

---

### Test Phase 1: Form Validation

**Test 1.1: Empty Form Submission**
- [ ] Navigate to homepage
- [ ] Click "Chart Generieren" without entering any data
- [ ] **VERIFY**: All required field errors appear in German
- [ ] **VERIFY**: Form does not submit
- [ ] **VERIFY**: No API call made (check Network tab)

**Test 1.2: Invalid Date Format**
- [ ] Enter: firstName="Test", birthDate="15-03-1990" (wrong format)
- [ ] Click submit
- [ ] **VERIFY**: Error "Ungültiges Datumsformat. Bitte verwenden Sie TT.MM.JJJJ."
- [ ] **VERIFY**: Input border turns red

**Test 1.3: Invalid Time Format**
- [ ] Enter: birthTime="14.30" (wrong format)
- [ ] Click submit
- [ ] **VERIFY**: Error "Ungültiges Zeitformat. Bitte verwenden Sie HH:MM."
- [ ] **VERIFY**: Input border turns red

**Test 1.4: birthTimeApproximate Checkbox**
- [ ] Check "Geburtszeit ungefähr / unbekannt" checkbox
- [ ] **VERIFY**: birthTime input field becomes disabled (grayed out)
- [ ] **VERIFY**: birthTime input shows placeholder text grayed
- [ ] Uncheck checkbox
- [ ] **VERIFY**: birthTime field becomes enabled again

**Test 1.5: Name Length Validation**
- [ ] Enter: firstName="A" (too short)
- [ ] Click submit
- [ ] **VERIFY**: Error about 2-50 character requirement
- [ ] Enter: firstName="Max" (valid)
- [ ] **VERIFY**: Error clears immediately

---

### Test Phase 2: Successful Chart Generation

**Test 2.1: Standard Chart Generation (Manifestor)**
- [ ] Use Test Case 1 data (Max, 15.03.1990, 14:30, Berlin)
- [ ] Click "Chart Generieren"
- [ ] **MEASURE**: Start timer
- [ ] **VERIFY**: Button shows "Generiere..." and is disabled
- [ ] **VERIFY**: Chart appears within 3 seconds
- [ ] **MEASURE**: Stop timer, record duration: _______ seconds
- [ ] **VERIFY**: Page title changes to "Maxs Chart" (with 's after name)
- [ ] **VERIFY**: "Neues Chart" button appears top-right

**Test 2.2: Verify All 9 Chart Sections Display**
- [ ] **Type Section**: Shows "Dein Human Design Typ", Manifestante label, German description
- [ ] **Authority Section**: Shows "Deine innere Autorität", authority label, German decision hint
- [ ] **Profile Section**: Shows "Dein Profil", profile code (e.g., 1/3), German description
- [ ] **Centers Section**: Shows "Deine Zentren", list of 9 centers with Definiert/Offen labels
- [ ] **Channels Section**: Shows "Aktive Kanäle", list of channels (format: "XX-YY")
- [ ] **Gates Section**: Shows "Aktive Tore", two columns (Bewusst/Unbewusst)
- [ ] **Incarnation Cross Section**: Shows "Dein Inkarnationskreuz", cross name, 4 gates
- [ ] **Bodygraph Section**: Shows "Dein Bodygraph", SVG rendering
- [ ] **Impulse Section**: Shows "Ein Satz für dich", personalized German message

**Test 2.3: Bodygraph Visual Verification**
- [ ] **VERIFY**: SVG is visible and centered
- [ ] **VERIFY**: 9 centers all present (count them)
- [ ] **VERIFY**: Defined centers filled navy blue (#2C3E50)
- [ ] **VERIFY**: Open centers filled light gray (#F5F7FA)
- [ ] **VERIFY**: Channels appear as connecting lines
- [ ] **VERIFY**: No layout shift occurred (no content jump)
- [ ] **VERIFY**: Bodygraph is responsive (resize browser window)
- [ ] **VERIFY**: No pixelation when zooming in (vector scaling)

**Test 2.4: Email Capture Section**
- [ ] Scroll to bottom of chart display
- [ ] **VERIFY**: Email capture section appears
- [ ] **VERIFY**: Heading "Interesse an Business Reading?"
- [ ] **VERIFY**: Email input field with placeholder "deine@email.de"
- [ ] **VERIFY**: Submit button "Absenden"

---

### Test Phase 3: Different Type/Authority Combinations

**Test 3.1: Generator with Sacral Authority**
- [ ] Click "Neues Chart" to reset
- [ ] Use Test Case 2 data (Anna, 22.07.1985, 09:15, München)
- [ ] Submit form
- [ ] **VERIFY**: Type shows "Generatore" (Italian)
- [ ] **VERIFY**: Authority shows Sacral Authority
- [ ] **VERIFY**: Sakral center is DEFINED (navy blue)
- [ ] **VERIFY**: At least one channel connected to Sakral

**Test 3.2: Manifesting Generator**
- [ ] Click "Neues Chart" to reset
- [ ] Use Test Case 3 data (Sophie, 03.11.1992, 18:45, Hamburg)
- [ ] Submit form
- [ ] **VERIFY**: Type shows "Manifestante Generatore"
- [ ] **VERIFY**: Sakral center defined
- [ ] **VERIFY**: Motor-to-Throat channel present (34-20, 20-57, etc.)

**Test 3.3: Projector with Splenic Authority**
- [ ] Click "Neues Chart" to reset
- [ ] Use Test Case 4 data (Lukas, 18.05.1988, 06:20, Köln)
- [ ] Submit form
- [ ] **VERIFY**: Type shows "Proiettore"
- [ ] **VERIFY**: Authority shows Splenic Authority
- [ ] **VERIFY**: Sakral center is OPEN (light gray)
- [ ] **VERIFY**: NO motor-to-throat channels

**Test 3.4: Reflector with Lunar Authority**
- [ ] Click "Neues Chart" to reset
- [ ] Use Test Case 5 data (Marie, 29.12.1995, 23:55, Frankfurt)
- [ ] Submit form
- [ ] **VERIFY**: Type shows "Riflettore"
- [ ] **VERIFY**: Authority shows Lunar Authority with 28-day hint
- [ ] **VERIFY**: ALL 9 centers are OPEN (all light gray)
- [ ] **VERIFY**: NO defined channels (no navy lines)
- [ ] **VERIFY**: Only hanging gates visible (individual gate activations)

**Test 3.5: Generator with Ego Authority**
- [ ] Click "Neues Chart" to reset
- [ ] Use Test Case 6 data (Jonas, 07.09.1987, 12:00, Stuttgart)
- [ ] Submit form
- [ ] **VERIFY**: Type shows "Generatore"
- [ ] **VERIFY**: Authority shows Ego Authority
- [ ] **VERIFY**: Herz/Ego center is DEFINED (navy blue)
- [ ] **VERIFY**: Ego projected to Throat or G-center (channel 21-45 or 25-51)

---

### Test Phase 4: Approximate Birth Time Handling

**Test 4.1: Unknown Birth Time**
- [ ] Click "Neues Chart" to reset
- [ ] Use Test Case 7 data (Lisa, 14.02.1991, empty time, Düsseldorf)
- [ ] Check "Geburtszeit ungefähr / unbekannt" checkbox
- [ ] **VERIFY**: birthTime field is disabled
- [ ] Submit form
- [ ] **VERIFY**: Chart generates successfully
- [ ] **VERIFY**: All 9 sections display normally
- [ ] **VERIFY**: No error message appears
- [ ] **NOTE**: Backend should receive birthTime="12:00" (noon default)

---

### Test Phase 5: Error Handling & Retry

**Test 5.1: Invalid Birth Location**
- [ ] Click "Neues Chart" to reset
- [ ] Enter invalid location: birthPlace="XYZ Invalid City 123"
- [ ] Fill other fields correctly
- [ ] Submit form
- [ ] **VERIFY**: Error message appears (if HD API rejects location)
- [ ] **VERIFY**: Error message is in German
- [ ] **VERIFY**: Retry option available (form still visible)
- [ ] **VERIFY**: Previous input values preserved (not cleared)

**Test 5.2: API Timeout/Unavailability**
- [ ] Simulate API failure (disconnect internet or backend)
- [ ] Enter valid data and submit
- [ ] **VERIFY**: Error message appears after timeout
- [ ] **VERIFY**: Error message: "Gerade kann dein Chart nicht berechnet werden. Bitte versuche es später noch einmal."
- [ ] **VERIFY**: Form remains visible for retry
- [ ] **VERIFY**: No crash or white screen

**Test 5.3: Network Error Recovery**
- [ ] Restore internet connection
- [ ] Click submit again (retry)
- [ ] **VERIFY**: Chart generates successfully
- [ ] **VERIFY**: No remnants of previous error

---

### Test Phase 6: Email Capture Submission

**Test 6.1: Valid Email Submission**
- [ ] Generate any chart successfully
- [ ] Scroll to email capture section
- [ ] Enter valid email: "test@example.com"
- [ ] Click "Absenden"
- [ ] **VERIFY**: Button shows "Wird gesendet..." during submission
- [ ] **VERIFY**: Success message appears: "Vielen Dank für dein Interesse an einem Business Reading."
- [ ] **VERIFY**: Form is replaced with success message
- [ ] **VERIFY**: Email input no longer visible

**Test 6.2: Invalid Email Format**
- [ ] Generate new chart
- [ ] Enter invalid email: "invalid-email"
- [ ] Click "Absenden"
- [ ] **VERIFY**: Error message: "Ungültige E-Mail-Adresse. Bitte prüfen Sie Ihre Eingabe."
- [ ] **VERIFY**: Error appears in red below input
- [ ] **VERIFY**: Form does not submit

**Test 6.3: Duplicate Email Handling**
- [ ] Generate new chart
- [ ] Enter previously submitted email
- [ ] Click "Absenden"
- [ ] **VERIFY**: Either success message OR duplicate handling message
- [ ] **VERIFY**: No crash or unexpected error

---

### Test Phase 7: Mobile Responsiveness

**Test 7.1: iPhone SE (375px width)**
- [ ] Open DevTools, set Device to iPhone SE
- [ ] Navigate to homepage
- [ ] **VERIFY**: All form fields fit within viewport
- [ ] **VERIFY**: No horizontal scrolling required
- [ ] **VERIFY**: Submit button fully visible
- [ ] Generate chart (Test Case 1)
- [ ] **VERIFY**: All 9 sections display correctly
- [ ] **VERIFY**: Bodygraph SVG scales to fit screen
- [ ] **VERIFY**: Text is readable without zoom
- [ ] **VERIFY**: Touch targets are >44px (tap submit button easily)

**Test 7.2: iPad Mini (768px width)**
- [ ] Set Device to iPad Mini (768px)
- [ ] Generate chart
- [ ] **VERIFY**: Grid layout adjusts (md:grid-cols-2 kicks in)
- [ ] **VERIFY**: Type and Authority sections side-by-side
- [ ] **VERIFY**: Centers and Channels sections side-by-side
- [ ] **VERIFY**: Bodygraph remains centered and proportional

**Test 7.3: Desktop (1920px width)**
- [ ] Set Device to Desktop (1920px)
- [ ] Generate chart
- [ ] **VERIFY**: Content max-width constrains layout (max-w-4xl)
- [ ] **VERIFY**: Chart centered on page
- [ ] **VERIFY**: No excessive whitespace issues
- [ ] **VERIFY**: All sections properly aligned

---

### Test Phase 8: Performance Testing

**Test 8.1: Lighthouse Performance Audit**
- [ ] Open Lighthouse in DevTools
- [ ] Run audit on chart page
- [ ] **VERIFY**: Performance score >90
- [ ] **VERIFY**: First Contentful Paint <1s
- [ ] **VERIFY**: Largest Contentful Paint <2.5s
- [ ] **VERIFY**: Cumulative Layout Shift <0.1
- [ ] **VERIFY**: Time to Interactive <3s

**Test 8.2: Network Performance**
- [ ] Open Network tab, clear requests
- [ ] Generate chart (Test Case 1)
- [ ] **MEASURE**: Chart API response time: _______ ms
- [ ] **VERIFY**: Total load time <3 seconds
- [ ] **VERIFY**: No failed requests (all 200 or 304 status)
- [ ] **VERIFY**: SVG loads without delay

**Test 8.3: Console Error Check**
- [ ] Open Console tab
- [ ] Generate chart
- [ ] **VERIFY**: No JavaScript errors logged
- [ ] **VERIFY**: No React warnings about keys, props, etc.
- [ ] **VERIFY**: No CORS errors
- [ ] **VERIFY**: No 404 errors for assets

---

### Test Phase 9: Accessibility Testing

**Test 9.1: Keyboard Navigation**
- [ ] Navigate to homepage using only keyboard (Tab key)
- [ ] **VERIFY**: All form fields reachable with Tab
- [ ] **VERIFY**: Focus indicator visible on each field
- [ ] **VERIFY**: Submit button focusable and activates with Enter
- [ ] **VERIFY**: Checkbox toggles with Space key

**Test 9.2: Screen Reader Testing (if available)**
- [ ] Enable VoiceOver (Mac) or NVDA (Windows)
- [ ] Navigate form
- [ ] **VERIFY**: All labels read aloud correctly
- [ ] **VERIFY**: Error messages announced
- [ ] **VERIFY**: Bodygraph SVG has title elements
- [ ] **VERIFY**: Form instructions clear

**Test 9.3: Color Contrast Verification**
- [ ] Use browser extension (WAVE, axe DevTools)
- [ ] Run accessibility audit
- [ ] **VERIFY**: All text meets WCAG AA (4.5:1 ratio minimum)
- [ ] **VERIFY**: Primary text (#1A1A1A) on white passes
- [ ] **VERIFY**: Error text (#E74C3C) on white passes
- [ ] **VERIFY**: Defined centers (#2C3E50) distinguishable from open centers

---

### Test Phase 10: Edge Cases

**Test 10.1: Midnight Birth (00:00)**
- [ ] Enter birthTime: "00:00"
- [ ] Submit with valid other data
- [ ] **VERIFY**: No date boundary errors
- [ ] **VERIFY**: Chart generates correctly

**Test 10.2: Late Night Birth (23:59)**
- [ ] Enter birthTime: "23:59"
- [ ] Submit with valid other data
- [ ] **VERIFY**: Correct date used for calculation
- [ ] **VERIFY**: No timezone errors

**Test 10.3: Leap Year Birth Date**
- [ ] Enter birthDate: "29.02.1992" (leap year)
- [ ] Submit with valid other data
- [ ] **VERIFY**: Date accepted and processed
- [ ] **VERIFY**: Chart generates correctly

**Test 10.4: Future Date Rejection**
- [ ] Enter birthDate: "01.01.2030" (future date)
- [ ] Submit
- [ ] **VERIFY**: Error message (if validation exists)
- [ ] **VERIFY**: OR backend rejects with clear message

**Test 10.5: Very Long Name**
- [ ] Enter firstName: 51 character string (exceeds 50 char max)
- [ ] Submit
- [ ] **VERIFY**: Validation error appears
- [ ] **VERIFY**: Error message about character limit

**Test 10.6: Special Characters in Name**
- [ ] Enter firstName: "François" (with accent)
- [ ] Submit
- [ ] **VERIFY**: Name accepted (Unicode support)
- [ ] **VERIFY**: Chart displays name correctly

**Test 10.7: International Birth Location**
- [ ] Enter birthPlace: "Tokyo, Japan" (non-German location)
- [ ] Submit
- [ ] **VERIFY**: Location accepted
- [ ] **VERIFY**: Correct timezone applied (Asia/Tokyo)
- [ ] **VERIFY**: Chart generates successfully

---

## 5. Known Issues / Missing Features Discovery

### Issues to Document During Testing

**Form Issues**:
- [ ] Date picker (if any issues with TT.MM.JJJJ format)
- [ ] Time picker (if any issues with HH:MM format)
- [ ] Validation timing (immediate vs on-blur vs on-submit)
- [ ] Error message clarity

**Chart Display Issues**:
- [ ] Section rendering order discrepancies
- [ ] Missing data in any section
- [ ] Layout shift during Bodygraph load
- [ ] Mobile overflow issues

**Bodygraph Issues**:
- [ ] Center positioning accuracy
- [ ] Channel line alignment
- [ ] Gate point visibility
- [ ] Color accuracy vs design system
- [ ] SVG scaling on extreme zoom
- [ ] Accessibility (screen reader support)

**Performance Issues**:
- [ ] Chart generation >3 seconds
- [ ] Slow email capture submission
- [ ] API timeout handling
- [ ] Loading state delays

**Email Capture Issues**:
- [ ] Email validation false positives/negatives
- [ ] Success message not appearing
- [ ] Duplicate submission handling
- [ ] API error handling

**Accessibility Issues**:
- [ ] Keyboard navigation gaps
- [ ] Focus indicator missing
- [ ] Color contrast failures
- [ ] Screen reader compatibility

---

## 6. Test Results Summary Template

### Test Execution Date: ____________

**Tester**: ____________
**Environment**: [ ] Production [ ] Staging [ ] Local
**Browser**: [ ] Chrome [ ] Firefox [ ] Safari [ ] Edge
**Device**: [ ] Desktop [ ] Mobile [ ] Tablet

### Pass/Fail Summary

| Test Phase | Total Tests | Passed | Failed | Notes |
|------------|-------------|--------|--------|-------|
| Form Validation | 5 | ___ | ___ | |
| Chart Generation | 4 | ___ | ___ | |
| Type/Authority | 5 | ___ | ___ | |
| Approximate Time | 1 | ___ | ___ | |
| Error Handling | 3 | ___ | ___ | |
| Email Capture | 3 | ___ | ___ | |
| Mobile | 3 | ___ | ___ | |
| Performance | 3 | ___ | ___ | |
| Accessibility | 3 | ___ | ___ | |
| Edge Cases | 7 | ___ | ___ | |
| **TOTAL** | **37** | ___ | ___ | |

### Critical Issues Found

1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

### Non-Critical Issues Found

1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

### Performance Metrics

- Average chart generation time: _______ seconds
- Lighthouse Performance Score: _______
- Lighthouse Accessibility Score: _______
- First Contentful Paint: _______ seconds
- Largest Contentful Paint: _______ seconds
- Cumulative Layout Shift: _______

### Recommendations

1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

---

## 7. Regression Testing Checklist

Use this abbreviated checklist for quick regression tests after bug fixes or new features:

**Quick Smoke Test** (5 minutes):
- [ ] Homepage loads without errors
- [ ] Form submits with valid data (Test Case 1)
- [ ] Chart displays all 9 sections
- [ ] Bodygraph SVG renders correctly
- [ ] Email capture form visible
- [ ] No console errors

**Standard Regression Test** (15 minutes):
- [ ] All 6 sample test cases generate correctly
- [ ] Form validation works (empty, invalid date, invalid time)
- [ ] Error handling works (retry after error)
- [ ] Email capture submits successfully
- [ ] Mobile view renders correctly (375px)
- [ ] Performance <3 seconds

**Full Regression Test** (60 minutes):
- [ ] Execute all 37 manual test cases above
- [ ] Document any new issues found
- [ ] Compare performance metrics to baseline

---

## 8. Automated Testing Recommendations (Future)

**Priority 1: Form Validation Tests**
- Playwright E2E tests for all validation scenarios
- Visual regression tests for error states

**Priority 2: Chart Generation Tests**
- E2E tests for all 6 Type/Authority combinations
- Snapshot tests for each section component
- Visual regression for Bodygraph SVG

**Priority 3: Performance Tests**
- Automated Lighthouse CI integration
- API response time monitoring
- Bundle size tracking

**Priority 4: Accessibility Tests**
- Automated axe-core testing
- WCAG 2.1 AA compliance checks
- Keyboard navigation tests

---

## Appendix: Human Design Quick Reference

### 5 Types (Italian Names)
1. **Manifestante** (Manifestor) - ~9% population, initiator energy
2. **Generatore** (Generator) - ~37% population, sustainable work energy
3. **Manifestante Generatore** (Manifesting Generator) - ~33% population, multi-passionate energy
4. **Proiettore** (Projector) - ~20% population, guide energy
5. **Riflettore** (Reflector) - ~1% population, mirror energy

### 7 Authorities
1. **Emotional** - Wait through emotional wave (most common)
2. **Sacral** - Gut response (Generators only)
3. **Splenic** - In-the-moment knowing
4. **Ego** - Willpower (Manifestors/Projectors only)
5. **Self-Projected** - Identity through speaking (Projectors only)
6. **Mental/Environmental** - Discussion and environment (Projectors only)
7. **Lunar** - Wait 28 days (Reflectors only)

### 9 Centers (German Names)
1. **Kopf** (Head) - Inspiration
2. **Ajna** - Conceptualization
3. **Kehlzentrum** (Throat) - Communication/Manifestation
4. **G-Zentrum** (G-Center) - Identity/Direction
5. **Herz/Ego** (Heart/Ego) - Willpower
6. **Sakral** (Sacral) - Life force (Generator energy)
7. **Wurzel** (Root) - Pressure/Drive
8. **Milz** (Spleen) - Intuition/Fear
9. **Solarplexus** (Solar Plexus) - Emotions

### Type-Specific Requirements
- **Generator**: Sakral center MUST be defined
- **Manifestor**: Motor-to-Throat channel (can initiate)
- **Manifesting Generator**: Sakral defined + Motor-to-Throat
- **Projector**: Sakral center MUST be open/undefined
- **Reflector**: ALL 9 centers MUST be open/undefined

---

**Document Status**: Ready for Testing
**Last Updated**: 2025-11-26
**Version**: 1.0
