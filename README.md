# TorBox Manager

A modern, power-user focused alternative to the default TorBox UI. Built with Next.js for speed and efficiency.

## Features

- **Batch Upload**: Upload multiple torrents with a single click
- **Smart Downloads**: Cherry-pick specific files across multiple torrents
- **Customizable Interface**: Tailor the workflow to match your needs

## Getting Started

### Option 1: Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/crazycacti/torbox-app.git
cd torbox-app
```

2. Build and start the application:
```bash
docker compose up -d --build
```

3. Open [http://localhost:3010](http://localhost:3010) and enter your TorBox API key to begin.

### Option 2: Local Development

1. Clone the repository:
```bash
git clone https://github.com/crazycacti/torbox-app.git
cd torbox-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) and enter your TorBox API key to begin.

## Requirements

### For Docker:
- Docker and Docker Compose
- A running TorBox instance with API access
- Valid TorBox API key

### For Local Development:
- Node.js 18.0 or later
- A running TorBox instance with API access
- Valid TorBox API key

## Tech Stack

- Next.js 14
- Tailwind CSS
- React Hooks
- Server Components

## Docker

The application includes Docker support for easy deployment:

### Quick Start
```bash
docker compose up -d --build
```

### Useful Commands
```bash
# View logs
docker compose logs -f torbox-app

# Stop the application
docker compose down

# Restart the application
docker compose restart

# Update and rebuild
docker compose pull && docker compose up -d --build
```

### Configuration
- **Port**: 3010 (accessible at http://localhost:3010)
- **Health Check**: Available at `/api/health`
- **Logs**: Mounted to `./logs` directory
- **Data**: Mounted to `./data` directory (for persistence)

## Development

The project uses:
- Modern React patterns with hooks
- Tailwind CSS for styling
- Next.js App Router
- Server-side API handling

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[GNU Affero General Public License v3.0](https://choosealicense.com/licenses/agpl-3.0/)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
