# The Creator AI - README

Welcome to The Creator AI! This innovative tool empowers you to generate creative content. Follow these steps to get started:

## Prerequisites

Before installation, ensure you have the following software installed on your system:

- **Git:** For cloning the project repositories.
- **Node.js and npm (or yarn):** For managing and installing dependencies.
- **Serve:** For running the frontend in development mode. (If you don't have `serve` installed, run `npm install -g serve`) 

## Installation

1. **Download the install-creator.sh script** 

```bash
curl -O https://raw.githubusercontent.com/The-Creator-AI/The-Creator-AI/main/install-creator.sh
```

2. **Make install-creator.sh executable** 

```bash
chmod +x install-creator.sh
```
3. **Run the install-creator.sh Script:**
```bash
sudo ./install-creator.sh
```
This script will handle the following:
   - Clone the necessary repositories.
   - Install all dependencies.
   - Build the frontend and backend projects.
   - Create a convenient 'creator' command for launching the application.

## Running The Creator AI
Once the installation is complete, you can start The Creator AI by simply typing:
```bash
creator 
```
This will launch both the frontend and backend, and open the application in your default web browser.

## Updating The Creator AI

**Re-run the install-creator.sh Script:**

```bash
sudo ./install-creator.sh
```
This will update the repositories, install new dependencies (if any), and rebuild the project.

## Troubleshooting

If you encounter any issues during installation or usage, please refer to the following:

- **Error Messages:** Pay close attention to any error messages displayed in your terminal. They often provide clues about the problem.
- **GitHub Issues:** Check the project repositories on GitHub for existing issue reports or open a new issue if you believe you've found a bug.

## Contributing

We welcome contributions from the community! If you'd like to help improve The Creator AI, feel free to fork the repositories and submit pull requests. 
