(function () {
  "use strict";

  const CHALLENGES = [
    { id: "obstacle", name: "Obstacle Course", desc: "Run, jump, and dodge to the finish." },
    { id: "apple", name: "Apple Catching", desc: "Catch the most apples from the tree." },
    { id: "balance", name: "Balance Beam", desc: "Stay on the beam the longest." },
    { id: "trivia", name: "Trivia Quiz", desc: "Answer questions correctly." },
    { id: "strength", name: "Strength Test", desc: "Push the heaviest weight." },
    { id: "swim", name: "Swimming Race", desc: "First across the pool wins." },
    { id: "luck", name: "Spin the Wheel", desc: "Random luck challenge." },
    { id: "sprint", name: "Sprint Dash", desc: "100-meter dash speed test." },
    { id: "memory", name: "Memory Match", desc: "Remember the pattern." },
    { id: "art", name: "Art Contest", desc: "Best drawing wins points." },
    { id: "dodge", name: "Dodgeball", desc: "Last one standing on the court." },
    { id: "cook", name: "Cooking Challenge", desc: "Best dish wins." },
  ];

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function runChallengeScores(contestants) {
    const challenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
    const results = contestants.map((c) => ({
      id: c.id,
      name: c.name,
      score: Math.floor(Math.random() * 100) + 1,
    }));
    results.sort((a, b) => b.score - a.score);
    return { challenge, results };
  }

  function getBottomThree(results, aliveCount) {
    if (aliveCount <= 3) return results.map((r) => r.id);
    return results.slice(-3).map((r) => r.id);
  }

  window.BFDIBattle = {
    CHALLENGES,
    shuffle,
    runChallengeScores,
    getBottomThree,
  };
})();
