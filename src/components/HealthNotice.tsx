import React from 'react';

export const HealthNotice: React.FC = () => {
  return (
    <section className="health-note shell" aria-label="Health information">
      <span aria-hidden="true">ⓘ</span>
      <p>
        For general adult education, not medical advice. Not intended for pregnancy, breastfeeding, people under 18, or managing an eating disorder or a medical condition affecting nutrition. The equation may be less accurate for some bodies, including highly muscular people and people receiving hormone therapy. A registered dietitian or qualified clinician can help personalize your needs.
      </p>
    </section>
  );
};
