import { Store } from "../../../store/store";
import { ChangePlanViewStore } from "./change-plan-view.state-type";
import { initialState } from "./change-plan-view.initial-state";
import { KeyPaths, getNestedValue } from "../../../utils/key-path";

type ChangePlanViewActions =
  | `Change Plan View : SET ${KeyPaths<ChangePlanViewStore>}`
  | "Change Plan View : SET NEW EMPTY CHANGE PLAN";

export const changePlanViewStoreStateSubject = new Store<
  ChangePlanViewStore,
  ChangePlanViewActions
>(initialState);

export const getChangePlanViewState = (
  keyPath?: KeyPaths<ChangePlanViewStore>
) => getNestedValue(changePlanViewStoreStateSubject.getValue(), keyPath);
