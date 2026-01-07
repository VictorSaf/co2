#!/usr/bin/env python3
"""
PDF Document Updater Script

This script updates all PDF documents in docs/documentation/ with company-specific
trading parameters, fees, order types, jurisdiction details, and contact information
for Italy Nihao Group Limited (HK)/Nihao Carbon Certificates.

Usage:
    python update_pdf_documents.py [--dry-run] [--backup] [--docs-dir PATH] [--config PATH]
"""

import os
import sys
import json
import shutil
import logging
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional, Any
import argparse

try:
    import fitz  # PyMuPDF
except ImportError:
    print("Error: PyMuPDF not installed. Run: pip install PyMuPDF")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Document-specific update mappings
# Each document may have different sections that need updating
DOCUMENT_UPDATES = {
    "Nihao_Carbon_01_Client_Agreement_Terms_of_Business.pdf": {
        "sections": [
            "provider_name", "order_types", "order_submission_method",
            "jurisdiction", "fees", "settlement", "execution_venues", "client_money"
        ]
    },
    "Nihao_Carbon_02_Best_Execution_Policy.pdf": {
        "sections": [
            "provider_name", "execution_venues", "order_types", "order_submission_method"
        ]
    },
    "Nihao_Carbon_03_Conflicts_of_Interest_Policy.pdf": {
        "sections": ["provider_name", "jurisdiction"]
    },
    "Nihao_Carbon_04_Complaints_Handling_Procedure.pdf": {
        "sections": [
            "provider_name", "complaint_methods", "company_contact",
            "financial_ombudsman", "emergency_contact"
        ]
    },
    "Nihao_Carbon_05_Risk_Disclosure_Statement.pdf": {
        "sections": [
            "provider_name", "jurisdiction", "execution_venues", "fees"
        ]
    },
    "Nihao_Carbon_06_Privacy_Policy_GDPR.pdf": {
        "sections": ["provider_name", "company_contact", "jurisdiction"]
    },
    "Nihao_Carbon_07_Business_Continuity_Plan.pdf": {
        "sections": ["provider_name", "emergency_contact", "company_contact"]
    },
    "Nihao_Carbon_08_Client_Onboarding_Form.pdf": {
        "sections": ["provider_name", "company_contact", "jurisdiction"]
    },
    "Nihao_Carbon_09_Order_Execution_Policy.pdf": {
        "sections": [
            "provider_name", "order_types", "order_submission_method",
            "execution_venues", "settlement"
        ]
    },
    "Nihao_Carbon_10_Market_Abuse_Policy.pdf": {
        "sections": ["provider_name", "jurisdiction"]
    },
    "Nihao_Carbon_11_Remuneration_Policy.pdf": {
        "sections": ["provider_name", "jurisdiction"]
    },
    "Nihao_Carbon_12_Product_Governance_Policy.pdf": {
        "sections": ["provider_name", "jurisdiction"]
    },
    "Nihao_Carbon_13_Suitability_Appropriateness_Policy.pdf": {
        "sections": ["provider_name", "jurisdiction"]
    },
    "Nihao_Carbon_14_Outsourcing_Policy.pdf": {
        "sections": ["provider_name", "company_contact"]
    },
    "Nihao_Carbon_15_Code_of_Ethics.pdf": {
        "sections": ["provider_name", "company_contact"]
    },
    "Nihao_Carbon_16_Record_Keeping_Policy.pdf": {
        "sections": ["provider_name", "jurisdiction"]
    },
    "Nihao_Carbon_17_Information_Security_Policy.pdf": {
        "sections": ["provider_name", "company_contact", "emergency_contact"]
    },
    "Nihao_Carbon_18_Transaction_Reporting_Policy.pdf": {
        "sections": ["provider_name", "jurisdiction", "execution_venues"]
    },
    "Nihao_Carbon_Certificates_KYC_AML_Compliance_Procedure.pdf": {
        "sections": [
            "provider_name", "company_contact", "jurisdiction", "client_money"
        ]
    }
}


def load_config(config_path: Path) -> Dict[str, Any]:
    """Load configuration from JSON file."""
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        logger.info(f"Configuration loaded from {config_path}")
        return config
    except FileNotFoundError:
        logger.error(f"Configuration file not found: {config_path}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in configuration file: {e}")
        sys.exit(1)


def validate_config(config: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """Validate configuration data."""
    errors = []
    
    # Required top-level keys
    required_keys = [
        "company_data", "trading_parameters", "fees", "settlement",
        "complaint_handling", "emergency_contacts", "client_money_segregation"
    ]
    for key in required_keys:
        if key not in config:
            errors.append(f"Missing required key: {key}")
    
    # Validate company_data
    if "company_data" in config:
        cd = config["company_data"]
        required_company_fields = ["provider_name", "company_name", "address", "phone", "jurisdiction"]
        for field in required_company_fields:
            if field not in cd:
                errors.append(f"Missing company_data field: {field}")
    
    # Validate fees
    if "fees" in config:
        fees = config["fees"]
        required_fee_fields = [
            "cer_transaction_fee", "eua_spot_transaction_fee",
            "registry_transfer_fee", "account_maintenance_fee"
        ]
        for field in required_fee_fields:
            if field not in fees:
                errors.append(f"Missing fee field: {field}")
    
    # Validate document mappings
    for doc_name, doc_config in DOCUMENT_UPDATES.items():
        if "sections" not in doc_config:
            errors.append(f"Document {doc_name} missing 'sections' key")
        elif not isinstance(doc_config["sections"], list):
            errors.append(f"Document {doc_name} 'sections' must be a list")
    
    return len(errors) == 0, errors


def get_replacement_text(section: str, config: Dict[str, Any]) -> Dict[str, str]:
    """Get replacement text mappings for a given section."""
    replacements: Dict[str, str] = {}
    
    company_data = config.get("company_data", {})
    trading_params = config.get("trading_parameters", {})
    fees = config.get("fees", {})
    settlement = config.get("settlement", {})
    complaint_handling = config.get("complaint_handling", {})
    emergency_contacts = config.get("emergency_contacts", {})
    client_money = config.get("client_money_segregation", {})
    
    if section == "provider_name":
        replacements = {
            "Provider Name": company_data.get("provider_name", ""),
            "Company Name": company_data.get("company_name", ""),
            "Broker": company_data.get("provider_name", ""),
            "Service Provider": company_data.get("provider_name", ""),
        }
    
    elif section == "company_contact":
        replacements = {
            "Company Address": company_data.get("address", ""),
            "Address": company_data.get("address", ""),
            "Phone": company_data.get("phone", ""),
            "Telephone": company_data.get("phone", ""),
            "Contact Address": company_data.get("address", ""),
            "Email": company_data.get("email", ""),
            "Contact Email": company_data.get("email", ""),
        }
        # Add complaint email if available
        complaint_email = complaint_handling.get("company_contact", {}).get("email", "")
        if complaint_email:
            replacements["Complaint Email"] = complaint_email
            replacements["Email for Complaints"] = complaint_email
    
    elif section == "jurisdiction":
        replacements = {
            "Jurisdiction": company_data.get("jurisdiction", ""),
            "Governing Law": company_data.get("jurisdiction", ""),
            "Legal Jurisdiction": company_data.get("jurisdiction", ""),
        }
    
    elif section == "order_types":
        replacements = {
            "Order Types": trading_params.get("order_types", ""),
            "Order Type": trading_params.get("order_types", ""),
            "Time in Force": trading_params.get("time_in_force", ""),
        }
    
    elif section == "order_submission_method":
        replacements = {
            "Order Submission Method": trading_params.get("order_submission_method", ""),
            "Submission Method": trading_params.get("order_submission_method", ""),
        }
    
    elif section == "execution_venues":
        replacements = {
            "Execution Venues": trading_params.get("execution_venues", ""),
            "Execution Venue": trading_params.get("execution_venues", ""),
            "Trading Venue": trading_params.get("execution_venues", ""),
        }
    
    elif section == "fees":
        replacements = {
            "CER Transaction Fee": fees.get("cer_transaction_fee", ""),
            "EUA Spot Transaction Fee": fees.get("eua_spot_transaction_fee", ""),
            "Registry Transfer Fee": fees.get("registry_transfer_fee", ""),
            "Account Maintenance Fee": fees.get("account_maintenance_fee", ""),
            "Transaction Fee (CER)": fees.get("cer_transaction_fee", ""),
            "Transaction Fee (EUA Spot)": fees.get("eua_spot_transaction_fee", ""),
        }
    
    elif section == "settlement":
        replacements = {
            "Standard Settlement": settlement.get("standard_settlement_spot", ""),
            "Settlement Period": settlement.get("settlement_period", ""),
            "Conversion Settlement": settlement.get("conversion_settlement", ""),
            "T+4": settlement.get("standard_settlement_spot", ""),
            "T+2": settlement.get("settlement_period", ""),
        }
    
    elif section == "complaint_methods":
        replacements = {
            "Complaint Methods": complaint_handling.get("methods", ""),
            "Methods of Complaint": complaint_handling.get("methods", ""),
        }
    
    elif section == "financial_ombudsman":
        omb = complaint_handling.get("financial_ombudsman", {})
        replacements = {
            "Financial Ombudsman": omb.get("name", ""),
            "Ombudsman": omb.get("name", ""),
            "Ombudsman Address": omb.get("address", ""),
            "Ombudsman Telephone": omb.get("telephone", ""),
            "Ombudsman Email": omb.get("email", ""),
            "Ombudsman Website": omb.get("website", ""),
        }
    
    elif section == "emergency_contact":
        replacements = {
            "Emergency Contact Address": emergency_contacts.get("address", ""),
            "Emergency Phone": emergency_contacts.get("phone", ""),
            "Emergency Contact": f"{emergency_contacts.get('address', '')}, {emergency_contacts.get('phone', '')}",
        }
    
    elif section == "client_money":
        replacements = {
            "Account Name": client_money.get("account_name", ""),
            "Account Number": client_money.get("account_number", ""),
            "Bank Name": client_money.get("beneficiary_bank_name", ""),
            "Bank Address": client_money.get("bank_address", ""),
            "SWIFT Code": client_money.get("swift_code", ""),
            "Beneficiary Bank": client_money.get("beneficiary_bank_name", ""),
        }
    
    # Filter out empty replacements
    return {k: v for k, v in replacements.items() if v}


def match_text_precise(text: str, pattern: str) -> bool:
    """
    More precise text matching with word boundaries and case-insensitive comparison.
    
    Args:
        text: The text to search in
        pattern: The pattern to search for
    
    Returns:
        True if pattern matches (as whole word or exact phrase)
    """
    text_lower = text.lower().strip()
    pattern_lower = pattern.lower().strip()
    
    # Exact match
    if text_lower == pattern_lower:
        return True
    
    # Word boundary match (pattern is a complete word in text)
    # Use regex word boundaries for better matching
    pattern_escaped = re.escape(pattern_lower)
    word_boundary_pattern = r'\b' + pattern_escaped + r'\b'
    if re.search(word_boundary_pattern, text_lower):
        return True
    
    # Phrase match (pattern appears as a phrase in text)
    # Remove extra whitespace and compare
    text_normalized = re.sub(r'\s+', ' ', text_lower)
    pattern_normalized = re.sub(r'\s+', ' ', pattern_lower)
    if pattern_normalized in text_normalized:
        return True
    
    return False


def backup_pdf(pdf_path: Path, backup_dir: Path) -> Path:
    """Create a backup of the original PDF."""
    backup_dir.mkdir(parents=True, exist_ok=True)
    backup_path = backup_dir / pdf_path.name
    shutil.copy2(pdf_path, backup_path)
    logger.info(f"Backup created: {backup_path}")
    return backup_path


def update_pdf_text(
    pdf_path: Path,
    sections: List[str],
    config: Dict[str, Any],
    dry_run: bool = False
) -> Tuple[int, List[str]]:
    """
    Update text in a PDF file based on specified sections.
    
    Note: PDF text replacement is complex. This function attempts to replace text
    using PyMuPDF's text editing capabilities, but results may vary depending on
    PDF structure and formatting.
    
    Returns:
        Tuple of (number of replacements made, list of changes made)
    """
    changes: List[str] = []
    total_replacements = 0
    
    try:
        # Open PDF
        doc = fitz.open(pdf_path)
        
        # Collect all replacements for this document
        all_replacements: Dict[str, str] = {}
        for section in sections:
            section_replacements = get_replacement_text(section, config)
            all_replacements.update(section_replacements)
        
        # Process each page
        for page_num in range(len(doc)):
            page = doc[page_num]
            page_changed = False
            
            # Get text blocks with positions
            text_dict = page.get_text("dict")
            
            # Try to find and replace text using text search and replace
            for old_text, new_text in all_replacements.items():
                if not old_text or not new_text:
                    continue
                
                # Search for text instances on this page
                text_instances = page.search_for(old_text, flags=fitz.TEXT_DEHYPHENATE)
                
                if text_instances:
                    for inst_num, inst_rect in enumerate(text_instances):
                        # Use precise matching to avoid false positives
                        page_text = page.get_text()
                        # Check if this instance matches our pattern precisely
                        if match_text_precise(page_text, old_text):
                            if not dry_run:
                                # Delete old text and insert new text
                                # Note: This is a simplified approach - may not preserve formatting
                                try:
                                    # Get text at this position to verify
                                    text_at_pos = page.get_textbox(inst_rect)
                                    if old_text.lower() in text_at_pos.lower():
                                        # Delete the old text
                                        page.add_redact_annot(inst_rect)
                                        page.apply_redactions()
                                        # Insert new text at the same position
                                        page.insert_text(
                                            inst_rect.tl,  # Top-left point
                                            new_text,
                                            fontsize=11,  # Default font size
                                        )
                                        page_changed = True
                                        total_replacements += 1
                                        changes.append(
                                            f"Page {page_num + 1}: Replaced '{old_text}' -> '{new_text}'"
                                        )
                                except Exception as e:
                                    logger.warning(
                                        f"Page {page_num + 1}: Could not replace '{old_text}': {e}"
                                    )
                                    changes.append(
                                        f"Page {page_num + 1}: Found '{old_text}' but replacement failed: {e}"
                                    )
                            else:
                                # Dry run - just log what would be replaced
                                total_replacements += 1
                                changes.append(
                                    f"Page {page_num + 1}: Would replace '{old_text}' -> '{new_text}'"
                                )
        
        if not dry_run and total_replacements > 0:
            # Save updated PDF
            output_path = pdf_path.parent / f"{pdf_path.stem}_updated.pdf"
            doc.save(output_path)
            changes.append(f"Saved updated PDF to: {output_path}")
        
        doc.close()
        
    except Exception as e:
        error_msg = f"Error processing {pdf_path.name}: {str(e)}"
        logger.error(error_msg, exc_info=True)
        changes.append(error_msg)
    
    return total_replacements, changes


def extract_pdf_text(pdf_path: Path) -> str:
    """Extract all text from a PDF for analysis."""
    try:
        doc = fitz.open(pdf_path)
        full_text = ""
        for page_num in range(len(doc)):
            full_text += doc[page_num].get_text()
        doc.close()
        return full_text
    except Exception as e:
        logger.error(f"Error extracting text from {pdf_path.name}: {e}")
        return f"Error extracting text: {str(e)}"


def analyze_pdf(pdf_path: Path, sections: List[str], config: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze a PDF to find what needs to be updated."""
    text = extract_pdf_text(pdf_path)
    text_lower = text.lower()
    
    analysis: Dict[str, Any] = {
        "filename": pdf_path.name,
        "sections_to_update": sections,
        "found_terms": {},
        "missing_terms": {},
    }
    
    # Check for each section's key terms
    for section in sections:
        replacements = get_replacement_text(section, config)
        found: List[str] = []
        missing: List[str] = []
        
        for key in replacements.keys():
            # Use precise matching
            if match_text_precise(text, key) or key.lower() in text_lower:
                found.append(key)
            else:
                missing.append(key)
        
        if found:
            analysis["found_terms"][section] = found
        if missing:
            analysis["missing_terms"][section] = missing
    
    return analysis


def main() -> int:
    """Main function."""
    parser = argparse.ArgumentParser(
        description="Update PDF documents with company-specific information"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Analyze PDFs without making changes"
    )
    parser.add_argument(
        "--backup",
        action="store_true",
        help="Create backups of original PDFs"
    )
    parser.add_argument(
        "--analyze-only",
        action="store_true",
        help="Only analyze PDFs and show what needs updating"
    )
    parser.add_argument(
        "--docs-dir",
        type=str,
        default=None,
        help="Path to documentation directory (default: auto-detect)"
    )
    parser.add_argument(
        "--config",
        type=str,
        default=None,
        help="Path to configuration JSON file (default: pdf_update_config.json in script directory)"
    )
    
    args = parser.parse_args()
    
    # Determine paths
    script_dir = Path(__file__).parent
    
    # Config path
    if args.config:
        config_path = Path(args.config)
    else:
        config_path = script_dir / "pdf_update_config.json"
    
    if not config_path.exists():
        logger.error(f"Configuration file not found: {config_path}")
        return 1
    
    # Load and validate configuration
    config = load_config(config_path)
    is_valid, validation_errors = validate_config(config)
    
    if not is_valid:
        logger.error("Configuration validation failed:")
        for error in validation_errors:
            logger.error(f"  - {error}")
        return 1
    
    # Documentation directory path
    if args.docs_dir:
        docs_dir = Path(args.docs_dir)
    else:
        project_root = script_dir.parent.parent
        docs_dir = project_root / "docs" / "documentation"
    
    if not docs_dir.exists():
        logger.error(f"Documentation directory not found: {docs_dir}")
        logger.info("Use --docs-dir to specify a different path")
        return 1
    
    logger.info(f"Using documentation directory: {docs_dir}")
    
    # Create backup directory if needed
    backup_dir: Optional[Path] = None
    if args.backup:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_dir = docs_dir / "backups" / timestamp
        backup_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Backup directory created: {backup_dir}")
    
    # Process each PDF
    results: List[Dict[str, Any]] = []
    errors = 0
    
    for filename, doc_config in DOCUMENT_UPDATES.items():
        pdf_path = docs_dir / filename
        
        if not pdf_path.exists():
            logger.warning(f"PDF not found: {filename}")
            errors += 1
            continue
        
        logger.info(f"\n{'='*60}")
        logger.info(f"Processing: {filename}")
        logger.info(f"{'='*60}")
        
        # Create backup if requested
        if args.backup and not args.dry_run and not args.analyze_only:
            try:
                backup_path = backup_pdf(pdf_path, backup_dir)
                logger.info(f"Backup created: {backup_path}")
            except Exception as e:
                logger.error(f"Failed to create backup: {e}")
                errors += 1
                continue
        
        sections = doc_config["sections"]
        
        if args.analyze_only:
            # Analyze PDF
            try:
                analysis = analyze_pdf(pdf_path, sections, config)
                logger.info(f"\nSections to update: {', '.join(sections)}")
                logger.info(f"\nFound terms:")
                for section, terms in analysis.get("found_terms", {}).items():
                    logger.info(f"  {section}: {', '.join(terms)}")
                if analysis.get("missing_terms"):
                    logger.info(f"\nMissing terms (may need manual review):")
                    for section, terms in analysis.get("missing_terms", {}).items():
                        logger.info(f"  {section}: {', '.join(terms)}")
                
                results.append(analysis)
            except Exception as e:
                logger.error(f"Error analyzing {filename}: {e}", exc_info=True)
                errors += 1
        else:
            # Update PDF
            try:
                replacements, change_list = update_pdf_text(
                    pdf_path, sections, config, dry_run=args.dry_run
                )
                
                logger.info(f"Replacements made: {replacements}")
                if change_list:
                    logger.info("\nChanges:")
                    for change in change_list[:10]:  # Show first 10 changes
                        logger.info(f"  - {change}")
                    if len(change_list) > 10:
                        logger.info(f"  ... and {len(change_list) - 10} more changes")
                
                results.append({
                    "filename": filename,
                    "replacements": replacements,
                    "changes": change_list
                })
            except Exception as e:
                logger.error(f"Error processing {filename}: {e}", exc_info=True)
                errors += 1
    
    # Summary
    logger.info(f"\n{'='*60}")
    logger.info("SUMMARY")
    logger.info(f"{'='*60}")
    
    if args.analyze_only:
        total_found = sum(len(a.get("found_terms", {})) for a in results)
        logger.info(f"Analyzed {len(results)} PDFs")
        logger.info(f"Found terms in {total_found} sections")
    else:
        total_replacements = sum(r.get("replacements", 0) for r in results)
        logger.info(f"Processed {len(results)} PDFs")
        logger.info(f"Total replacements: {total_replacements}")
        
        if args.dry_run:
            logger.info("\nDRY RUN MODE - No files were modified")
        else:
            logger.info("\nPDFs have been updated")
            if backup_dir:
                logger.info(f"Backups saved to: {backup_dir}")
    
    if errors > 0:
        logger.warning(f"\nCompleted with {errors} error(s)")
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
