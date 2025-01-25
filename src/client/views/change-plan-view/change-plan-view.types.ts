export enum ChangePlanSteps {
  ApiKeyManagement = 'ApiKeyManagement',
  Context = 'Context',
  Plan = 'Plan',
  Commit = 'Commit', 
}

export type ChangePlanStepsConfig = {
  [key in ChangePlanSteps]: {
    indicatorText: string;
    renderStep: () => JSX.Element;
  };
};