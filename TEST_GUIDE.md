# DISC Assessment - Testing Guide

## Quick Start Testing

### Local Testing
```bash
cd public
python -m http.server 8000
# Visit: http://localhost:8000/disc.html
```

## Test Checklist

### ✅ Functional Tests

#### Form Validation
- [ ] All 24 questions display correctly
- [ ] Radio buttons are grouped correctly (only 1 selection per question)
- [ ] Attempting to submit without answering all questions shows alert
- [ ] Required attribute prevents form submission when incomplete

#### Scoring Logic
- [ ] Test with all "Strongly Agree" (5s) - should show all traits at 30
- [ ] Test with all "Strongly Disagree" (1s) - should show all traits at 6
- [ ] Test mixed answers - verify correct summation:
  - Questions 1-6 sum to D score
  - Questions 7-12 sum to I score
  - Questions 13-18 sum to S score
  - Questions 19-24 sum to C score
- [ ] Verify primary style matches highest score
- [ ] Verify secondary style matches second-highest score

#### Tie-Breaking
- [ ] Test exact tie (e.g., D=25, I=25, S=20, C=20)
  - Should use count of 4/5 answers as tiebreaker
- [ ] Test all equal scores (e.g., all at 18)
  - Should use canonical order: D > I > S > C

#### Netlify Forms Integration
- [ ] Hidden fields are populated before submission:
  - `total_D`, `total_I`, `total_S`, `total_C`
  - `primary_style`, `secondary_style`
  - `style_vector` (JSON)
- [ ] All 24 question responses (q1-q24) are captured
- [ ] Form-name hidden field is present
- [ ] Honeypot field is hidden
- [ ] data-netlify="true" attribute is present

#### AJAX Submission
- [ ] On successful submit, results appear inline
- [ ] Results section shows correct scores
- [ ] Primary and secondary styles display correctly
- [ ] Style description renders with correct content
- [ ] Page scrolls to results section smoothly

#### Fallback Behavior
- [ ] With throttled network, form falls back to native submit
- [ ] Native submit redirects to /thanks.html
- [ ] Thanks page displays correctly
- [ ] Link back to /disc.html works

### ✅ Accessibility Tests

#### Keyboard Navigation
- [ ] Tab key moves through all radio buttons sequentially
- [ ] Arrow keys navigate within radio groups
- [ ] Space/Enter selects radio buttons
- [ ] Focus is visible on all interactive elements
- [ ] Submit button is keyboard accessible

#### Screen Reader
- [ ] Fieldset/legend structure is semantic
- [ ] Radio groups are properly labeled
- [ ] Required fields are announced
- [ ] Focus states are announced
- [ ] Results section is announced when revealed

#### Visual
- [ ] Focus outlines are clearly visible
- [ ] Text has sufficient contrast
- [ ] Hover states are clear
- [ ] Selected state is obvious
- [ ] Works without color alone (patterns/text)

### ✅ Responsive Design

#### Mobile (< 768px)
- [ ] Likert labels stack vertically
- [ ] Radio buttons are touch-friendly (44px minimum)
- [ ] Form is readable without horizontal scroll
- [ ] Results display properly on small screens

#### Tablet (768px - 1024px)
- [ ] Likert labels display horizontally
- [ ] 4-column results grid adapts correctly
- [ ] Spacing is appropriate

#### Desktop (> 1024px)
- [ ] Full horizontal Likert layout
- [ ] All elements centered and readable
- [ ] Max-width prevents over-stretching

### ✅ Browser Compatibility

Test in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Test Scenarios

### Scenario 1: High Dominance Profile
Answer all D questions (1-6) with 5, rest with 1:
- Expected: D = 30, I = 6, S = 6, C = 6
- Primary: D, Secondary: I (canonical order)

### Scenario 2: Balanced Profile
Answer all questions with 3:
- Expected: D = 18, I = 18, S = 18, C = 18
- Primary: D, Secondary: I (canonical order)

### Scenario 3: High Influence Profile
Answer I questions (7-12) with 5, rest with 2:
- Expected: D = 12, I = 30, S = 12, C = 12
- Primary: I, Secondary: D (canonical order)

### Scenario 4: Realistic Mixed Profile
D (1-6): 4, 5, 3, 4, 5, 4 = 25
I (7-12): 3, 4, 4, 3, 3, 4 = 21
S (13-18): 2, 3, 2, 3, 2, 3 = 15
C (19-24): 5, 5, 4, 5, 4, 5 = 28
- Expected: D = 25, I = 21, S = 15, C = 28
- Primary: C, Secondary: D

## Netlify Deployment Testing

### After Deploy:
1. **Forms Detection**
   - Go to Netlify dashboard → Forms
   - Verify `disc-assessment` form appears
   - Check field list shows all 24 questions + hidden fields

2. **Submission Test**
   - Complete full assessment on live site
   - Submit form
   - Check Forms dashboard for submission
   - Verify all data captured:
     - All q1-q24 values
     - total_D, total_I, total_S, total_C
     - primary_style, secondary_style
     - style_vector JSON

3. **Results Display**
   - Verify inline results show after submit
   - Check scores match expected values
   - Verify descriptions render correctly

4. **Non-JS Fallback**
   - Disable JavaScript in browser
   - Complete assessment
   - Submit form
   - Should redirect to /thanks.html
   - Data should still be captured in Netlify Forms

## Performance Tests

- [ ] Page loads in < 2 seconds on 3G
- [ ] No console errors in browser DevTools
- [ ] No 404s for assets (CSS, JS, images)
- [ ] Lighthouse score > 90 for Accessibility
- [ ] Form submission completes in < 3 seconds

## Edge Cases

- [ ] Rapidly clicking submit multiple times (debounce)
- [ ] Browser back button after submission
- [ ] Refreshing page mid-assessment (data loss is OK)
- [ ] Network disconnect during submission (falls back)
- [ ] Very long answer times (no timeout issues)

## Security Tests

- [ ] Honeypot field catches bots (stays hidden)
- [ ] No XSS vulnerabilities in results rendering
- [ ] Form only accepts POST method
- [ ] No sensitive data in URL parameters
- [ ] HTTPS enforced on production

## Known Limitations

1. **No Save/Resume**: Users must complete in one session
2. **Client-Side Only**: No authentication or user accounts
3. **Single Form**: Only captures one assessment per submission
4. **Static Results**: No PDF export or email delivery

## Success Criteria

✅ All 24 questions answer correctly
✅ Scoring matches expected calculations
✅ Primary/secondary styles determined correctly
✅ Netlify Forms captures all data
✅ AJAX submit shows inline results
✅ Fallback to native submit works
✅ Fully keyboard accessible
✅ Mobile responsive
✅ No JavaScript errors
✅ Cross-browser compatible
