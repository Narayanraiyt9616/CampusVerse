# CampusVerse AI — Intelligence & Optimization Microservice (Part 3 Staged)

## Overview
This directory is staged for **Part 3** of the CampusVerse AI Final Year Project. In Part 3, this service will implement machine learning inference, natural language processing, and heuristic constraint satisfaction solvers.

## Planned Technology Stack (Part 3)
- **Language**: Python 3.10+ / 3.11
- **Framework**: FastAPI (Asynchronous ASGI)
- **ASGI Server**: Uvicorn
- **Data & ML**:
  - NumPy & Pandas (Data pipelines & metrics)
  - Scikit-Learn (Predictive student attendance & dropout models)
  - PyTorch / Transformers (Rubric parsing & resume matching)
  - Python-constraint / OR-Tools (Timetable conflict optimization)
- **Validation**: Pydantic v2
- **Documentation**: Swagger UI / ReDoc auto-generated

## Planned Service Endpoints
1. `POST /api/ai/predict-attendance-risk` — Calculates early warning risk scores based on historic engagement.
2. `POST /api/ai/timetable-solver` — Constraint satisfaction optimization for faculty and lecture rooms.
3. `POST /api/ai/resume-job-match` — Embeddings similarity ranking for student resumes vs placement JDs.
4. `POST /api/ai/rubric-grader` — Code syntax analysis and semantic grading support for instructors.

## Planned Folder Structure
```text
ai-service/
├── app/
│   ├── api/             # FastAPI route routers
│   ├── core/            # Configs, logger, model weights loader
│   ├── models/          # Trained Scikit-Learn / PyTorch model weights
│   ├── schemas/         # Pydantic request/response schemas
│   ├── services/        # AI inference & solver logic
│   └── main.py          # FastAPI application entrypoint
├── requirements.txt     # Python package dependencies
├── .env.example         # Environment configuration
└── README.md            # AI service documentation
```
