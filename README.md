
<p align="center">
	<img width="110" src="https://github.com/user-attachments/assets/c1847da8-64f1-4d44-bb70-f4211cb3744f](https://github.com/user-attachments/assets/ecb8456d-cb3a-40d4-8eea-223287412f6a">
</p>
<h1 align="center">
	The Creator AI
</h1>

Talk to LLMs with easy code context. Choose files through UI.

<img src="./demo.gif" width="1400" />

## Prerequisites

Before installation, ensure you have the following software installed on your system:

- **Git:** For cloning the project repositories.
- **Node.js and npm (or yarn):** For managing and installing dependencies. Ensure your node version is at least `18`.
- **Serve:** For running the frontend in development mode. (If you don't have `serve` installed, run `npm install -g serve`) 

## Installation

It's a **self hosted** web app. Below are the steps to get started -

1. **Download the clone.sh script** 

```bash
curl -O https://raw.githubusercontent.com/The-Creator-AI/The-Creator-AI/main/clone.sh
```

2. **Make clone.sh executable** 

```bash
chmod +x clone.sh
```
3. **Run the clone.sh Script:**
```bash
sudo ./clone.sh --tag v0.3.0
```

This script will handle the following:
   - Clone the necessary repositories ([frontend](https://github.com/The-Creator-AI/frontend), [backend](https://github.com/The-Creator-AI/backend), and [common](https://github.com/The-Creator-AI/fe-be-common)).
   - Install all dependencies.
   - Build the common package & frontend and backend projects.
   - Create a convenient 'creator' command for launching the application.

## Running The Creator AI
Once the installation is complete, you can start The Creator AI by simply typing:
1. Set Gemini API key/OPENAI_API_KEY
```bash
export GEMINI_API_KEY=... # export OPENAI_API_KEY=...
```

2. Launch creator
```bash
creator .
```

This will launch both the frontend and backend, and open the application in your default web browser.  

**Note:** You can provide which directory to load as argument to creator command - `creator <directory>`

## Updating The Creator AI

**Re-run the clone.sh Script:**

```bash
sudo ./clone.sh --tag v0.3.0
```
This will update the repositories, install new dependencies (if any), and rebuild the project.

## Install Manually
The `clone.sh` script is only tested on Mac so far, will be testing & supporting other platforms with time.
Meanwhile, you can follow these steps to get the setup ready manually -

### Step 1: Clone the Repositories

   ```
   git clone https://github.com/The-Creator-AI/fe-be-common.git
   git clone https://github.com/The-Creator-AI/frontend.git
   git clone https://github.com/The-Creator-AI/backend.git
   ```

### Step 2: Build & Run

1. Install common dependencies:
   ```bash
   cd ./fe-be-common       # <-----------------  Dependency for frontend & backend both, must be kept adjacent to those
   npm install
   npm run build           
   ```
2. Install backend dependencies:
   ```bash
   cd ./backend
   npm install
   npm run build
   export GEMINI_API_KEY=... # export OPENAI_API_KEY=...
   node dist/main.js       # <-----------------   BACKEND
   ```
3. Install frontend dependencies:
   ```bash
   cd ./frontend
   npm install
   npm run build
   cd build
   serve -s                # <-----------------   FRONTEND
   ```

### Releases
The steps above run the latest code. To run a specific release, checkout the tag for that release (in every repo).
Latest stable tag is `v0.3.0`.
```
git fetch --all --tags
git checkout --force "tags/v0.3.0"
```

## Troubleshooting

If you encounter any issues during installation or usage, please refer to the following:

- **Error Messages:** Pay close attention to any error messages displayed in your terminal. They often provide clues about the problem.
- **GitHub Issues:** Check the project repositories on GitHub for existing issue reports or open a new issue if you believe you've found a bug.

## Contributing

We welcome contributions from the community! If you'd like to help improve The Creator AI, feel free to fork the repositories and submit pull requests. 

## Release Notes

### `v0.3.0`

- Updated design

### `v0.2.0`

- Using socket for live updates

### `v0.1.0`

- Initial release
