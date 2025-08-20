# DesktopChat Project Context

## Project Overview

DesktopChat is a powerful, local-first desktop application for interacting with and managing AI assistants, agents, and knowledge bases. It's built using Tauri, which allows it to have a web-based frontend with a native desktop experience.

### Key Features

* **Assistants**: Create, manage, and chat with highly configurable AI assistants that can leverage local knowledge bases.  
* **Agents**: Manage and utilize a roster of pre-defined and custom agents for various tasks.  
* **Knowledge Bases**: Build and manage vector-based knowledge stores from local files (PDF, TXT, MD), enabling powerful Retrieval-Augmented Generation (RAG) capabilities.  
* **File Management**: A centralized location for managing all user-uploaded files.  
* **Extensive Settings**: A detailed settings panel for configuring LLM providers, default models, web search APIs, data storage (including Qdrant), and application personalization.

## Implementation Plan & Design Review

Before beginning development or making modifications, it is **mandatory** to review the complete implementation plan and design specifications.

* **Design/**: This directory contains the core project plans.  
  * **Plan.md**: The high-level overview and project goals.  
  * **Backend.md**: Detailed backend architecture, API specifications, and database schema.  
  * **Frontend.md**: Frontend component structure, state management strategy, and UI/UX flow.  
* **Design/reference images/**: This folder contains all UX/UI mockups and visual references.

**Ensure that the implementation plan outlined in these documents is followed and 100% completed.**

## Technology Stack

* **Application Framework**: Tauri (Rust-based desktop application framework)  
* **Backend Runtime**: Deno (TypeScript/JavaScript runtime)  
* **Vector Database**: Qdrant  
* **Metadata Database**: SQLite  
* **Frontend Framework**: React with Vite  
* **State Management**: Zustand & TanStack Query  
* **Styling**: Tailwind CSS  
* **Routing**: React Router

## Project Structure

├── Design/                   \# Implementation plans and UX/UI reference images  
├── src/                      \# React Frontend Source  
│   ├── api/                  \# Tauri command abstractions  
│   ├── components/           \# Reusable UI components  
│   ├── features/             \# Feature-specific components and logic  
│   ├── hooks/                \# Custom React hooks  
│   ├── pages/                \# Top-level page components  
│   └── stores/               \# Zustand state management stores  
├── src-deno/                 \# Deno Backend Source  
│   ├── api/                  \# Backend API route handlers  
│   ├── core/                 \# Core business logic (RAG, file processing)  
│   ├── db/                   \# Database clients (SQLite, Qdrant) and schema  
│   ├── lib/                  \# LLM client implementations  
│   └── services/             \# Services for handling specific domains  
└── src-tauri/                \# Tauri Rust Source and configuration

## API Endpoints

The Deno backend exposes the following RESTful API endpoints:

### Knowledge Bases

* GET /api/knowledge-bases \- List all knowledge bases  
* POST /api/knowledge-bases \- Create a new knowledge base  
* POST /api/knowledge-bases/add-file \- Add a file to a knowledge base

### Assistants

* GET /api/assistants \- List all assistants  
* POST /api/assistants \- Create a new assistant  
* PUT /api/assistants/{assistantId} \- Update an assistant  
* DELETE /api/assistants/{assistantId} \- Delete an assistant

### Agents

* GET /api/agents \- List all agents

### Chat

* POST /api/chat/sessions \- Start a new chat session  
* POST /api/chat/sessions/{sessionId} \- Send a message to a chat session

## Key Configuration Files

* package.json \- Frontend dependencies and scripts  
* deno.json \- Deno backend configuration and tasks  
* vite.config.ts \- Vite build configuration  
* tailwind.config.js \- Tailwind CSS configuration  
* src-tauri/tauri.conf.json \- Tauri application configuration

## Development Workflow

All development commands are run from the project root.

### Frontend (React \+ Vite)

* **Run development server**: npm run dev  
* **Build for production**: npm run build  
* **Run tests**: npm run test

### Backend (Deno)

* **Run development server with hot-reloading**: deno task start  
* **Run tests**: deno task test  
* **Run tests with coverage**: deno task test-cov

### Tauri Desktop App

* **Run the full desktop application in development mode**: npm run tauri dev  
* **Build the desktop application**: npm run tauri build