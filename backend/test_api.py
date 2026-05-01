"""
CIRA Backend - Integration Test Script
---------------------------------------
Tests all API endpoints to verify the system is working correctly.
"""
import requests
import os

BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the root health check endpoint."""
    print("=" * 50)
    print("TEST 1: Health Check (GET /)")
    print("=" * 50)
    r = requests.get(f"{BASE_URL}/")
    print(f"  Status: {r.status_code}")
    print(f"  Response: {r.json()}")
    assert r.status_code == 200
    print("  PASSED\n")

def test_analyze_text():
    """Test the text analysis endpoint."""
    print("=" * 50)
    print("TEST 2: Analyze Text (POST /analyze)")
    print("=" * 50)

    # Test high-risk clause
    payload = {
        "text": "The contractor shall be liable for all damages, penalties, and losses without limitation. The company retains the right to pursue litigation in any jurisdiction."
    }
    r = requests.post(f"{BASE_URL}/analyze", json=payload)
    print(f"  Status: {r.status_code}")
    print(f"  Response: {r.json()}")
    assert r.status_code == 200
    print("  PASSED\n")

def test_upload_txt():
    """Test uploading a .txt file."""
    print("=" * 50)
    print("TEST 3: Upload .txt File (POST /upload)")
    print("=" * 50)

    # Create test file
    test_text = (
        "This agreement contains a non-compete clause. "
        "The employee shall not engage in competing business within 50 miles "
        "for a period of 5 years. Violation will result in liquidated damages "
        "of 500000 dollars. The employer reserves the right to terminate "
        "without cause and without notice."
    )
    test_path = "test_contract.txt"
    with open(test_path, "w") as f:
        f.write(test_text)

    # Upload
    with open(test_path, "rb") as f:
        r = requests.post(
            f"{BASE_URL}/upload",
            files={"file": ("test_contract.txt", f, "text/plain")}
        )

    print(f"  Status: {r.status_code}")
    print(f"  Response: {r.json()}")
    assert r.status_code == 200

    data = r.json()
    contract_id = data["contract_id"]
    print(f"  Contract ID: {contract_id}")
    print(f"  Risk Score: {data['risk_score']}")
    print("  PASSED\n")

    # Cleanup
    os.remove(test_path)
    return contract_id

def test_list_contracts():
    """Test listing all contracts."""
    print("=" * 50)
    print("TEST 4: List Contracts (GET /contracts)")
    print("=" * 50)
    r = requests.get(f"{BASE_URL}/contracts")
    print(f"  Status: {r.status_code}")
    contracts = r.json()
    print(f"  Total contracts: {len(contracts)}")
    for c in contracts:
        print(f"    ID={c['id']}, File={c['file_name']}, Risk={c['risk_score']}")
    assert r.status_code == 200
    print("  PASSED\n")

def test_get_contract(contract_id):
    """Test getting a specific contract by ID."""
    print("=" * 50)
    print(f"TEST 5: Get Contract (GET /contracts/{contract_id})")
    print("=" * 50)
    r = requests.get(f"{BASE_URL}/contracts/{contract_id}")
    print(f"  Status: {r.status_code}")
    data = r.json()
    print(f"  File: {data['file_name']}")
    print(f"  Risk: {data['risk_score']}")
    print(f"  Text length: {len(data.get('extracted_text', '') or '')} chars")
    assert r.status_code == 200
    print("  PASSED\n")

def test_get_contract_not_found():
    """Test 404 for non-existent contract."""
    print("=" * 50)
    print("TEST 6: Get Non-Existent Contract (GET /contracts/9999)")
    print("=" * 50)
    r = requests.get(f"{BASE_URL}/contracts/9999")
    print(f"  Status: {r.status_code}")
    print(f"  Response: {r.json()}")
    assert r.status_code == 404
    print("  PASSED\n")

def test_upload_unsupported():
    """Test uploading an unsupported file type."""
    print("=" * 50)
    print("TEST 7: Upload Unsupported File Type")
    print("=" * 50)
    # Create a fake .exe file
    test_path = "test_file.exe"
    with open(test_path, "wb") as f:
        f.write(b"fake binary content")

    with open(test_path, "rb") as f:
        r = requests.post(
            f"{BASE_URL}/upload",
            files={"file": ("test_file.exe", f, "application/octet-stream")}
        )

    print(f"  Status: {r.status_code}")
    print(f"  Response: {r.json()}")
    assert r.status_code == 400
    print("  PASSED\n")
    os.remove(test_path)


if __name__ == "__main__":
    print("\nCIRA Backend - Integration Tests")
    print("================================\n")

    test_health_check()
    test_analyze_text()
    contract_id = test_upload_txt()
    test_list_contracts()
    test_get_contract(contract_id)
    test_get_contract_not_found()
    test_upload_unsupported()

    print("=" * 50)
    print("ALL TESTS PASSED!")
    print("=" * 50)
