// /Users/pulkitsingh/dev/The Creator AI/the-creator-ai/src/views/change-plan-view/change-plan-view.types.ts

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