"""
API Routes
----------
Defines all HTTP endpoints for the CIRA backend.

Endpoints:
    POST /upload    — Upload a legal document for risk analysis
    POST /analyze   — Analyze raw text for risk (no file upload)
    POST /analyze/clauses — Clause-level risk analysis with explanations
    GET  /contracts — List all analyzed contracts
    GET  /contracts/{id} — Get a specific contract by ID
    GET  /contracts/{id}/clauses — Clause-level analysis for a stored contract
"""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api.deps import get_db
from app.models.contract import Contract
from app.services.file_service import save_file
from app.services.text_service import extract_text
from app.services.risk_service import predict_risk
from app.services.clause_analysis_service import analyze_contract_clauses

# Create the router — all routes are registered on this
router = APIRouter()


# ──────────────────────────────────────────────────────────
# Request/Response Schemas
# ──────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    """Request body for the /analyze endpoint."""
    text: str


class UploadResponse(BaseModel):
    """Response body for the /upload endpoint."""
    message: str
    contract_id: int
    file_name: str
    risk_score: str


class AnalyzeResponse(BaseModel):
    """Response body for the /analyze endpoint."""
    input_text: str
    predicted_risk: str


class ContractResponse(BaseModel):
    """Response body for contract retrieval endpoints."""
    id: int
    file_name: str
    file_path: str
    extracted_text: str | None
    risk_score: str
    created_at: str


# ── Clause Analysis Schemas ──

class ClauseResult(BaseModel):
    """Analysis result for a single clause."""
    id: int
    text: str
    risk: str
    confidence: float
    explanation: str
    risk_categories: list[str] = []


class ClauseAnalysisResponse(BaseModel):
    """Full clause-level analysis response."""
    overallRisk: str
    overallScore: float
    totalClauses: int
    riskDistribution: dict[str, int]
    clauses: list[ClauseResult]


# ──────────────────────────────────────────────────────────
# POST /upload — Upload & Analyze a Document
# ──────────────────────────────────────────────────────────

@router.post("/upload", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a legal document (PDF, image, or text file) for risk analysis.

    Processing Pipeline:
        1. Save file to disk with a UUID-based name
        2. Detect file type from extension
        3. Extract text using the appropriate strategy:
           - .txt → read directly
           - .pdf → PyMuPDF, with OCR fallback for scanned documents
           - .jpg/.png → Tesseract OCR
        4. Run the ML model on extracted text to predict risk level
        5. Store results in the database
        6. Return the contract ID and predicted risk score
    """
    # Step 1: Save the uploaded file to disk
    file_info = await save_file(file)

    file_path = file_info["file_path"]
    file_name = file_info["file_name"]
    file_ext = file_info["file_ext"]

    # Step 2-3: Extract text based on file type
    text = extract_text(file_path, file_ext)

    if not text:
        print(f"[WARN] No text could be extracted from '{file_name}'")

    # Step 4: Predict risk using the ML model
    if text and text.strip():
        try:
            risk = predict_risk(text)
        except Exception as e:
            print(f"[ML ERROR] Risk prediction failed: {e}")
            risk = "unknown"
    else:
        risk = "unknown"

    # Step 5: Store in database
    new_contract = Contract(
        file_name=file_name,
        file_path=file_path,
        extracted_text=text if text else None,
        risk_score=risk,
    )

    db.add(new_contract)
    db.commit()
    db.refresh(new_contract)

    # Step 6: Return response
    return UploadResponse(
        message="File uploaded and analyzed successfully",
        contract_id=new_contract.id,
        file_name=file_name,
        risk_score=risk,
    )


# ──────────────────────────────────────────────────────────
# POST /analyze — Analyze Raw Text (No File Upload)
# ──────────────────────────────────────────────────────────

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_clause(request: AnalyzeRequest):
    """
    Analyze a raw text clause/snippet for risk.
    Useful for quick checks without uploading a full document.

    Request body:
        { "text": "Your contract clause text here..." }
    """
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text field cannot be empty.")

    try:
        risk = predict_risk(request.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk prediction failed: {str(e)}")

    return AnalyzeResponse(
        input_text=request.text,
        predicted_risk=risk,
    )


# ──────────────────────────────────────────────────────────
# POST /analyze/clauses — Clause-Level Risk Analysis
# ──────────────────────────────────────────────────────────

@router.post("/analyze/clauses", response_model=ClauseAnalysisResponse)
def analyze_clauses(request: AnalyzeRequest):
    """
    Perform clause-level risk analysis on contract text.

    This endpoint:
        1. Splits the text into individual clauses
        2. Analyzes each clause for risk level
        3. Generates explanations for each clause
        4. Computes an overall contract risk score

    Request body:
        { "text": "Full contract text here..." }

    Returns:
        Structured JSON with overall risk, score, distribution,
        and per-clause analysis with explanations.
    """
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text field cannot be empty.")

    try:
        result = analyze_contract_clauses(request.text)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Clause analysis failed: {str(e)}"
        )

    return ClauseAnalysisResponse(**result)


# ──────────────────────────────────────────────────────────
# GET /contracts — List All Analyzed Contracts
# ──────────────────────────────────────────────────────────

@router.get("/contracts", response_model=list[ContractResponse])
def list_contracts(db: Session = Depends(get_db)):
    """
    Returns a list of all contracts that have been uploaded and analyzed.
    Ordered by most recent first.
    """
    contracts = db.query(Contract).order_by(Contract.created_at.desc()).all()

    return [
        ContractResponse(
            id=c.id,
            file_name=c.file_name,
            file_path=c.file_path,
            extracted_text=c.extracted_text,
            risk_score=c.risk_score,
            created_at=str(c.created_at),
        )
        for c in contracts
    ]


# ──────────────────────────────────────────────────────────
# GET /contracts/{contract_id} — Get a Specific Contract
# ──────────────────────────────────────────────────────────

@router.get("/contracts/{contract_id}", response_model=ContractResponse)
def get_contract(contract_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a single contract by its ID.
    Returns 404 if the contract does not exist.
    """
    contract = db.query(Contract).filter(Contract.id == contract_id).first()

    if not contract:
        raise HTTPException(status_code=404, detail=f"Contract with id {contract_id} not found.")

    return ContractResponse(
        id=contract.id,
        file_name=contract.file_name,
        file_path=contract.file_path,
        extracted_text=contract.extracted_text,
        risk_score=contract.risk_score,
        created_at=str(contract.created_at),
    )


# ──────────────────────────────────────────────────────────
# GET /contracts/{contract_id}/clauses — Clause Analysis for Stored Contract
# ──────────────────────────────────────────────────────────

@router.get("/contracts/{contract_id}/clauses", response_model=ClauseAnalysisResponse)
def get_contract_clause_analysis(contract_id: int, db: Session = Depends(get_db)):
    """
    Performs clause-level risk analysis on a previously uploaded contract.
    Retrieves the contract text from the database and runs the analysis pipeline.

    Returns 404 if the contract doesn't exist.
    Returns 400 if no text was extracted from the contract.
    """
    contract = db.query(Contract).filter(Contract.id == contract_id).first()

    if not contract:
        raise HTTPException(
            status_code=404,
            detail=f"Contract with id {contract_id} not found."
        )

    if not contract.extracted_text or not contract.extracted_text.strip():
        raise HTTPException(
            status_code=400,
            detail="No text available for this contract. Clause analysis requires extracted text."
        )

    try:
        result = analyze_contract_clauses(contract.extracted_text)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Clause analysis failed: {str(e)}"
        )

    return ClauseAnalysisResponse(**result)