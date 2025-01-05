# Creator AI Extension

This extension integrates a coding assistant directly into your VS Code environment.

## Features

* **Chat View:** Interact with the AI in a conversational format, ask questions, and get code suggestions.
* **Change Plan View:** Describe code changes you'd like to plan, and the AI will generate a plan for implementation.
* **File Explorer View:** View and select files from your workspace for context-aware code generation.

## Requirements

This extension requires an API key for either Gemini or OpenAI. You'll be prompted to enter your key when you first use the extension.

## Extension Settings

This extension contributes the following settings:

* `creatorExtension.llmRepository`: Stores API keys for LLM services (Gemini, OpenAI).
* `creatorExtension.chatRepository`: Stores chat history and active chat information.

## Known Issues

* Support for multiple workspaces is not fully implemented.
* Some file types may not be recognized or handled correctly in the Change Plan view.

## Release Notes

### 0.0.1

Initial release of the Creator AI extension with basic chat, change plan, and file explorer functionalities.

## Following Extension Guidelines

This extension adheres to the VS Code extension guidelines and best practices.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can edit this README using Visual Studio Code. Some useful keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) for Markdown snippets.

## For More Information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!** 
