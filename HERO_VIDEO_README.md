# Hero Video Section for Shopify

A modern, full-screen video hero section with overlay text, plus icons, and responsive design.

## Features

✅ **Full-screen video hero** with responsive design  
✅ **Dual video support** (mobile + desktop) with fallback MP4  
✅ **Customizable text content** with two-line heading support  
✅ **Plus icon decorations** with parallax effects  
✅ **Video poster images** for loading states  
✅ **Performance optimized** with intersection observers  
✅ **Accessibility features** including reduced motion support  
✅ **Modern CSS Grid layout** with responsive breakpoints  
✅ **Smooth animations** and hover effects

## Installation

1. **Copy the section file** to your theme's `sections/` folder:

   ```
   sections/hero-video.liquid
   ```

2. **Copy the CSS file** to your theme's `assets/` folder:

   ```
   assets/hero-video.css
   ```

3. **Copy the JavaScript file** to your theme's `assets/` folder:

   ```
   assets/hero-video.js
   ```

4. **Include the files** in your theme's `snippets/head.liquid`:
   ```liquid
   {{ 'hero-video.css' | asset_url | stylesheet_tag }}
   <script src="{{ 'hero-video.js' | asset_url }}" defer></script>
   ```

## Usage

### Basic Setup

1. **Go to your Shopify admin** → Online Store → Themes
2. **Click "Customize"** on your active theme
3. **Add a new section** and select "Hero Video"
4. **Configure the settings** as needed

### Section Settings

#### Content

- **Heading Line 1**: First line of the main heading (e.g., "Active for")
- **Heading Line 2**: Second line of the main heading (e.g., "the Faithful")
- **Description**: Subtitle text below the heading

#### Video Settings

- **Mobile Video (WebM)**: WebM format video for mobile devices
- **Mobile Video (MP4)**: MP4 fallback for mobile devices
- **Desktop Video (WebM)**: WebM format video for desktop devices
- **Desktop Video (MP4)**: MP4 fallback for desktop devices
- **Mobile Video Poster**: Image shown while mobile video loads
- **Desktop Video Poster**: Image shown while desktop video loads

#### Plus Icons

- **Show Top Plus Icon**: Toggle top center plus icon
- **Show Bottom Plus Icon**: Toggle bottom center plus icon
- **Show Bottom Left Icon**: Toggle bottom left plus icon

#### Layout

- **Gutter Size**: Adjust spacing around the section (0.5rem to 3rem)

### Video Requirements

#### Recommended Video Specifications

- **Format**: WebM (primary) + MP4 (fallback)
- **Resolution**:
  - Mobile: 720p or 1080p
  - Desktop: 1080p or 4K
- **Duration**: 10-30 seconds (looping)
- **File Size**: Keep under 10MB for mobile, 20MB for desktop
- **Codec**: H.264 for MP4, VP9 for WebM

#### Video Hosting

- **Shopify Files**: Upload directly to your theme
- **CDN**: Use services like Cloudflare, AWS CloudFront
- **Video Platforms**: Vimeo, YouTube (with direct video URLs)

### Customization

#### CSS Customization

The section uses CSS custom properties for easy customization:

```css
.hero-video-section {
  --hero-opacity: 1;
  --gutter: 1rem;
}
```

#### Text Styling

Customize the heading and description text:

```css
.hero-video-section .lead-text {
  font-size: clamp(2rem, 8vw, 6rem);
  font-weight: 700;
  text-transform: uppercase;
}

.hero-video-section .text-pre.large {
  font-size: 1.125rem;
  line-height: 1.75;
}
```

#### Icon Customization

Modify the plus icons:

```css
.hero-video-section svg {
  width: 0.4375rem;
  height: 0.4375rem;
  color: #6b7280;
}
```

### Responsive Design

The section automatically adapts to different screen sizes:

- **Desktop (1024px+)**: Full layout with desktop video
- **Tablet (768px-1023px)**: Adjusted grid layout
- **Mobile (up to 767px)**: Mobile-optimized layout with mobile video

### Performance Features

- **Lazy loading** for videos
- **Intersection observers** to pause/play videos when in viewport
- **Reduced motion** support for accessibility
- **Mobile optimization** with lower quality settings
- **Poster images** for immediate visual feedback

### Accessibility

- **Screen reader support** with proper heading structure
- **Keyboard navigation** support
- **Reduced motion** preferences respected
- **High contrast mode** support
- **Semantic HTML** structure

## Example Implementation

### Basic Hero Section

```liquid
{% section 'hero-video' %}
```

### Custom Hero Section with Settings

```liquid
{% section 'hero-video',
  heading_line_1: "Your Brand",
  heading_line_2: "Your Message",
  description: "Compelling description here",
  mobile_video: "https://example.com/mobile.webm",
  desktop_video: "https://example.com/desktop.webm"
%}
```

### Page Template Example

```json
{
  "sections": {
    "hero_video": {
      "type": "hero-video",
      "settings": {
        "heading_line_1": "Welcome to",
        "heading_line_2": "Our Store",
        "description": "Discover amazing products",
        "mobile_video": "https://example.com/mobile.webm",
        "desktop_video": "https://example.com/desktop.webm"
      }
    }
  },
  "order": ["hero_video"]
}
```

## Troubleshooting

### Common Issues

1. **Video not playing**

   - Check video format compatibility
   - Ensure videos are properly hosted
   - Verify video URLs are accessible

2. **Layout issues**

   - Check CSS file is loaded
   - Verify no conflicting CSS rules
   - Test in different browsers

3. **Performance problems**
   - Optimize video file sizes
   - Use appropriate video resolutions
   - Consider using CDN hosting

### Browser Support

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 10+)
- **Edge**: Full support
- **Internet Explorer**: Limited support (fallback to poster images)

## Support

For issues or questions:

1. Check the browser console for JavaScript errors
2. Verify all files are properly uploaded
3. Test with different video formats
4. Check Shopify's video hosting recommendations

## License

This section is provided as-is for use with Shopify themes. Modify as needed for your specific requirements.
