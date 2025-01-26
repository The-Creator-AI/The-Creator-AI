import Plan, { PlanProps } from '@/client/modules/plan.module/Plan';
import * as React from 'react';

const PlanStep: React.FC<PlanProps> = (props) => {
    return (
        <Plan {...props}/>
    );
};

export default PlanStep;
