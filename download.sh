#!/bin/bash

# --- Parse Command Line Arguments ---
while [[ $# -gt 0 ]]; do
  case "$1" in
    --tag)
      TAG="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Default tag
TAG=${TAG:-"v0.2.0"}

# Check for root/sudo privileges (optional but recommended)
if [[ $EUID -ne 0 ]]; then
  echo "This script requires sudo privileges. Please run again with 'sudo'."
  exit 1
fi

# --- Set Variables ---
INSTALL_DIR="$HOME/creator-app"
FRONTEND_PORT=3001
BACKEND_PORT=3000

# --- Functions ---

function download_project() {
  echo "Downloading project..."
  backend_artifact="https://github.com/The-Creator-AI/The-Creator-AI/releases/download/$TAG/backend.zip"
  echo "Downloading $backend_artifact"
  curl -L "$backend_artifact" -o "$INSTALL_DIR/backend.zip"
  unzip "$INSTALL_DIR/backend.zip" -d "$INSTALL_DIR"
  # rm "$INSTALL_DIR/backend.zip"
  frontend_artifact="https://github.com/The-Creator-AI/The-Creator-AI/releases/download/$TAG/frontend.zip"
  echo "Downloading $frontend_artifact"
  curl -L "$frontend_artifact" -o "$INSTALL_DIR/frontend.zip"
  unzip "$INSTALL_DIR/frontend.zip" -d "$INSTALL_DIR"
  # rm "$INSTALL_DIR/frontend.zip"
  echo "Project downloaded."
}

function create_command() {
  echo "Creating 'creator' command..."
  COMMAND_CONTENT="#!/bin/bash

    export CUR_WRK_DIR=\$(readlink -f \${1:-\$(pwd)})
    echo Working Directory: \$CUR_WRK_DIR

    # Check if the creator is already running
    if pgrep -f \"node dist/main.js\" > /dev/null; then
        echo \"creator is already running. Opening the app in a new tab...\"
        # Use xdg-open, open, or sensible-browser based on availability
        if command -v xdg-open > /dev/null; then
            xdg-open \"http://localhost:$FRONTEND_PORT/?path=\$CUR_WRK_DIR\" &
        elif command -v open > /dev/null; then
            open \"http://localhost:$FRONTEND_PORT/?path=\$CUR_WRK_DIR\" &
        elif command -v sensible-browser > /dev/null; then
            sensible-browser \"http://localhost:$FRONTEND_PORT/?path=\$CUR_WRK_DIR\" &
        else
            echo \"Could not find a suitable command to open the browser.\"
        fi
    else 
        echo \"Starting the backend and frontend...\"
        cd \"$INSTALL_DIR/frontend/build\" && PORT=$FRONTEND_PORT serve -s  &
        FRONTEND_PID=\$!
        cd \"$INSTALL_DIR/backend\" && node dist/main.js &
        BACKEND_PID=\$!

        # Use xdg-open, open, or sensible-browser based on availability
        if command -v xdg-open > /dev/null; then
            xdg-open \"http://localhost:$FRONTEND_PORT/?path=\$CUR_WRK_DIR\" &
        elif command -v open > /dev/null; then
            open \"http://localhost:$FRONTEND_PORT/?path=\$CUR_WRK_DIR\" &
        elif command -v sensible-browser > /dev/null; then
            sensible-browser \"http://localhost:$FRONTEND_PORT/?path=\$CUR_WRK_DIR\" &
        else
            echo \"Could not find a suitable command to open the browser.\"
        fi

        wait \$FRONTEND_PID \$BACKEND_PID # Wait for both processes to finish
    fi
    "

  echo "$COMMAND_CONTENT" >/usr/local/bin/creator
  chmod +x /usr/local/bin/creator
  echo "'creator' command created."
}

# --- Main Installation ---
echo "Welcome to the Creator AI installation!"

# --- Clean Install Directory ---
if [ -d "$INSTALL_DIR" ]; then
  rm -rf "$INSTALL_DIR"
fi

mkdir -p "$INSTALL_DIR"

# --- Download Project ---
download_project

# Create 'creator' Command
create_command

echo "Installation complete! Run 'creator .' to start the application."
