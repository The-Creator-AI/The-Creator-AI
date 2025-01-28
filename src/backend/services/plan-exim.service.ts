import { Injectable } from 'injection-js';
import * as vscode from 'vscode';
import { Services } from './services';
import { ChangePlan } from '@/client/views/change-plan.view/store/change-plan-view.state-type';
import { initialState } from '@/client/views/change-plan.view/store/change-plan-view.initial-state';

@Injectable()
export class PlanExImService {
    async exportAllChangePlans(): Promise<void> {
        const persistentStoreRepository = Services.getPersistentStoreRepository();
        const store = persistentStoreRepository.getChangePlanViewState();
        const changePlans = store?.changePlans || [];

        const jsonString = JSON.stringify(changePlans, null, 2);
        Services.getLoggerService().log(jsonString);

        // Get the workspace folder name
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const workspaceFolderName = workspaceFolders && workspaceFolders.length > 0
            ? workspaceFolders[0].name
            : 'default'; // Provide a default if no workspace is open

        const options: vscode.SaveDialogOptions = {
            defaultUri: vscode.Uri.file(`all_change_plans_${workspaceFolderName}.json`),
            filters: {
                'JSON': ['json']
            }
        };

        const fileUri = await vscode.window.showSaveDialog(options);

        if (fileUri) {
            try {
                await vscode.workspace.fs.writeFile(fileUri, Buffer.from(jsonString, 'utf-8'));
                vscode.window.showInformationMessage(`All change plans exported successfully.`);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to export change plans: ${error}`);
            }
        }
    }

    async importAllChangePlans(): Promise<void> {
        const options: vscode.OpenDialogOptions = {
            canSelectMany: false,
            openLabel: 'Import',
            filters: {
                'JSON': ['json']
            }
        };

        const fileUri = await vscode.window.showOpenDialog(options);

        if (fileUri && fileUri[0]) {
            try {
                const fileContent = await vscode.workspace.fs.readFile(fileUri[0]);
                const plansJson: ChangePlan[] = JSON.parse(Buffer.from(fileContent).toString('utf-8'));

                console.log({ fileContent, plansJson });

                if (!Array.isArray(plansJson)) {
                    vscode.window.showErrorMessage('Invalid change plans format. Expected an array of plans.');
                    return;
                }

                const persistentStoreRepository =
                    Services.getPersistentStoreRepository();
                const store = persistentStoreRepository.getChangePlanViewState();
                const currentPlans = store?.changePlans || [];
                const updatedPlans = [...currentPlans];

                for (const plan of plansJson) {
                    if (!this.isValidChangePlan(plan)) {
                        vscode.window.showWarningMessage(`Skipping invalid change plan: ${(plan as ChangePlan).planTitle}`);
                        continue;
                    }

                    const existingPlanIndex = currentPlans.findIndex(
                        p => p.planTitle === plan.planTitle && p.planDescription === plan.planDescription
                    );

                    if (existingPlanIndex !== -1) {
                        // Update existing plan
                        updatedPlans[existingPlanIndex] = plan;
                    } else {
                        // Add new plan
                        updatedPlans.push(plan);
                    }
                }

                persistentStoreRepository.setChangePlanViewState({
                    ...initialState,
                    changePlans: updatedPlans,
                });
                vscode.window.showInformationMessage(`Change plans imported successfully.`);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to import change plans: ${error}`);
            }
        }
    }

    private isValidChangePlan(plan: any): plan is ChangePlan {
        return (
            typeof plan === 'object' &&
            plan !== null &&
            typeof plan.planTitle === 'string' &&
            typeof plan.planDescription === 'string' &&
            typeof plan.llmResponse === 'string' &&
            typeof plan.planJson === 'object' &&
            Array.isArray(plan.chatHistory) &&
            Array.isArray(plan.selectedFiles)
        );
    }
}
