/** Dual-ratio + temperature purity and typed hazards. */
export function calculatePurity(state, baseGradePurity, hasScale) {
  const target = Math.max(0.0001, state.targetRatio);
  const relError = Math.abs(state.actualRatio / target - 1);
  const tol = hasScale ? 0.12 : 0.06;
  const ratioScore = Math.exp(-Math.pow(relError / tol, 2));
  const [minT, maxT] = state.targetTemp;
  const t = state.currentTemp;
  let tempScore = 1;
  if (t < minT) tempScore = Math.exp(-Math.pow((minT - t) / 14, 2));
  else if (t > maxT) tempScore = Math.exp(-Math.pow((t - maxT) / 8, 2));
  const gradeCeil = baseGradePurity >= 0.9 ? 0.99 : 0.84;
  let purity = gradeCeil * Math.pow(ratioScore, 2.2) * (0.62 + 0.38 * tempScore);
  const breakPoint = hasScale ? 0.28 : 0.2;
  if (relError >= breakPoint) purity = Math.min(purity, 0.49);
  return Math.round(Math.max(0.08, Math.min(gradeCeil, purity)) * 100) / 100;
}

export function checkHazard(state, recipe) {
  if (state.addSpeed > state.speedLimit) {
    return recipe && recipe.toxic ? "TOXIC" : "BOIL";
  }
  const safe = (recipe && recipe.safeTemp) || 110;
  if (state.currentTemp > safe && state.cooling !== true) return "EXPLOSION";
  if (recipe && recipe.toxic && state.currentTemp > state.targetTemp[1] + 22) return "TOXIC";
  return "NONE";
}

export function purityFactor(p) {
  if (p >= 0.95) return 1.6;
  if (p >= 0.9) return 1.25;
  if (p >= 0.8) return 1;
  if (p >= 0.5) return 0.45;
  return 0.22;
}
