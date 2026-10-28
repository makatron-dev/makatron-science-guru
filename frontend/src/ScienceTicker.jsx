import React from "react";

const FACTS = [
  "The human brain is 73 percent water. Mild dehydration can shrink it.",
  "A single lightning bolt contains enough energy to toast 100,000 slices of bread.",
  "Photosynthesis is the only process on Earth that captures light energy.",
  "There are more possible chess games than there are atoms in the universe.",
  "The mitochondrion was once a free-living bacteria absorbed by a cell.",
  "Your body produces about 1 million red blood cells every single second.",
  "Sound travels about 4 times faster in water than it does in air.",
  "Hafnium carbonitride has the highest known melting point at 4,200 degrees C.",
  "It takes 1,000 years for a plastic bottle to decompose in a landfill.",
  "Light from the Sun takes exactly 8 minutes and 20 seconds to reach Earth.",
  "Water is composed of two hydrogen atoms and one oxygen atom.",
  "Carbon dioxide is essential for photosynthesis in plants."
];

export default function ScienceTicker() {
  const items = [...FACTS, ...FACTS];

  return (
    <div className="news-ticker-container">
      <div className="news-ticker-label">
        HEADLINES
      </div>
      <div className="news-ticker-content">
        {items.map((fact, index) => (
          <div key={index} className="news-ticker-item">
            <span className="ticker-dot"></span>
            <span>{fact}</span>
          </div>
        ))}
      </div>
    </div>
  );
}