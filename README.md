# Traffic Light Network Simulation

An interactive simulation of a traffic light network with adaptive timing and fault tolerance.

## Setup Instructions

1. Make sure you have [Node.js](https://nodejs.org/) installed (version 16 or higher)

2. Install pnpm if you haven't already:
   ```bash
   npm install -g pnpm
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

   Or build and run the production version:
   ```bash
   pnpm build
   pnpm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- Interactive traffic light network visualization
- Adaptive timing based on node failures
- Real-time network status monitoring
- Drag-and-drop node positioning
- Automatic connection management
- Fault simulation and recovery

## Project Structure

- `/app` - Next.js app router components.
- `/components` - React components.
- `/lib` - Core logic for traffic light nodes and server.
- `/styles` - Global styles and theme configuration.
- `/public` - Static assets.

## Technologies Used

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Shadcn UI Components 
