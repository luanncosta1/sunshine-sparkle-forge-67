# Plan - Build Vibe Festival 2024 Landing Page

The user wants to replace the placeholder index page with a concert ticket landing page for "VIBE FESTIVAL 2024", based on the provided reference image.

## Proposed Changes

### Assets and Styling
- Implement the dark theme with orange highlights (#FF4500-ish) as seen in the image.
- Configure Tailwind v4 theme colors for the festival's palette.
- Use a font like 'Archivo Black' or similar bold sans-serif for headings to match the festival vibe.

### Components
- **Navbar**: Transparent-to-dark fixed header with links for "Início", "Programação", "Mapa de Evento", "Contato" and a "Comprar Ingressos" button.
- **Hero Section**: Full-height background image (concert crowd) with the large orange title "VIBE FESTIVAL 2024: A NOITE DA SUA VIDA" and a primary CTA.
- **Ticket Types Section**: A grid of three cards ("Pista", "VIP", "Camarote") with pricing and purchase buttons.
- **Schedule Section (Programação)**: A vertical timeline showing artists and set times.
- **Event Map Section (Mapa do Evento)**: A styled dark map display.
- **Footer**: Social links, quick links, and a newsletter sign-up form.

### Technical Details
- Use React 19 components with Tailwind CSS v4.
- Update `src/routes/index.tsx` to include all these sections.
- Add proper SEO metadata to the route `head()`.
- Ensure mobile responsiveness for the ticket grid and timeline.

## User Review Required

> [!IMPORTANT]
> Since the original message was slightly ambiguous (replacing text with identical text), I am proceeding with building the full landing page shown in the uploaded screenshot as that is the standard behavior for a blank template.
