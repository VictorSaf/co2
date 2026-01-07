#!/usr/bin/env python3
"""
Generate a detailed update report for PDF documents.

This script analyzes all PDFs and generates a markdown report showing
exactly what needs to be updated in each document.
"""

import sys
from pathlib import Path
import json
from datetime import datetime
from typing import Dict, Any, List

try:
    import fitz  # PyMuPDF
except ImportError:
    print("Error: PyMuPDF not installed. Run: pip install PyMuPDF")
    sys.exit(1)

# Load configuration
SCRIPT_DIR = Path(__file__).parent
CONFIG_FILE = SCRIPT_DIR / "pdf_update_config.json"

try:
    with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
        config = json.load(f)
except FileNotFoundError:
    print(f"Error: Configuration file not found: {CONFIG_FILE}")
    sys.exit(1)
except json.JSONDecodeError as e:
    print(f"Error: Invalid JSON in configuration file: {e}")
    sys.exit(1)

# Document update mappings from the plan
DOCUMENT_UPDATES = {
    "Nihao_Carbon_01_Client_Agreement_Terms_of_Business.pdf": {
        "updates": [
            "provider_name", "order_types", "order_submission_method",
            "jurisdiction", "fees", "settlement", "execution_venues", "client_money"
        ]
    },
    "Nihao_Carbon_02_Best_Execution_Policy.pdf": {
        "updates": [
            "provider_name", "execution_venues", "order_types", "order_submission_method"
        ]
    },
    "Nihao_Carbon_03_Conflicts_of_Interest_Policy.pdf": {
        "updates": ["provider_name", "jurisdiction"]
    },
    "Nihao_Carbon_04_Complaints_Handling_Procedure.pdf": {
        "updates": [
            "provider_name", "complaint_methods", "company_contact",
            "financial_ombudsman", "emergency_contact"
        ]
    },
    "Nihao_Carbon_05_Risk_Disclosure_Statement.pdf": {
        "updates": [
            "provider_name", "jurisdiction", "execution_venues", "fees"
        ]
    },
    "Nihao_Carbon_06_Privacy_Policy_GDPR.pdf": {
        "updates": ["provider_name", "company_contact", "jurisdiction"]
    },
    "Nihao_Carbon_07_Business_Continuity_Plan.pdf": {
        "updates": ["provider_name", "emergency_contact", "company_contact"]
    },
    "Nihao_Carbon_08_Client_Onboarding_Form.pdf": {
        "updates": ["provider_name", "company_contact", "jurisdiction"]
    },
    "Nihao_Carbon_09_Order_Execution_Policy.pdf": {
        "updates": [
            "provider_name", "order_types", "order_submission_method",
            "execution_venues", "settlement"
        ]
    },
    "Nihao_Carbon_10_Market_Abuse_Policy.pdf": {
        "updates": ["provider_name", "jurisdiction"]
    },
    "Nihao_Carbon_11_Remuneration_Policy.pdf": {
        "updates": ["provider_name", "jurisdiction"]
    },
    "Nihao_Carbon_12_Product_Governance_Policy.pdf": {
        "updates": ["provider_name", "jurisdiction"]
    },
    "Nihao_Carbon_13_Suitability_Appropriateness_Policy.pdf": {
        "updates": ["provider_name", "jurisdiction"]
    },
    "Nihao_Carbon_14_Outsourcing_Policy.pdf": {
        "updates": ["provider_name", "company_contact"]
    },
    "Nihao_Carbon_15_Code_of_Ethics.pdf": {
        "updates": ["provider_name", "company_contact"]
    },
    "Nihao_Carbon_16_Record_Keeping_Policy.pdf": {
        "updates": ["provider_name", "jurisdiction"]
    },
    "Nihao_Carbon_17_Information_Security_Policy.pdf": {
        "updates": ["provider_name", "company_contact", "emergency_contact"]
    },
    "Nihao_Carbon_18_Transaction_Reporting_Policy.pdf": {
        "updates": ["provider_name", "jurisdiction", "execution_venues"]
    },
    "Nihao_Carbon_Certificates_KYC_AML_Compliance_Procedure.pdf": {
        "updates": [
            "provider_name", "company_contact", "jurisdiction", "client_money"
        ]
    }
}


def get_update_values(update_type: str) -> Dict[str, str]:
    """Get the values that need to be updated for a given update type."""
    values: Dict[str, str] = {}
    
    company_data = config.get("company_data", {})
    trading_params = config.get("trading_parameters", {})
    fees = config.get("fees", {})
    settlement = config.get("settlement", {})
    complaint_handling = config.get("complaint_handling", {})
    emergency_contacts = config.get("emergency_contacts", {})
    client_money = config.get("client_money_segregation", {})
    
    if update_type == "provider_name":
        values = {
            "Provider Name": company_data.get("provider_name", ""),
            "Company Name": company_data.get("company_name", ""),
        }
    
    elif update_type == "company_contact":
        values = {
            "Address": company_data.get("address", ""),
            "Phone": company_data.get("phone", ""),
            "Email": company_data.get("email", ""),
        }
        # Add complaint email if available
        complaint_email = complaint_handling.get("company_contact", {}).get("email", "")
        if complaint_email:
            values["Complaint Email"] = complaint_email
    
    elif update_type == "jurisdiction":
        values = {
            "Jurisdiction": company_data.get("jurisdiction", ""),
        }
    
    elif update_type == "order_types":
        values = {
            "Order Types": trading_params.get("order_types", ""),
            "Time in Force": trading_params.get("time_in_force", ""),
        }
    
    elif update_type == "order_submission_method":
        values = {
            "Order Submission Method": trading_params.get("order_submission_method", ""),
        }
    
    elif update_type == "execution_venues":
        values = {
            "Execution Venues": trading_params.get("execution_venues", ""),
        }
    
    elif update_type == "fees":
        values = {
            "CER Transaction Fee": fees.get("cer_transaction_fee", ""),
            "EUA Spot Transaction Fee": fees.get("eua_spot_transaction_fee", ""),
            "Registry Transfer Fee": fees.get("registry_transfer_fee", ""),
            "Account Maintenance Fee": fees.get("account_maintenance_fee", ""),
        }
    
    elif update_type == "settlement":
        values = {
            "Standard Settlement (Spot)": settlement.get("standard_settlement_spot", ""),
            "Conversion Settlement": settlement.get("conversion_settlement", ""),
            "Settlement Period": settlement.get("settlement_period", ""),
        }
    
    elif update_type == "complaint_methods":
        values = {
            "Complaint Methods": complaint_handling.get("methods", ""),
        }
    
    elif update_type == "financial_ombudsman":
        omb = complaint_handling.get("financial_ombudsman", {})
        values = {
            "Name": omb.get("name", ""),
            "Address": omb.get("address", ""),
            "Telephone": omb.get("telephone", ""),
            "Email": omb.get("email", ""),
            "Website": omb.get("website", ""),
        }
    
    elif update_type == "emergency_contact":
        values = {
            "Address": emergency_contacts.get("address", ""),
            "Phone": emergency_contacts.get("phone", ""),
        }
    
    elif update_type == "client_money":
        values = {
            "Account Name": client_money.get("account_name", ""),
            "Account Number": client_money.get("account_number", ""),
            "Bank Name": client_money.get("beneficiary_bank_name", ""),
            "Bank Address": client_money.get("bank_address", ""),
            "SWIFT Code": client_money.get("swift_code", ""),
        }
    
    # Filter out empty values
    return {k: v for k, v in values.items() if v}


def extract_pdf_text(pdf_path: Path) -> str:
    """Extract all text from a PDF."""
    try:
        doc = fitz.open(pdf_path)
        full_text = ""
        for page_num in range(len(doc)):
            full_text += doc[page_num].get_text()
        doc.close()
        return full_text
    except Exception as e:
        return f"Error extracting text: {str(e)}"


def generate_report() -> int:
    """Generate a detailed update report."""
    project_root = SCRIPT_DIR.parent.parent
    docs_dir = project_root / "docs" / "documentation"
    
    if not docs_dir.exists():
        print(f"Error: Documentation directory not found: {docs_dir}")
        return 1
    
    # Use actual generation time instead of file modification time
    generation_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    report_lines = [
        "# PDF Document Update Report",
        "",
        f"Generated: {generation_time}",
        "",
        "This report details what needs to be updated in each PDF document.",
        "",
        "## Company Information",
        "",
        f"- **Provider Name**: {config['company_data']['provider_name']}",
        f"- **Company Name**: {config['company_data']['company_name']}",
        f"- **Address**: {config['company_data']['address']}",
        f"- **Phone**: {config['company_data']['phone']}",
        f"- **Email**: {config['company_data'].get('email', 'N/A')}",
        f"- **Jurisdiction**: {config['company_data']['jurisdiction']}",
        "",
        "---",
        "",
    ]
    
    # Process each document
    processed_count = 0
    errors = 0
    
    for filename, doc_config in DOCUMENT_UPDATES.items():
        pdf_path = docs_dir / filename
        
        if not pdf_path.exists():
            report_lines.extend([
                f"## {filename}",
                "",
                "⚠️ **File not found**",
                "",
                "---",
                "",
            ])
            errors += 1
            continue
        
        processed_count += 1
        report_lines.extend([
            f"## {filename}",
            "",
            f"**File**: `{filename}`",
            "",
            "### Sections to Update",
            "",
        ])
        
        # List update types
        for update_type in doc_config["updates"]:
            values = get_update_values(update_type)
            report_lines.append(f"- **{update_type.replace('_', ' ').title()}**")
            
            for key, value in values.items():
                report_lines.append(f"  - {key}: `{value}`")
            
            report_lines.append("")
        
        # Extract sample text (first 500 chars)
        try:
            text = extract_pdf_text(pdf_path)
            if len(text) > 500:
                sample_text = text[:500] + "..."
            else:
                sample_text = text
            
            report_lines.extend([
                "### Sample Content (First 500 characters)",
                "",
                "```",
                sample_text,
                "```",
                "",
            ])
        except Exception as e:
            report_lines.extend([
                f"### Error extracting text",
                "",
                f"Error: {str(e)}",
                "",
            ])
        
        report_lines.extend([
            "---",
            "",
        ])
    
    # Write report
    report_path = docs_dir / "PDF_UPDATE_REPORT.md"
    try:
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(report_lines))
        
        print(f"Report generated: {report_path}")
        print(f"Processed {processed_count} documents")
        if errors > 0:
            print(f"Errors: {errors} files not found")
        return 0
    except Exception as e:
        print(f"Error writing report: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(generate_report())
