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

# Check for root/sudo privileges (optional but recommended)
if [[ $EUID -ne 0 ]]; then
  echo "This script requires sudo privileges. Please run again with 'sudo'."
  exit 1
fi

# --- Set Variables ---
INSTALL_DIR="$HOME/creator-app"
COMMON_REPO="https://github.com/The-Creator-AI/fe-be-common.git" # New common repo
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
  if ! command -v "$1" &>/dev/null; then
    print_error "Missing dependency: $1. Please install it."
  fi
}

function install_dependencies() {
  echo "Installing dependencies..."
  cd "$INSTALL_DIR/fe-be-common" && npm install >/dev/null 2>&1 || print_error "Failed to install common dependencies"
  cd "$INSTALL_DIR/frontend" && npm install >/dev/null 2>&1 || print_error "Failed to install frontend dependencies"
  cd "$INSTALL_DIR/backend" && npm install >/dev/null 2>&1 || print_error "Failed to install backend dependencies"
  echo "Dependencies installed."
}

function build_projects() {
  echo "Building projects..."
  cd "$INSTALL_DIR/fe-be-common" && npm run build >/dev/null 2>&1 || print_error "Failed to build common"
  cd "$INSTALL_DIR/frontend" && npm run build >/dev/null 2>&1 || print_error "Failed to build frontend"
  cd "$INSTALL_DIR/backend" && npm run build >/dev/null 2>&1 || print_error "Failed to build backend"
  echo "Projects built."
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

# --- Get Latest Release Tag ---
function get_latest_release_tag() {
    local repo_url="$1"

    # Fetch tags, filter, sort, and get the latest
    latest_tag=$(git ls-remote --tags --sort=v:refname "$repo_url" | 
                 tail -n 1 | 
                 sed -E 's/.*\/v(.*)/\1/')  # Updated sed pattern

    # Robust tag cleanup
    latest_tag=$(echo "$latest_tag" | sed -E 's/\^{}//') # Remove ^{} 
    latest_tag=$(echo "$latest_tag" | sed -E 's/[^0-9.]//g') # Remove non-numeric characters

    # Check if the cleaned tag matches the expected version format (optional)
    if [[ ! "$latest_tag" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
        echo "Error: Unexpected tag format found: $latest_tag" >&2  # Send error to stderr
        return 1  # Exit the function with an error code
    fi

    latest_tag="v$latest_tag"
    echo "$latest_tag"
}

# --- Functions for Cloning and Updating Repositories ---
function clone_repo() {
  local tag="$1"
  local repo_url="$2"
  local target_dir="$3"

  if [[ -z "$tag" ]]; then
    # If no tag is provided, clone without specifying a branch or tag
    git clone "$repo_url" "$target_dir" || print_error "Failed to clone $repo_url repository"
  else
    # If a tag is provided, clone with the specified tag
    git clone -b "$tag" --single-branch --depth 1 "$repo_url" "$target_dir" || print_error "Failed to clone $repo_url repository with tag v$tag"
  fi
}

function update_repo() {
  local tag="$1"
  local repo_dir="$2"

  if [[ -z "$tag" ]]; then
    # If no tag is provided, update to the latest commit
    cd "$repo_dir" && git pull origin main || print_error "Failed to update $repo_dir repository"
  else
    # If a tag is provided, update to the specified tag
    cd "$repo_dir" && git fetch --all --tags && git checkout tags/"$tag" || print_error "Failed to update $repo_dir repository to tag v$tag"
  fi
}

# --- Main Installation ---
echo "Welcome to the Creator AI installation!"

# --- Check for Dependencies ---
check_dependency git
check_dependency npm
check_dependency serve 

# --- Get Latest Release Tags ---
LATEST_COMMON_TAG=$(get_latest_release_tag "$COMMON_REPO")
LATEST_FRONTEND_TAG=$(get_latest_release_tag "$FRONTEND_REPO")
LATEST_BACKEND_TAG=$(get_latest_release_tag "$BACKEND_REPO")

# --- Use Latest Tags if User Doesn't Specify ---
COMMON_TAG="${TAG:-$LATEST_COMMON_TAG}"
FRONTEND_TAG="${TAG:-$LATEST_FRONTEND_TAG}"
BACKEND_TAG="${TAG:-$LATEST_BACKEND_TAG}"

# --- Clone or Update Repositories ---
if [ ! -d "$INSTALL_DIR" ]; then
  echo "Cloning repositories..."
  mkdir -p "$INSTALL_DIR"
  clone_repo "$COMMON_TAG" "$COMMON_REPO" "$INSTALL_DIR/fe-be-common"
  clone_repo "$FRONTEND_TAG" "$FRONTEND_REPO" "$INSTALL_DIR/frontend"
  clone_repo "$BACKEND_TAG" "$BACKEND_REPO" "$INSTALL_DIR/backend"
else
  echo "Directory '$INSTALL_DIR' already exists. Updating..."

  update_repo "$COMMON_TAG" "$INSTALL_DIR/fe-be-common"
  update_repo "$FRONTEND_TAG" "$INSTALL_DIR/frontend"
  update_repo "$BACKEND_TAG" "$INSTALL_DIR/backend"
fi

# Install Dependencies
install_dependencies

# Build Projects
build_projects

# Create 'creator' Command
create_command

echo "Installation complete! Run 'creator .' to start the application."
