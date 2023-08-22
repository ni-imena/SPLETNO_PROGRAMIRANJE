#  Virtual Runner - Simulated Running App

Virtual Runner is a unique application that allows users to import their running data from Strava and experience their runs in real-time simulation or even in a sped-up mode. This repository contains both the frontend and backend components of the RunnerSim app, along with a Dockerized setup for easy deployment.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Custom Programming Language](#custom-programming-language)
- [Docker Deployment](#docker-deployment)
- [Contributing](#contributing)
- [License](#license)

## Introduction

This is a runner's companion app that not only imports and displays running data from Strava but also provides a unique experience by simulating the runs in real-time or at an accelerated pace. The app aims to enhance the user's motivation and engagement by allowing them to re-experience their favorite runs in an immersive manner as well as predict and aim to optimise routes.

## Features

- Import running data from Strava accounts.
- Simulate past runs in real-time within the app.
- Experience runs at a faster pace for a quick overview.
- User registration and authentication system.
- API for data processing and retrieval.
- Custom programming language for advanced data manipulation.
- Route prediction (upcoming feature)
- Dockerized setup for easy deployment.

## Getting Started

Follow these steps to get the Virtual Runner app up and running on your local machine.

### Prerequisites

- Docker and Docker Compose installed on your system.
- Strava account for importing running data.

### Installation

1. Clone this repository to your local machine:

```bash
git clone https://github.com/ni-imena/SPLETNO_PROGRAMIRANJE.git
cd SPLETNO_PROGRAMIRANJE
```


2. Build and start the Docker containers using Docker Compose:

```bash
docker-compose up --build
```


The app will be accessible at **http://localhost:3000**.

## Usage

1. Visit the app in your web browser at `http://localhost:3000`.
2. Register or log in to your account.
3. Connect your Strava account to import running data.
4. Explore your runs and select a run to experience the simulation.


## API

The RunnerSim app provides an API for data processing and retrieval. The API documentation can be found [here](link-to-api-docs).

## Custom Programming Language

RunnerSim features a custom programming language designed for advanced data manipulation. Detailed documentation on the language syntax and capabilities can be found [here](link-to-custom-language-docs).

## Docker Deployment

The app is Dockerized for easy deployment. Use the provided `docker-compose.yml` file to set up the app in a production environment. Customize the environment variables and configurations as needed.

```bash
docker-compose -f docker-compose.yml up -d
```

---

Feel free to contact us at niimena.vr@.com for any questions or support.

Happy running! 🏃‍♂️🏃‍♀️

