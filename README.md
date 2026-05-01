# CIRA – Contract Intelligence & Risk Analyzer

CIRA is a full-stack AI-based system designed to analyze legal contracts and identify potential risks. It processes uploaded documents, extracts text using OCR when required, and applies a machine learning model to classify the overall risk level.

---

## Overview

The system converts unstructured legal documents into structured insights by combining document processing, text extraction, and machine learning. It supports multiple input formats including PDF, images, and plain text files.

---

## Features

* Upload contracts in PDF, image, or text format
* Automatic text extraction (OCR for scanned documents)
* Machine learning-based risk classification
* Risk levels: Low, Medium, High
* REST API built with FastAPI
* Interactive frontend built with React and Tailwind CSS
* Persistent storage using SQLite

---

## System Architecture

```
Client (React Frontend)
        ↓
FastAPI Backend (API Layer)
        ↓
Processing Pipeline
    - File Handling
    - Text Extraction (OCR / Native)
    - Risk Prediction (ML Model)
        ↓
Database (SQLite)
```

---

## Tech Stack

### Backend

* FastAPI
* Python
* SQLAlchemy
* Scikit-learn (TF-IDF, Random Forest)
* Tesseract OCR
* PyMuPDF / pdfplumber

### Frontend

* React
* Tailwind CSS
* Axios

### Database

* SQLite

---

## Installation

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## API Endpoints

### Upload Contract

POST /upload
Uploads a document, processes it, and returns a risk classification.

---

### Analyze Text

POST /analyze
Accepts raw text input and returns a predicted risk level.

---

### Get All Contracts

GET /contracts
Returns a list of all processed contracts.

---

### Get Contract by ID

GET /contracts/{id}
Returns detailed information for a specific contract.

---

## How It Works

1. The user uploads a contract file through the frontend
2. The backend detects file type and extracts text
3. OCR is applied if the document is scanned
4. Extracted text is processed using a trained ML model
5. The system returns a risk classification
6. Results are stored and displayed in the dashboard

---

## Limitations

* Model accuracy depends on training dataset quality
* OCR accuracy varies with document quality
* Current system performs document-level classification

---

## Future Improvements

* Clause-level risk detection
* Highlighting risky sections in the UI
* Recommendation engine for safer alternatives
* Advanced NLP models for better contextual understanding
* Support for multiple legal jurisdictions

---

## Author

Arijeet Kumar Das

---

## License

This project is licensed under the MIT License.