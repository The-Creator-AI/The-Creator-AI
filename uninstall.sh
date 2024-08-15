#!/bin/bash

# --- Set Variables ---
INSTALL_DIR="$HOME/creator-app"
COMMAND_PATH="/usr/local/bin/creator"

# --- Functions ---

function print_error() {
  echo -e "\033[31mERROR:\033[0m $1" # Print errors in red
  exit 1
}

function print_success() {
  echo -e "\033[32mSUCCESS:\033[0m $1" # Print success messages in green
}

# Check for root/sudo privileges
if [[ $EUID -ne 0 ]]; then
  print_error "This script requires sudo privileges. Please run again with 'sudo'."
fi

# --- Main Uninstallation Process ---
echo "Starting Creator AI uninstallation..."

# Remove the repositories
if [ -d "$INSTALL_DIR" ]; then
  echo "Removing Creator AI repositories..."
  rm -rf "$INSTALL_DIR"
  if [ $? -eq 0 ]; then
    print_success "Repositories removed successfully."
  else
    print_error "Failed to remove repositories."
  fi
else
  echo "Creator AI repositories not found. Skipping removal."
fi

# Remove the 'creator' command
if [ -f "$COMMAND_PATH" ]; then
  echo "Removing 'creator' command..."
  rm "$COMMAND_PATH"
  if [ $? -eq 0 ]; then
    print_success "'creator' command removed successfully."
  else
    print_error "Failed to remove 'creator' command."
  fi
else
  echo "'creator' command not found. Skipping removal."
fi

# Final cleanup
echo "Cleaning up..."
if [ -z "$(ls -A $HOME/creator-app 2>/dev/null)" ]; then
  rmdir "$HOME/creator-app" 2>/dev/null
fi

print_success "Creator AI has been uninstalled successfully."
echo "You may want to remove any remaining configuration files or data manually if needed."