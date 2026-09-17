import React from 'react';

export const ScienceSection: React.FC = () => {
  return (
    <section id="method" className="method-section shell" aria-labelledby="method-heading">
      <div className="method-intro">
        <p className="eyebrow">02 / BEHIND THE NUMBERS</p>
        <h2 id="method-heading">
          Science, without<br />
          the overwhelm.
        </h2>
        <p>No magic numbers. Just an established equation and a little context.</p>
      </div>
      <div className="method-details">
        <details open>
          <summary>
            <span>01</span> Start with resting energy
          </summary>
          <p>
            We use the Mifflin–St Jeor equation: 10 × weight (kg) + 6.25 × height (cm) − 5 × age + a sex coefficient (+5 male, −161 female). It estimates resting energy needs, shown here as BMR.{' '}
            <a href="https://pubmed.ncbi.nlm.nih.gov/2305711/" target="_blank" rel="noopener noreferrer">
              Read the original study ↗
            </a>
          </p>
        </details>
        <details>
          <summary>
            <span>02</span> Add your everyday movement
          </summary>
          <p>
            We multiply resting energy by an activity factor (1.2, 1.375, 1.55, 1.725, or 1.9) to estimate total daily energy expenditure. These are broad approximations; workout frequency alone cannot capture your actual energy use.
          </p>
        </details>
        <details>
          <summary>
            <span>03</span> Leave room for your goal
          </summary>
          <p>
            Loss starts at a 15% deficit; gain starts at a 10% surplus. Loss targets are limited to at least 1,200 kcal with the female coefficient or 1,500 with the male coefficient. These are general guardrails, not a guarantee of adequate nutrition. We withhold loss targets when estimated BMI is below 18.5 or maintenance is at or below the guardrail.
          </p>
        </details>
      </div>
    </section>
  );
};
