# Implementation: PDF Document Update Tools

## Overview

This implementation provides tools and scripts to help update all 19 PDF documentation files with company-specific trading parameters, fees, order types, jurisdiction details, and contact information for Italy Nihao Group Limited (HK)/Nihao Carbon Certificates.

## Files Created

### 1. Python Scripts

#### `backend/scripts/update_pdf_documents.py`
Main script for analyzing and updating PDF documents.

**Features:**
- Analyze PDFs to identify what needs updating
- Extract text from PDFs
- Attempt text replacements (with limitations)
- Create backups of original PDFs
- Dry-run mode for testing

**Usage:**
```bash
# Analyze only (recommended first step)
python backend/scripts/update_pdf_documents.py --analyze-only

# Dry run (test without changes)
python backend/scripts/update_pdf_documents.py --dry-run

# Update with backup
python backend/scripts/update_pdf_documents.py --backup
```

#### `backend/scripts/generate_update_report.py`
Generates a detailed markdown report showing exactly what needs to be updated in each PDF.

**Features:**
- Extracts text from all PDFs
- Lists all required updates per document
- Shows current values that should be used
- Creates a comprehensive markdown report

**Usage:**
```bash
python backend/scripts/generate_update_report.py
```

This creates `docs/documentation/PDF_UPDATE_REPORT.md` with detailed update instructions.

### 2. Configuration File

#### `backend/scripts/pdf_update_config.json`
JSON configuration file containing all company-specific data:
- Company information (name, address, phone, jurisdiction)
- Trading parameters (order types, execution venues)
- Fees (CER, EUA, registry transfer, account maintenance)
- Settlement terms (T+2, T+4)
- Complaint handling details
- Financial Ombudsman information
- Client money segregation details

### 3. Documentation

#### `backend/scripts/README_PDF_UPDATE.md`
Comprehensive guide covering:
- Installation instructions
- Usage examples
- Important limitations
- Troubleshooting
- Alternative approaches
- Verification checklist

## Dependencies Added

Added to `backend/requirements.txt`:
- `PyMuPDF==1.23.8` - For PDF text extraction and manipulation
- `reportlab==4.0.7` - For PDF generation (if needed)

## Important Limitations

### PDF Text Replacement Complexity

**Critical Note**: Direct text replacement in PDFs while preserving formatting is complex. PDFs store text in a layout format, and simple text replacement may not work perfectly for all documents.

The scripts provide:
1. **Analysis capabilities** - Shows what needs updating
2. **Text extraction** - Helps identify content
3. **Basic replacement attempts** - Where possible

### Recommended Workflow

1. **Step 1**: Run the analysis script:
   ```bash
   python backend/scripts/update_pdf_documents.py --analyze-only
   ```

2. **Step 2**: Generate detailed report:
   ```bash
   python backend/scripts/generate_update_report.py
   ```
   Review `docs/documentation/PDF_UPDATE_REPORT.md`

3. **Step 3**: For documents requiring perfect formatting:
   - Use professional PDF editing software (Adobe Acrobat, PDF-XChange Editor)
   - Or extract text, create updated versions, and rebuild PDFs
   - Use the generated report as a reference guide

4. **Step 4**: Verify all updates using the checklist in the plan document

## Company Information Reference

All company-specific data is centralized in:
- `backend/scripts/pdf_update_config.json` (JSON format)
- `backend/scripts/update_pdf_documents.py` (Python constants)

### Key Values

- **Provider Name**: "Italy Nihao Group Limited （HK)/Nihao Carbon Certificates"
- **Company Name**: "Italy Nihao Group Limited （HK）"
- **Address**: "RM 905 WORKINGBERG COMM BLDG, 41-47 MARBLE RD, HONG KONG"
- **Phone**: "TEL 00852-3062 3366"
- **Jurisdiction**: "Hong Kong"
- **Order Types**: "Market Order only"
- **Time in Force**: "FOK (Fill or Kill) only"
- **Execution Venues**: "OTC Markets only"
- **Fees**: CER 2%, EUA Spot 5%, Registry Transfer 2%, Account Maintenance 0%
- **Settlement**: T+4 (spot), T+2 (conversion/settlement)

## Document Update Mapping

Each of the 19 PDFs has specific sections that need updating. The mapping is defined in:
- `backend/scripts/update_pdf_documents.py` (DOCUMENT_UPDATES dictionary)
- `docs/features/0005_PLAN.md` (detailed plan)

## Next Steps

1. **Install Dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Run Analysis**:
   ```bash
   python scripts/update_pdf_documents.py --analyze-only
   ```

3. **Generate Report**:
   ```bash
   python scripts/generate_update_report.py
   ```

4. **Review Report**: Check `docs/documentation/PDF_UPDATE_REPORT.md`

5. **Update PDFs**: 
   - Use professional PDF editing software for best results
   - Or use the scripts as a guide for manual updates
   - Refer to the generated report for exact values

6. **Verify**: Use the checklist in `docs/features/0005_PLAN.md`

## Alternative Approaches

If automated updates don't work well:

1. **PDF Form Fields**: If PDFs contain form fields, use PDF form filling tools
2. **Extract-Edit-Rebuild**: Extract text, create templates, update, rebuild PDFs
3. **Manual Editing**: Use Adobe Acrobat or similar software for precise updates
4. **Template Approach**: Create new PDFs from templates with correct information

## Support

- Review `docs/features/0005_PLAN.md` for detailed requirements
- Check `backend/scripts/README_PDF_UPDATE.md` for usage instructions
- Review generated report for document-specific update details

