import * as vscode from "vscode";
import { StorageKeysEnum } from "../types/storage-keys.enum";
import { getContext } from "../../extension";
import {ChangePlanViewStore} from '@/client/views/change-plan-view/store/change-plan-view.state-type';

export class PersistentStoreRepository {
  private readonly workspaceState: vscode.Memento;

  constructor() {
    this.workspaceState = getContext().workspaceState;
  }

  public getChangePlanViewState(): ChangePlanViewStore | undefined {
    const data = this.workspaceState.get<ChangePlanViewStore>(
      StorageKeysEnum.ChangePlanViewState
    );
    return data;
  }

  public setChangePlanViewState(data: ChangePlanViewStore): void {
    this.workspaceState.update(StorageKeysEnum.ChangePlanViewState, data);
  }

  public clearChangePlanViewState(): void {
    this.workspaceState.update(StorageKeysEnum.ChangePlanViewState, undefined);
  }
}
