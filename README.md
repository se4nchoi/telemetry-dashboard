# Telemetry Dashboard

A real-time monitoring dashboard built with Next.js and TypeScript for visualizing simulated operational telemetry across biotech and automotive scenarios.

<!-- Optional badges -->
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Preview

### Biotech Process Monitoring

![Biotech telemetry dashboard](docs/screenshot/dashboard_bio.png)

### Automotive Telemetry Monitoring

![Vehicle telemetry dashboard](docs/screenshot/dashboard_auto.png)

## Features

* Real-time simulated telemetry updates
* Historical charts for each monitored channel
* Current, minimum, maximum, and average values
* Nominal, warning, danger, and offline states
* Overall system-health calculation
* Packet-loss tracking and fault detection
* Per-channel visibility controls
* Drag-and-drop metric card ordering
* Reusable dashboard components across multiple monitoring scenarios
* Responsive interface for different screen sizes

> **Current status:** All telemetry is generated within the application. The dashboard is not yet connected to physical sensors, STM32 hardware, CAN, MQTT, or an external backend.

## System Status

The application evaluates both telemetry values and simulated communication reliability with simulation.

The overall system can report:

* **Nominal** — monitored channels are operating normally
* **Attention** — a channel enters a warning state or packet loss exceeds the warning threshold
* **Fault Detected** — a channel enters a danger state or packet loss exceeds the fault threshold
* **Offline** — the telemetry connection is disabled

Packet loss is calculated using the number of received and missed packets.

## Tech Stack

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS
* React Context
* Custom React hooks
* Vitest
* ESLint

## Architecture

```text
Simulated telemetry source
            ↓
useTelemetry hook
(metrics, history, packet tracking, status logic)
            ↓
TelemetryContext
            ↓
Rendered React.js Components
```

## Project Structure

```text
app/
├── page.tsx
├── biotech/
│   └── page.tsx
└── vehicle/
    └── page.tsx

components/
├── DashboardShell.tsx
├── MetricCard.tsx
└── TelemetryChart.tsx

context/
└── TelemetryContext.tsx

hooks/
└── useTelemetry.ts
```

## Local Setup

### Prerequisites

Install:

* Node.js
* npm
* Git

### Quick Start

```bash
git clone https://github.com/se4nchoi/telemetry-dashboard.git
cd telemetry-dashboard
npm install
npm run dev
```

Open the dashboard at:

```text
http://localhost:3000
```

The root route redirects to the default biotech monitoring view.

### Production Build

```bash
npm run build
npm run start
```

## Usage

After opening the dashboard:

1. Use the navigation to switch between biotech and vehicle monitoring.
2. Observe the simulated telemetry values and historical charts updating over time.
3. Enable or disable individual telemetry channels.
4. Disconnect the simulated data stream to view the offline state.
5. Drag metric cards to change their display order.
6. Observe how warning, danger, and packet-loss conditions affect the overall system status.

## Current Limitations

The project currently focuses on frontend telemetry simulation and monitoring-interface design.

It does not yet include:

* Physical sensor or STM32 integration
* CAN, MQTT, WebSocket, or OPC UA communication
* A production backend
* Persistent telemetry storage
* Authentication or role-based access
* Event and alarm history
* Production alert delivery
* Automated anomaly detection

This repository should be treated as an exploratory telemetry-dashboard prototype rather than a production monitoring system.

## Roadmap

* Replace simulated telemetry with WebSocket or MQTT data
* Connect the dashboard to an STM32-based sensor system
* Add persistent telemetry and event storage
* Add configurable alert thresholds
* Record alarm and fault history
* Support multiple machines or process lines
* Experiment with anomaly detection and predictive maintenance

## What I Explored

Through this project, I explored:

* Translating operational data into a usable monitoring interface
* Managing shared real-time state with React Context and custom hooks
* Maintaining rolling telemetry history
* Calculating live summary statistics
* Representing nominal, warning, fault, and offline states
* Combining sensor conditions with packet reliability
* Designing reusable components for multiple operational scenarios
* Connecting my full-stack background with industrial monitoring concepts

## Feedback

Bug reports and technical feedback are welcome through GitHub Issues.

## License

This project is licensed under the MIT License.
