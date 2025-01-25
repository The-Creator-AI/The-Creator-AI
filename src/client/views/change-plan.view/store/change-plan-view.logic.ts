import { ClientToServerChannel } from "@/common/ipc/channels.enum";
import { ClientPostMessageManager } from "@/common/ipc/client-ipc";
import {
  KeyPaths,
  KeyPathValue,
  setNestedValue,
} from "@/common/utils/key-path";
import { initialState } from "./change-plan-view.initial-state";
import { ChangePlanViewStore } from "./change-plan-view.state-type";
import { changePlanViewStoreStateSubject } from "./change-plan-view.store";

export const setNewEmptyChangePlan = () => {
  const newValue: ChangePlanViewStore = {
    ...changePlanViewStoreStateSubject.getValue(),
    changeDescription: "",
    llmResponse: "",
    chatHistory: [],
    fileChunkMap: {},
    isLoading: false,
  };
  changePlanViewStoreStateSubject._next(
    newValue,
    "Change Plan View : SET NEW EMPTY CHANGE PLAN"
  );

  const clientIpc = ClientPostMessageManager.getInstance();
  clientIpc.sendToServer(ClientToServerChannel.PersistStore, {
    storeName: "changePlanViewState",
    storeState: newValue,
  });
};

export const setChangePlanViewState =
  <Key extends KeyPaths<ChangePlanViewStore>>(keyPath: Key) =>
  (value: KeyPathValue<Key, ChangePlanViewStore>) => {
    const newValue = setNestedValue(
      changePlanViewStoreStateSubject.getValue(),
      keyPath,
      value
    );
    changePlanViewStoreStateSubject._next(
      {
        ...newValue,
      },
      `Change Plan View : SET ${keyPath}`
    );

    const clientIpc = ClientPostMessageManager.getInstance();
    clientIpc.sendToServer(ClientToServerChannel.PersistStore, {
      storeName: "changePlanViewState",
      storeState: newValue,
    });
  };
