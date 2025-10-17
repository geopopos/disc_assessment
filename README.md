# DISC Assessment - Netlify Deployment

Production-ready DISC personality assessment with Netlify Forms integration and client-side scoring.

## Features

- ✅ 15-question DISC assessment (Most/Least format)
- ✅ Client-side scoring with D/I/S/C totals
- ✅ Netlify Forms data capture (no backend required)
- ✅ Fully responsive, accessible UI (Tailwind CSS)
- ✅ Optional webhook integration for external tools
- ✅ No build step required - pure static site

## Tech Stack

- **Frontend**: HTML5, Tailwind CSS (CDN), Vanilla JavaScript (ES Modules)
- **Forms**: Netlify Forms (native integration)
- **Functions**: Netlify Functions (optional webhook relay)
- **Deployment**: Netlify

## Project Structure

```
vua_disc_assessment/
├── netlify.toml              # Netlify configuration
├── README.md                 # This file
├── public/                   # Static site root
│   ├── index.html           # Landing page
│   ├── assessment.html      # DISC assessment form
│   ├── results.html         # Results display (optional)
│   ├── thanks.html          # Post-submission confirmation
│   ├── privacy.html         # Privacy policy
│   ├── assets/
│   │   ├── logo.svg        # Site logo
│   │   └── styles.css      # Custom styles
│   ├── data/
│   │   └── disc_items.json # 24 DISC question groups
│   └── js/
│       ├── questions.js     # Question rendering
│       ├── scoring.js       # DISC scoring logic
│       ├── form.js          # Form handling
│       └── ui.js            # UI/UX enhancements
└── netlify/
    └── functions/
        └── submit-webhook.js # Optional webhook relay
```

## Local Development

### Prerequisites
- Git
- A simple HTTP server (Python, Node.js, or any static server)

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd vua_disc_assessment
   ```

2. **Start a local server**

   Using Python:
   ```bash
   cd public
   python -m http.server 8000
   ```

   Or using Node.js:
   ```bash
   npx serve public
   ```

   Or using PHP:
   ```bash
   cd public
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### Testing Locally

- Navigate to `http://localhost:8000/assessment.html`
- Complete all 15 questions (select Most and Least for each)
- Verify progress bar updates correctly
- Check that submit button enables only when all questions complete
- Open browser console to see scoring calculations

**Note**: Netlify Forms will NOT work locally. Form submissions will show the Netlify form success page, but data won't be captured until deployed.

## Deployment to Netlify

### Method 1: Connect Git Repository

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial DISC assessment site"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Netlify**
   - Go to [Netlify](https://app.netlify.com)
   - Click "New site from Git"
   - Choose your repository
   - Configure build settings:
     - **Build command**: (leave empty)
     - **Publish directory**: `public`
   - Click "Deploy site"

3. **Verify Forms Detection**
   - After deployment, go to site dashboard
   - Navigate to "Forms" tab
   - Verify `disc-assessment` form is detected
   - If not detected, trigger a form submission or check form markup

### Method 2: Manual Deploy (Drag & Drop)

1. Deploy the `public` folder directly via Netlify's drag-and-drop interface
2. Forms should be auto-detected on first deployment

### Post-Deployment Checklist

- [ ] Site loads correctly at your Netlify URL
- [ ] Forms tab shows `disc-assessment` form
- [ ] Test a complete submission and verify data appears in Forms tab
- [ ] Check all 15 questions + computed scores are captured
- [ ] Verify responsive design on mobile/tablet
- [ ] Test accessibility with keyboard navigation
- [ ] Confirm privacy.html page loads

## Netlify Forms Data Structure

Each submission captures:

### Candidate Information
- `full_name` - Candidate's full name
- `email` - Candidate's email address
- `role_applied_for` - Position being applied for

### Assessment Responses (30 fields)
- `g1_most` through `g15_most` - Most-like-me selections
- `g1_least` through `g15_least` - Least-like-me selections

### Computed Scores (7 fields)
- `score_D` - Dominance score (integer)
- `score_I` - Influence score (integer)
- `score_S` - Steadiness score (integer)
- `score_C` - Conscientiousness score (integer)
- `primary_type` - Primary DISC type (e.g., "High D", "DI")
- `type_order` - Rank order of types (e.g., "D>I>C>S")
- `debug_vector` - JSON string with raw counts

### Spam Protection
- `bot-field` - Honeypot field (should be empty)

## Optional: Webhook Integration

Enable webhook relay to send submissions to external services (Zapier, Make, Airtable, Notion).

### Setup

1. **Enable the function** (already created in `netlify/functions/submit-webhook.js`)

2. **Add environment variable**
   - Go to Site Settings → Environment Variables
   - Add variable:
     - **Key**: `WEBHOOK_URL`
     - **Value**: Your webhook endpoint URL (e.g., Zapier webhook URL)

3. **Configure Netlify Forms notification**
   - Go to Forms → Form notifications
   - Add outgoing webhook
   - Point to: `https://your-site.netlify.app/.netlify/functions/submit-webhook`
   - Select events: Form submissions

4. **Test the integration**
   - Submit a test form
   - Check external service receives data
   - Check Netlify Functions logs for any errors

### Webhook Payload

The function forwards this JSON structure:

```json
{
  "submissionId": "...",
  "formName": "disc-assessment",
  "timestamp": "2025-01-16T12:00:00Z",
  "data": {
    "full_name": "...",
    "email": "...",
    "role_applied_for": "...",
    "score_D": 12,
    "score_I": 8,
    "score_S": -2,
    "score_C": 6,
    "primary_type": "High D",
    "type_order": "D>I>C>S",
    "debug_vector": "...",
    "g1_most": "Decisive",
    "g1_least": "Patient",
    ...
  }
}
```

## DISC Scoring Methodology

### Format
- 15 questions
- Each question has 4 statements (one per D/I/S/C dimension)
- Candidate selects:
  - **Most like me**: +1 point to that dimension
  - **Least like me**: -1 point to that dimension
  - Cannot select the same adjective for both

### Calculation
- **Total Range**: -15 to +15 per dimension
- **Primary Type**: Dimension with highest score
- **Ties**: Combined type (e.g., "DI" if D and I are equal and highest)

### Example Result
```
D: 12
I: 8
S: -2
C: 6

Primary Type: "High D"
Type Order: "D>I>C>S"
```

## Customization

### Branding
- **Colors**: Edit `public/assets/styles.css` or Tailwind classes in HTML
- **Logo**: Replace `public/assets/logo.svg`
- **Copy**: Edit content in HTML files

### Assessment Configuration
- **Questions**: Edit `public/data/disc_items.json`
- **Scoring Logic**: Modify `public/js/scoring.js`
- **UI Behavior**: Adjust `public/js/ui.js`

### Results Display
- Toggle inline results summary via `SHOW_RESULTS` constant in `assessment.html`
- Customize results page at `public/results.html`

## Troubleshooting

### Forms Not Detected
- Ensure form has `data-netlify="true"` attribute
- Verify `<input type="hidden" name="form-name" value="disc-assessment">` exists
- Check form `name` attribute matches hidden input value
- Redeploy site after form markup changes

### Submissions Missing Data
- Open browser console to check for JavaScript errors
- Verify all hidden fields are populated before submit
- Check Netlify Functions logs if using webhook

### Webhook Not Firing
- Verify `WEBHOOK_URL` environment variable is set
- Check Netlify Functions logs for errors
- Confirm outgoing webhook is configured in Forms settings
- Test endpoint independently with curl/Postman

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly
- Proper ARIA labels
- Sufficient color contrast

## Security

- No sensitive data storage (client-side only)
- Honeypot spam protection
- CSP headers via netlify.toml
- HTTPS enforced by Netlify
- No cookies or localStorage used

## License

[Your License Here]

## Support

For issues or questions:
- Email: [your-email@example.com]
- GitHub Issues: [your-repo/issues]

---

Built with ❤️ for better hiring decisions
