# Implementation Plan

- [x] 1. Create custom counter hook for animations
  - [x] 1.1 Implement useCounter hook with requestAnimationFrame
    - Create `src/hooks/use-counter.tsx` with animation logic
    - Implement quadratic ease-out easing function
    - Accept end value and duration parameters
    - Return current animated count value
    - _Requirements: 2.2, 2.3_

- [x] 2. Refactor landing page into modular components
  - [x] 2.1 Create landing components directory structure
    - Create `src/components/landing/` directory
    - Set up component file structure
    - _Requirements: 1.1, 1.5, 5.1_

  - [x] 2.2 Extract Header component
    - Create `Header.tsx` with navigation and theme toggle
    - Integrate authentication state from useAuth hook
    - Implement responsive navigation menu
    - Add sticky positioning and backdrop blur
    - _Requirements: 1.1, 1.2, 5.2_

  - [x] 2.3 Extract HeroSection component
    - Create `HeroSection.tsx` with main value proposition
    - Implement dual CTA buttons (Get Started, Learn More)
    - Add hero image with overlay effects
    - Include trust indicators (no credit card, free trial)
    - _Requirements: 1.1, 1.2, 5.2_

  - [x] 2.4 Extract and enhance StatsSection component
    - Create `StatsSection.tsx` with animated counters
    - Integrate useCounter hook for three statistics
    - Implement responsive grid layout
    - Add locale-formatted number display
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 2.5 Extract and enhance FeaturesSection component
    - Create `FeaturesSection.tsx` with feature cards
    - Implement horizontal icon-text layout
    - Update all six feature cards to new layout
    - Add hover effects (shadow, border, transform)
    - Ensure responsive behavior
    - _Requirements: 1.1, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 2.6 Extract TestimonialsSection component
    - Create `TestimonialsSection.tsx` with testimonial cards
    - Implement 5-star rating display
    - Add customer avatars with initials
    - Include client logo showcase
    - _Requirements: 1.1, 1.2, 5.2_

  - [x] 2.7 Extract PricingSection component
    - Create `PricingSection.tsx` with beta pricing
    - Implement feature checklist with checkmarks
    - Add background gradient effects
    - Include dual CTAs
    - _Requirements: 1.1, 1.2, 5.2_

  - [x] 2.8 Create FAQSection component
    - Create `FAQSection.tsx` with accordion UI
    - Integrate Radix UI Accordion component
    - Add six FAQ items covering key topics
    - Implement single-item expansion mode
    - Add contact support CTA
    - Ensure left-aligned text for readability
    - _Requirements: 1.1, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 2.9 Extract Footer component
    - Create `Footer.tsx` with navigation links
    - Implement multi-column layout
    - Add social media icons
    - Include newsletter subscription form
    - Add copyright and legal links
    - _Requirements: 1.1, 1.2, 5.2_

  - [x] 2.10 Create barrel export file
    - Create `index.ts` in landing directory
    - Export all landing page components
    - _Requirements: 1.3, 5.1_

  - [x] 2.11 Update main LandingPage component
    - Simplify LandingPage.tsx to composition only
    - Import all components from barrel export
    - Render components in correct order
    - Verify line count is under 30 lines
    - _Requirements: 1.1, 1.2, 1.4, 5.3_

- [x] 3. Verify implementation and code quality
  - [x] 3.1 Run diagnostics on all new components
    - Check for TypeScript errors
    - Verify no linting issues
    - Ensure proper imports
    - _Requirements: 5.3, 5.4_

  - [x] 3.2 Test responsive behavior
    - Verify mobile layout for all sections
    - Test tablet breakpoints
    - Confirm desktop layout
    - _Requirements: 2.5, 4.5_

  - [x] 3.3 Verify animations and interactions
    - Test stats counter animations
    - Verify FAQ accordion functionality
    - Check hover effects on feature cards
    - Test theme toggle functionality
    - _Requirements: 2.2, 2.3, 3.2, 3.3, 3.4, 4.4_

  - [x] 3.4 Code organization review
    - Verify consistent naming conventions
    - Check for code duplication
    - Ensure proper component separation
    - Validate directory structure
    - _Requirements: 5.1, 5.2, 5.4, 5.5_
