import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="hero shell" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="small-line"></span> MEET YOUR DAILY ENERGY
        </p>
        <h1 id="hero-title">
          Your body.<br />
          Your rhythm.<br />
          <em>Your balance.</em>
        </h1>
        <p className="hero-description">
          Less guesswork. A better starting point. Understand what your body needs, and find a daily calorie target that moves with your goals.
        </p>
        <a className="text-link" href="#calculator">
          Find your balance <span aria-hidden="true">↘</span>
        </a>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="orbit orbit-one"></div>
        <div className="orbit orbit-two"></div>
        <span className="art-label label-top">A LITTLE SCIENCE.</span>
        <div className="balance-stone stone-bottom"></div>
        <div className="balance-stone stone-top"></div>
        <span className="art-spark">✳</span>
        <span className="art-label label-bottom">A LOT MORE YOU.</span>
        <div className="art-caption">
          <span className="status-dot"></span> Built around your body
        </div>
      </div>
    </section>
  );
};
