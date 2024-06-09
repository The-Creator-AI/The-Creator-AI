#!/bin/bash

# Check for root/sudo privileges (optional but recommended)
if [[ $EUID -ne 0 ]]; then
   echo "This script requires sudo privileges. Please run again with 'sudo'." 
   exit 1
fi

# --- Set Variables ---
INSTALL_DIR="$HOME/creator-app"  
FRONTEND_REPO="https://github.com/The-Creator-AI/frontend.git"
BACKEND_REPO="https://github.com/The-Creator-AI/backend.git"
FRONTEND_PORT=3001               
BACKEND_PORT=3000               

# --- Functions ---

function print_error() {
    echo -e "\033[31mERROR:\033[0m $1" # Print errors in red
    exit 1
}

function check_dependency() {
    if ! command -v "$1" &> /dev/null; then
        print_error "Missing dependency: $1. Please install it."
    fi
}

function install_dependencies() {
    echo "Installing dependencies..."
    cd "$INSTALL_DIR/frontend" && npm install > /dev/null 2>&1 || print_error "Failed to install frontend dependencies"
    cd "$INSTALL_DIR/backend" && npm install > /dev/null 2>&1 || print_error "Failed to install backend dependencies"
    echo "Dependencies installed."
}

function build_projects() {
    echo "Building projects..."
    cd "$INSTALL_DIR/frontend" && npm run build > /dev/null 2>&1 || print_error "Failed to build frontend"
    cd "$INSTALL_DIR/backend" && npm run build > /dev/null 2>&1 || print_error "Failed to build backend"
    echo "Projects built."
}

function create_command() {
    echo "Creating 'creator' command..."
    COMMAND_CONTENT="#!/bin/bash

    trap 'kill 0' SIGINT   # Add trap to handle SIGINT (Ctrl+C)

    cd \"$INSTALL_DIR/frontend/build\" && PORT=$FRONTEND_PORT serve -s  &
    cd \"$INSTALL_DIR/backend\" && node dist/main.js &
    
    wait                 # Wait for both processes to finish
    trap - SIGINT        # Reset the trap
    "

    echo "$COMMAND_CONTENT" > /usr/local/bin/creator
    chmod +x /usr/local/bin/creator
    echo "'creator' command created."
}

# --- Main Installation ---

echo "Welcome to the Creator AI installation!"

# --- Check for Dependencies ---
check_dependency git
check_dependency npm
check_dependency serve # Add serve as a dependency

# --- Installation ---

if [ ! -d "$INSTALL_DIR" ]; then
  echo "Cloning repositories..."
  mkdir -p "$INSTALL_DIR"
  git clone "$FRONTEND_REPO" "$INSTALL_DIR/frontend" || print_error "Failed to clone frontend repository"
  git clone "$BACKEND_REPO" "$INSTALL_DIR/backend" || print_error "Failed to clone backend repository"
else
  echo "Directory '$INSTALL_DIR' already exists. Updating..."
  cd "$INSTALL_DIR/frontend" && git pull || print_error "Failed to update frontend"
  cd "$INSTALL_DIR/backend" && git pull || print_error "Failed to update backend"
fi

# Install Dependencies
install_dependencies

# Build Projects
build_projects

# Create 'creator' Command
create_command

echo "Installation complete! Run 'creator' to start the application." 
