# The Creator AI

Welcome to The Creator AI! Talk to Gemini with context.


## Prerequisites

Before installation, ensure you have the following software installed on your system:

- **Git:** For cloning the project repositories.
- **Node.js and npm (or yarn):** For managing and installing dependencies. Ensure your node version is at least `18`.
- **Serve:** For running the frontend in development mode. (If you don't have `serve` installed, run `npm install -g serve`) 

## Installation

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
sudo ./clone.sh --tag v0.2.0
```

This script will handle the following:
   - Clone the necessary repositories ([frontend](https://github.com/The-Creator-AI/frontend), [backend](https://github.com/The-Creator-AI/backend), and [common](https://github.com/The-Creator-AI/fe-be-common)).
   - Install all dependencies.
   - Build the common package & frontend and backend projects.
   - Create a convenient 'creator' command for launching the application.

## Running The Creator AI
Once the installation is complete, you can start The Creator AI by simply typing:
1. Set Gemini API key
```bash
export GEMINI_API_KEY=...
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
sudo ./clone.sh --tag v0.2.0
```
This will update the repositories, install new dependencies (if any), and rebuild the project.

## Troubleshooting

If you encounter any issues during installation or usage, please refer to the following:

- **Error Messages:** Pay close attention to any error messages displayed in your terminal. They often provide clues about the problem.
- **GitHub Issues:** Check the project repositories on GitHub for existing issue reports or open a new issue if you believe you've found a bug.

## Contributing

We welcome contributions from the community! If you'd like to help improve The Creator AI, feel free to fork the repositories and submit pull requests. 

## Release Notes

### `v0.2.0` (Latest)

- Using socket for live updates

### `v0.1.0`

- Initial release