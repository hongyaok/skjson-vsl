export { SkjsonDecisionTree, SkjsonDecisionTreePredict } from './components/DecisionTreeVis';
export { SkjsonRandomForest, SkjsonRandomForestPredict } from './components/RandomForestVis';
export { SkjsonGradientBoosting, SkjsonGradientBoostingPredict } from './components/GradientBoostingVis';
export { SkjsonLinearModel } from './components/LinearModelVis';
export * from './components/LinearModelVis';
export { SkjsonModelVisualizer } from './components/ModelVisualizer';

export function register() {
  console.log('skjson-vsl web components registered');
}
