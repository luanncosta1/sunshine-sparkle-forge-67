# Plan - Live Geolocation Map Integration

Implement real-time device geolocation in the event map section of the "Clube do Raul" landing page using the browser's Geolocation API.

## Proposed Changes

### Frontend Improvements
- **Map Component Refactoring**: Update the `src/routes/index.tsx` map section to use a state-driven approach for the location.
- **Geolocation Logic**:
    - Implement `navigator.geolocation.getCurrentPosition` with high accuracy settings.
    - Add error handling for `PERMISSION_DENIED`, `POSITION_UNAVAILABLE`, and `TIMEOUT` using toast notifications.
- **Map Rendering**:
    - Replace the static `iframe` with a dynamic Google Maps Embed URL that centers on the user's coordinates when obtained.
    - Alternatively, if a full interactive map is preferred, use a library or a specialized embed that supports markers for "You are here".
    - *Note*: Since the current implementation uses a simple `iframe`, I will add a "Minha localização" button that triggers the geolocation request and updates the map view.
- **User Interface**:
    - Add a "Minha localização" button in the map section.
    - Ensure the button triggers the browser permission prompt if not already granted.
    - Maintain the existing "Como chegar" functionality for the event venue.

## Technical Details
- **API**: Web Geolocation API (`navigator.geolocation`).
- **State Management**: React `useState` for storing coordinates and error messages.
- **Styling**: Tailwind CSS for the new button and glassmorphism consistency.
- **Privacy**: No coordinates will be stored or sent to any server.

## Verification Plan
1. **Manual Testing**:
    - Open the page and click "Minha localização".
    - Grant permission in the browser.
    - Verify the map centers on the current location.
    - Test on mobile and desktop browsers.
2. **Error Handling**:
    - Deny location permission and verify the specific error toast appears.
    - Mock a timeout scenario to verify the timeout message.
