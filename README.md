# Knighty

A minimal, responsive landing page for describing a stay. The Show matches count is currently a zero placeholder. AI matching, property databases, and account authentication are not connected; prompts and login credentials are not sent or stored. No dependencies or API keys are required for this local prototype.

## Run locally

With Node.js installed, run `npm run dev`, then open http://127.0.0.1:4173.

Set `PORT` to use another port. Stop the server with Ctrl+C.

## Edit

The homepage account display is ready for a future authentication provider. After verifying a session, call `window.knightyAccount.setUser({ id, name, picture })`; call `setUser(null)` on logout. The signed-in display shows the name and photo (initials if missing or broken) and hides the entire login/signup note. This UI hook does not authenticate users; no demo session is saved.

- `index.html`: page text and structure
- `styles.css`: appearance and responsive layout
- `app.js`: clear button and search validation
- `server.mjs`: local development server

The static HTML, CSS, and JavaScript can also be deployed on a static web host. No build step is needed.
