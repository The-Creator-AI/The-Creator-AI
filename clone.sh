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
    # Default ports
    DEFAULT_FRONTEND_PORT=3001
    DEFAULT_BACKEND_PORT=3000

    # Parse command line arguments
    while [[ \$# -gt 0 ]]; do
        case \"\$1\" in
            --shutdown)
                SHUTDOWN=true
                shift
                ;;
            --frontend-port)
                FRONTEND_PORT=\"\$2\"
                shift 2
                ;;
            --backend-port)
                BACKEND_PORT=\"\$2\"
                shift 2
                ;;
            *)
                CUR_WRK_DIR=\$(readlink -f \"\$1\")
                shift
                ;;
        esac
    done

    # Set default working directory if not provided
    CUR_WRK_DIR=\${CUR_WRK_DIR:-\$(pwd)}
    echo \"Working Directory: \$CUR_WRK_DIR\"

    # Set default ports if not provided
    FRONTEND_PORT=\${FRONTEND_PORT:-\$DEFAULT_FRONTEND_PORT}
    BACKEND_PORT=\${BACKEND_PORT:-\$DEFAULT_BACKEND_PORT}

    # Function to shutdown the application
    shutdown_app() {
        echo \"Shutting down the application...\"
        pkill -f \"node dist/main.js\"
        pkill -f \"serve -s.*:\$FRONTEND_PORT\"
        echo \"Application shut down successfully.\"
        exit 0
    }

    # Check if shutdown flag is set
    if [ \"\$SHUTDOWN\" = true ]; then
        shutdown_app
    fi

    # Check if the creator is already running
    if pgrep -f \"node dist/main.js\" > /dev/null; then
        echo \"creator is already running. Opening the app in a new tab...\"
        # Use xdg-open, open, or sensible-browser based on availability
        if command -v xdg-open > /dev/null; then
            xdg-open \"http://localhost:\$FRONTEND_PORT/?path=\$CUR_WRK_DIR\" &
        elif command -v open > /dev/null; then
            open \"http://localhost:\$FRONTEND_PORT/?path=\$CUR_WRK_DIR\" &
        elif command -v sensible-browser > /dev/null; then
            sensible-browser \"http://localhost:\$FRONTEND_PORT/?path=\$CUR_WRK_DIR\" &
        else
            echo \"Could not find a suitable command to open the browser.\"
        fi
    else 
        echo \"Starting the backend and frontend...\"
        cd \"$INSTALL_DIR/frontend/build\" && PORT=\$FRONTEND_PORT BACKEND_PORT=\$BACKEND_PORT serve -s &
        FRONTEND_PID=\$!
        cd \"$INSTALL_DIR/backend\" && PORT=\$BACKEND_PORT node dist/main.js &
        BACKEND_PID=\$!

        # Use xdg-open, open, or sensible-browser based on availability
        if command -v xdg-open > /dev/null; then
            xdg-open \"http://localhost:\$FRONTEND_PORT/?path=\$CUR_WRK_DIR\" &
        elif command -v open > /dev/null; then
            open \"http://localhost:\$FRONTEND_PORT/?path=\$CUR_WRK_DIR\" &
        elif command -v sensible-browser > /dev/null; then
            sensible-browser \"http://localhost:\$FRONTEND_PORT/?path=\$CUR_WRK_DIR\" &
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
    # If no tag is provided, clone the default branch
    git clone "$repo_url" "$target_dir" || print_error "Failed to clone $repo_url repository"
  else
    # If a tag is provided, clone with the specified tag
    git clone -b "$tag" --single-branch --depth 1 "$repo_url" "$target_dir" || print_error "Failed to clone $repo_url repository with tag $tag"
  fi
}

function update_repo() {
  local tag="$1"
  local repo_dir="$2"

  cd "$repo_dir" || print_error "Could not cd into $repo_dir"

  if [[ -z "$tag" ]]; then
    # If no tag is provided, update to the latest commit on the default branch
    git fetch origin || print_error "Failed to fetch updates for $repo_dir"
    git checkout $(git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@') || print_error "Failed to checkout default branch in $repo_dir"
    git pull || print_error "Failed to pull latest changes in $repo_dir"
  else
    # Delete all local tags
    git tag -l | xargs git tag -d
    git fetch --all --tags || print_error "Failed to fetch tags for $repo_dir"
    git checkout --force "tags/$tag" || print_error "Failed to checkout tag $tag in $repo_dir"
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

  # If the directory exists, update the repositories otherwise clone them
  if [ -d "$INSTALL_DIR/fe-be-common" ]; then
    update_repo "$COMMON_TAG" "$INSTALL_DIR/fe-be-common"
  else
    clone_repo "$COMMON_TAG" "$COMMON_REPO" "$INSTALL_DIR/fe-be-common"
  fi

  if [ -d "$INSTALL_DIR/frontend" ]; then
    update_repo "$FRONTEND_TAG" "$INSTALL_DIR/frontend"
  else
    clone_repo "$FRONTEND_TAG" "$FRONTEND_REPO" "$INSTALL_DIR/frontend"
  fi  

  if [ -d "$INSTALL_DIR/backend" ]; then
    update_repo "$BACKEND_TAG" "$INSTALL_DIR/backend"
  else
    clone_repo "$BACKEND_TAG" "$BACKEND_REPO" "$INSTALL_DIR/backend"
  fi
fi

# Install Dependencies
install_dependencies

# Build Projects
build_projects

# Create 'creator' Command
create_command

echo "Installation complete! Run 'creator .' to start the application."
