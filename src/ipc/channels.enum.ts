export enum ClientToServerChannel {
  SendMessage = "clientToServer.sendMessage",
  RequestChatHistory = "clientToServer.requestChatHistory",
  RequestOpenEditors = "clientToServer.requestOpenEditors",
  SendSelectedEditor = "clientToServer.sendSelectedEditor",
  RequestWorkspaceFiles = "clientToServer.requestWorkspaceFiles",
  RequestFileCode = "clientToServer.requestFileCode",
  RequestOpenFile = "clientToServer.requestOpenFile",
  SendStreamMessage = "clientToServer.sendStreamMessage",
  PersistStore = "clientToServer.persistStore",
  FetchStore = "clientToServer.fetchStore",
  RequestCommitMessageSuggestions = "clientToServer.requestCommitMessageSuggestions",
  CommitStagedChanges = "clientToServer.commitStagedChanges",
  RequestStreamFileCode = "clientToServer.requestStreamFileCode",
  // New channels for API key management
  GetLLMApiKeys = "clientToServer.getLLMApiKeys",
  SetLLMApiKey = "clientToServer.setLLMApiKey",
  DeleteLLMApiKey = "clientToServer.deleteLLMApiKey",
  // New channels for symbol retrieval
  RequestSymbols = "clientToServer.requestSymbols" 
}

export enum ServerToClientChannel {
  SendMessage = "serverToClient.sendMessage",
  SendChatHistory = "serverToClient.sendChatHistory",
  SendOpenEditors = "serverToClient.sendOpenEditors",
  SendWorkspaceFiles = "serverToClient.sendWorkspaceFiles",
  SendFileCode = "serverToClient.sendFileCode",
  StreamMessage = "serverToClient.streamMessage",
  SetChangePlanViewState = "serverToClient.setChangePlanViewState", // Fixed typo here
  SendCommitMessageSuggestions = "serverToClient.sendCommitMessageSuggestions",
  StreamFileCode = "serverToClient.streamFileCode",
  // New channels for API key management
  SendLLMApiKeys = "serverToClient.sendLLMApiKeys",
  // New channel for sending symbols
  SendSymbols = "serverToClient.sendSymbols" 
}