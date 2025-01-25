import * as React from "react";

export interface StepsConfig {
  [key: string]: {
    indicatorText: string;
    renderStep: () => JSX.Element;
  };
};

interface ProgressStepsProps {
  currentStep: string;
  handleStepClick: (step: string) => void;
  stepsConfig: StepsConfig;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({
  currentStep,
  handleStepClick,
  stepsConfig,
}) => {
  const steps = Object.keys(stepsConfig);

  return (
    <div className="flex items-center justify-between w-full pl-16 pr-16 pt-4 pb-12 border-b border-gray-600">
      {steps.map((step: string, index: number) => (
        <React.Fragment key={step}>
          <div
            className="flex flex-col items-center"
            onClick={() => handleStepClick(step)}
            data-testid={`step-indicator-${step}`}
          >
            <div
              className={`w-4 h-4 rounded-full ${
                currentStep === step ? "bg-blue-500" : "bg-gray-300"
              } cursor-pointer relative`}
            >
              <span
                className={`text-xs mt-4 whitespace-nowrap ${
                  currentStep === step ? "text-blue-500" : "text-gray-500"
                } absolute top-full left-1/2 -translate-x-1/2`}
              >
                {stepsConfig[step]?.indicatorText}
              </span>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className="flex-grow border-t border-gray-300"
              data-testid="step-indicator-divider"
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProgressSteps;
