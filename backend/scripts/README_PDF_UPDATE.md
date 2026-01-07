# PDF Document Update Script

This script helps update all PDF documentation files with company-specific trading parameters, fees, order types, jurisdiction details, and contact information for Italy Nihao Group Limited (HK)/Nihao Carbon Certificates.

## Overview

The script processes 19 PDF documents in `docs/documentation/` and updates them with the following information:

- **Company Information**: Provider name, address, phone, jurisdiction
- **Trading Parameters**: Order types (Market Order, FOK), execution venues (OTC Markets)
- **Fees**: CER (2%), EUA Spot (5%), Registry Transfer (2%), Account Maintenance (0%)
- **Settlement**: T+4 for spot transactions, T+2 for conversion/settlement
- **Complaint Handling**: Contact methods and Financial Ombudsman details
- **Client Money Segregation**: Bank account details

## Installation

1. Install required Python packages:

```bash
cd backend
pip install -r requirements.txt
```

Required packages:
- `PyMuPDF==1.23.8` - For PDF text extraction and manipulation
- `reportlab==4.0.7` - For PDF generation (if needed)

## Usage

### 1. Analyze PDFs (Recommended First Step)

Analyze all PDFs to see what needs updating without making changes:

```bash
python scripts/update_pdf_documents.py --analyze-only
```

This will:
- Extract text from each PDF
- Identify which sections need updating
- Show what terms were found and what might be missing
- Help you understand what manual review might be needed

### 2. Dry Run

Test the update process without modifying files:

```bash
python scripts/update_pdf_documents.py --dry-run
```

### 3. Update with Backup

Update PDFs and create backups of originals:

```bash
python scripts/update_pdf_documents.py --backup
```

### 4. Update Without Backup

Update PDFs directly (not recommended without backup):

```bash
python scripts/update_pdf_documents.py
```

### 5. Custom Paths

Specify custom paths for configuration or documentation directory:

```bash
# Custom documentation directory
python scripts/update_pdf_documents.py --docs-dir /path/to/docs

# Custom configuration file
python scripts/update_pdf_documents.py --config /path/to/config.json
```

## Important Notes

### PDF Text Replacement

The script now implements actual PDF text replacement using PyMuPDF's text editing capabilities:
- **Precise text matching** - Uses word boundaries and phrase matching to avoid false positives
- **Text replacement** - Actually replaces text in PDFs (not just detection)
- **Analysis mode** - Shows what needs updating before making changes
- **Dry-run mode** - Test replacements without modifying files

**Note**: PDF text replacement is complex and results may vary depending on PDF structure and formatting. The script uses redaction and text insertion, which may not preserve all formatting perfectly. For documents requiring perfect formatting, consider using professional PDF editing software.

### Improvements in Latest Version

- ✅ **Single source of truth** - All data loaded from JSON config file
- ✅ **Email support** - Email addresses can now be updated
- ✅ **Configuration validation** - Validates required fields and data formats
- ✅ **Better text matching** - Precise matching with word boundaries
- ✅ **Proper logging** - Uses Python logging instead of print statements
- ✅ **Flexible paths** - Command-line options for custom paths
- ✅ **Better error handling** - Distinguishes between fatal and recoverable errors

### Recommended Workflow

1. **Step 1**: Run `--analyze-only` to understand what's in each PDF
2. **Step 2**: Review the analysis output
3. **Step 3**: For documents that need significant updates:
   - Use professional PDF editing software (Adobe Acrobat, PDF-XChange Editor)
   - Or extract text, create updated versions, and rebuild PDFs
4. **Step 4**: Use the script's output as a reference guide for manual updates

### Manual Update Guide

For each PDF, refer to the plan document (`docs/features/0005_PLAN.md`) which specifies:

- Which sections need updating
- What specific information to use
- Where to find the information in the configuration

## Configuration

Company-specific data is stored in:
- `backend/scripts/pdf_update_config.json` - JSON configuration file (single source of truth)

The script loads all configuration from the JSON file, ensuring consistency and easy updates.

## Document-Specific Updates

Each document has specific sections that need updating. See `docs/features/0005_PLAN.md` for the complete list.

### Example: Client Agreement Document

The `Nihao_Carbon_01_Client_Agreement_Terms_of_Business.pdf` needs:
- Provider name updates
- Order types (Market Order, FOK only)
- Order submission method (Electronic Trading Platform only)
- Jurisdiction (Hong Kong)
- Fees section (CER 2%, EUA spot 5%, Registry transfer 2%, Account maintenance zero)
- Settlement terms (T+4 spot, T+2 conversion/settlement)
- Execution venues (OTC Markets only)
- Client money segregation details

## Verification Checklist

After updates, verify each document contains:

- [ ] Correct provider name: "Italy Nihao Group Limited （HK)/Nihao Carbon Certificates"
- [ ] Correct jurisdiction: "Hong Kong"
- [ ] Order types: Market Order, FOK only
- [ ] Order submission: Electronic Trading Platform only
- [ ] Execution venues: OTC Markets only
- [ ] Fees: CER 2%, EUA spot 5%, Registry transfer 2%, Account maintenance zero
- [ ] Settlement: T+4 spot, T+2 conversion/settlement
- [ ] Complaint methods: email, post, telephone
- [ ] Company contact details for complaints
- [ ] Financial Ombudsman escalation details
- [ ] Emergency contact information
- [ ] Client money segregation account details

## Troubleshooting

### Error: PyMuPDF not installed
```bash
pip install PyMuPDF==1.23.8
```

### Error: PDF is password protected
Some PDFs may be password protected. You'll need to remove the password first using PDF software.

### Error: Text not found for replacement
The script uses keyword matching. If terms aren't found:
1. Check the PDF text extraction output
2. Verify the exact wording in the PDF
3. Update the replacement mappings in the script if needed

### PDF formatting is lost after update
This is a known limitation. For documents requiring perfect formatting:
1. Use professional PDF editing software
2. Or extract text, update, and rebuild PDFs with proper formatting

## Alternative Approaches

If automated updates don't work well:

1. **PDF Form Fields**: If PDFs contain form fields, use PDF form filling tools
2. **Extract-Edit-Rebuild**: Extract text, create templates, update, rebuild PDFs
3. **Manual Editing**: Use Adobe Acrobat or similar software for precise updates
4. **Template Approach**: Create new PDFs from templates with correct information

## Support

For questions or issues:
1. Review `docs/features/0005_PLAN.md` for detailed requirements
2. Check the analysis output to understand PDF content
3. Consider manual updates for complex formatting requirements

