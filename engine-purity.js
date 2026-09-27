/* extracted helpers — game.js is the runtime */
function calculatePurity(state, baseGradePurity, hasScale) {
  var target = Math.max(0.0001, state.targetRatio);
  var relError = Math.abs(state.actualRatio - target) / target;
  var sigma = hasScale ? 0.16 : 0.1;
  var ratioScore = Math.exp(-Math.pow(relError / sigma, 2));
  var minT = state.targetTemp[0], maxT = state.targetTemp[1];
  var off = 0;
  if (state.currentTemp < minT) off = minT - state.currentTemp;
  else if (state.currentTemp > maxT) off = state.currentTemp - maxT;
  var tempScore = Math.exp(-off / 14);
  var mixed = ratioScore * 0.72 + tempScore * 0.28;
  var purity = baseGradePurity * mixed;
  if (relError < 0.03 && off === 0) purity = Math.min(0.99, Math.max(0.95, baseGradePurity + 0.04));
  if (relError > 0.2) purity = Math.min(purity, 0.49);
  return Math.round(Math.max(0.05, Math.min(0.99, purity)) * 100) / 100;
}
function checkHazard(state, recipe, cooling) {
  if (state.addSpeed > state.speedLimit) return "BOIL";
  if (state.currentTemp > 130 && !cooling) return "EXPLOSION";
  if (recipe && recipe.toxic && state.currentTemp > recipe.targetTemp[1] + 25 && !cooling) return "TOXIC";
  return "NONE";
}
