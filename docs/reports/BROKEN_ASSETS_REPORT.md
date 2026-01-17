# Broken Assets Report - aifluency.com

**Date:** January 12, 2026  
**Site Analyzed:** https://aifluency.com/landing1

## Summary

The site `aifluency.com` is experiencing broken assets because it references resources from `aifluency.adavauniversity.org`, which is not resolving (ERR_NAME_NOT_RESOLVED). This occurred after changing the DNS for `adavauniversity.org` from ClickFunnels to your new server.

## Root Cause

The subdomain `aifluency.adavauniversity.org` needs DNS configuration to point to your server. Currently, it's not resolving, causing all assets hosted on that subdomain to fail loading.

## Broken Domains That Need DNS Configuration

1. **`aifluency.adavauniversity.org`** ⚠️ **CRITICAL**
   - This is the primary broken domain
   - Hosts CSS, JavaScript, and all images
   - Needs DNS A record or CNAME pointing to your server

2. **`softwaredev.adavauniversity.org`** ⚠️ **SECONDARY**
   - Referenced in navigation links
   - May also need DNS configuration if it's used elsewhere

## Critical JavaScript/CSS Files Failing

These files are preventing the site from functioning properly:

1. `https://aifluency.adavauniversity.org/assets/lander.css`
   - **Error:** ERR_NAME_NOT_RESOLVED
   - **Impact:** Site styling is broken

2. `https://aifluency.adavauniversity.org/assets/lander.js`
   - **Error:** ERR_NAME_NOT_RESOLVED
   - **Impact:** Site functionality is broken

3. `https://aifluency.adavauniversity.org/assets/userevents/application.js`
   - **Error:** ERR_NAME_NOT_RESOLVED
   - **Impact:** User event tracking broken

4. `https://aifluency.adavauniversity.org/assets/pushcrew.js`
   - **Error:** ERR_NAME_NOT_RESOLVED
   - **Impact:** Push notifications broken

5. `https://aifluency.adavauniversity.org/vendor.js`
   - **Error:** ERR_NAME_NOT_RESOLVED
   - **Impact:** Vendor libraries not loading

## Broken Images (50+ images)

All images are hosted at `aifluency.adavauniversity.org/hosted/images/` and failing to load. Key categories:

### Logo & Branding
- `/hosted/images/5e/63636e3f3c4e64bd75240a2327bcaf/Adava-Logo.png`

### Instructor Photos
- `/hosted/images/8d/60c6c33417466690f7e6011a783ee5/Jorge.jpg`
- `/hosted/images/c2/e605c1dba3450386b30e0a450dba7b/Aarshavi.jpg`
- `/hosted/images/c3/ea67c836eb4c909738b298e1ec3018/Nishit.png`
- `/hosted/images/ee/747179109b4669bb4004ea93830a0d/Abhishek.png`
- `/hosted/images/0a/bde6b5c9954ce89975139915c7b640/Varun.png`
- `/hosted/images/58/8c5d25580a45bfb9ccc620fcb3e6c5/Wilfried-Profile.png`
- `/hosted/images/1e/cfe31989e44b23904ebee5365281f5/Chase-Profile.png`

### Icons & UI Elements
- `/hosted/images/55/a09257dde742f0901669af9e5e548d/Learn-2x.png`
- `/hosted/images/92/1bb163613c41989e3897952bac2859/NoMandatoryHomework.png`
- `/hosted/images/dd/30e297ff05467c85dd87420136410a/Class-Structure.png`
- `/hosted/images/fe/0f3efb39ce4d6f805619682ff240a8/LearnIcon.png`
- `/hosted/images/1e/d7729b45ba4e8d8f2097d90edc2fd1/GroupUpIcon.png`
- `/hosted/images/47/192e6ce95a4e95af7445f34e9a5e78/AIProjectIcon.png`
- `/hosted/images/34/d48b11187f4f87a8208a864e03fc17/CareerIcon.png`
- Multiple calendar, admission, and class breakdown icons

### Certificates & Awards
- `/hosted/images/08/bf2a2c29254da2a4ea9e53a86c1fdc/Certificate-AIFluency.png`
- `/hosted/images/23/0bfeef390a41f79413241de88e7425/Certificate-Award.png`

### Academic Posters
- `/hosted/images/cf/1cc7d05af1445283a88f28698b3b59/AI-Fluency-Generative-Adversarial-Networks-Poster-Thumbnail.png`
- `/hosted/images/b7/93bf0975ee46eda22dba4226fee19f/AI-Fluency-State-Rewards-AI-Poster-Thumbnail.png`
- `/hosted/images/63/d78bf9885646819e15f2e46824de96/AI-Fluency-Decision-Trees-Poster-Thumbnail.png`

### Background Images
- `/hosted/images/cf/0ddd0e157f4ef9ae94439d0272c67d/noise-transparent-strong-1.png`
- `/hosted/images/images/purple-geo.png`
- `/hosted/images/56/feea26eccf492689cdfe97010747d5/AlumniStories-Background.png`
- `/hosted/images/25/6475bb36514ea88368350924371a81/ClassesDesignedAroundYouBG.jpg`
- `/hosted/images/ed/161a82018e4e11b05fe3ecdc1c7f5b/Homepage-Main-Banner.jpg`
- `/hosted/images/b3/2624a41c274508b0362d9d5a39437a/Adava-World-Map.png`

### Class Structure Images
- `/hosted/images/e4/10d46250c04fae97fec78b45d3a29d/Class-Breakdown-Mobile.png`
- `/hosted/images/a6/2cbc909874420fa1e4cb4d3ac479ed/Class-Breakdown-1.png`
- `/hosted/images/6e/cf32bbcfdc446eae5da2369daff5e6/Class-Breakdown-2.png`

## JavaScript Errors

Additional errors caused by missing dependencies:

1. `ReferenceError: $ is not defined` (multiple occurrences)
   - jQuery is not loading, likely because `vendor.js` failed

2. `TypeError: window.track_capi is not a function`
   - Custom tracking function missing due to failed script loads

## Solution: DNS Configuration Required

### Option 1: Point Subdomain to Same Server (Recommended)

Add DNS records for the subdomain to point to your server:

**For `aifluency.adavauniversity.org`:**
- **Type:** A Record (or CNAME if using a CDN)
- **Name:** `aifluency`
- **Value:** [Your server IP address] (same as `adavauniversity.org`)
- **TTL:** 3600 (or your preference)

**For `softwaredev.adavauniversity.org` (if needed):**
- **Type:** A Record (or CNAME)
- **Name:** `softwaredev`
- **Value:** [Your server IP address]
- **TTL:** 3600

### Option 2: Server Configuration

After DNS is configured, ensure your web server (nginx/apache) is configured to serve these subdomains:

1. **Nginx example:**
   ```nginx
   server {
       listen 80;
       server_name aifluency.adavauniversity.org;
       root /path/to/your/assets;
       # ... rest of config
   }
   ```

2. **Ensure asset paths are accessible:**
   - `/assets/` directory with CSS/JS files
   - `/hosted/images/` directory with all images
   - `/vendor.js` file

### Option 3: Migrate Assets (Alternative)

If you don't want to maintain the subdomain, you could:
1. Download all assets from the old ClickFunnels hosting
2. Upload them to your new server
3. Update all URLs in `aifluency.com` to point to the new location

## Verification Steps

After DNS changes (allow 24-48 hours for propagation):

1. Test DNS resolution:
   ```bash
   nslookup aifluency.adavauniversity.org
   dig aifluency.adavauniversity.org
   ```

2. Test asset loading:
   ```bash
   curl -I https://aifluency.adavauniversity.org/assets/lander.css
   curl -I https://aifluency.adavauniversity.org/hosted/images/5e/63636e3f3c4e64bd75240a2327bcaf/Adava-Logo.png
   ```

3. Check browser console on aifluency.com - should see no ERR_NAME_NOT_RESOLVED errors

## Priority

**HIGH PRIORITY:** Fix `aifluency.adavauniversity.org` DNS immediately - this affects:
- Site styling (CSS)
- Site functionality (JavaScript)
- All images (50+)
- User experience

**MEDIUM PRIORITY:** Fix `softwaredev.adavauniversity.org` if it's actively used

## Notes

- The site is still hosted on ClickFunnels (you can see the "Create marketing funnels" banner)
- The DNS change for `adavauniversity.org` broke the subdomain references
- All assets need to be accessible at the same paths they were on ClickFunnels
- Consider setting up a wildcard DNS record (`*.adavauniversity.org`) if you have multiple subdomains





