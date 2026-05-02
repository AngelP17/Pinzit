# Pinzit gpt-taste QA Gate

## Dependency discipline
- [ ] Check `web/package.json` before every third-party import.
- [ ] Do not import missing packages.
- [ ] Do not use CDN scripts.
- [ ] Rust core remains zero-dependency unless explicitly approved.

## Icon policy
- [ ] Replace `lucide-react` with `@phosphor-icons/react` or `@radix-ui/react-icons`.
- [ ] No emoji icons in code, markup, labels, alt text, buttons, or empty states.

## Typography
- [ ] No Inter.
- [ ] Dashboard/software UI uses premium sans only.
- [ ] No serif in the control room.
- [ ] Landing serif usage must be intentionally limited or replaced.

## Layout
- [ ] No generic centered SaaS hero.
- [ ] No generic 3-card feature rows.
- [ ] Use asymmetric grid on desktop.
- [ ] Collapse aggressively to single-column mobile below 768px.
- [ ] Use `min-h-[100dvh]`, never `h-screen`.

## Visual system
- [ ] No pure black backgrounds.
- [ ] No purple AI-gradient aesthetic.
- [ ] One restrained accent color.
- [ ] No excessive outer glows.
- [ ] Use borders, spacing, and hierarchy instead of card spam.

## Interaction states
- [ ] Loading state.
- [ ] Empty state.
- [ ] Error state.
- [ ] Invalid artifact state.
- [ ] Partial artifact state.
- [ ] Degraded browser capability state.
- [ ] Reduced-motion safe state.

## Performance
- [ ] Motion uses transform and opacity only.
- [ ] Heavy animation isolated into small client components.
- [ ] Three/R3F canvas has fallback.
- [ ] Bundle guard remains enforced.
- [ ] No continuous React state updates for pointer tracking.

## Product usefulness
- [ ] User can load verdict JSON.
- [ ] User can load stats CSV.
- [ ] User can inspect each constraint.
- [ ] User can open evidence spans.
- [ ] User can compare two runs.
- [ ] User can export or copy CI-ready summary.
- [ ] User can understand failure propagation within 10 seconds.
