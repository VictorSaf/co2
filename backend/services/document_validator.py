"""
Document validation service
"""
import os
from werkzeug.utils import secure_filename
from datetime import datetime
import fitz  # PyMuPDF
from config import Config


class DocumentValidator:
    """Service for validating KYC documents"""
    
    ALLOWED_EXTENSIONS = Config.ALLOWED_EXTENSIONS
    MAX_FILE_SIZE = Config.MAX_CONTENT_LENGTH
    
    @staticmethod
    def allowed_file(filename):
        """Check if file extension is allowed"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in DocumentValidator.ALLOWED_EXTENSIONS
    
    @staticmethod
    def validate_file(file):
        """
        Validate uploaded file
        Returns: (is_valid, error_message)
        """
        if not file or not file.filename:
            return False, "No file provided"
        
        # Check file extension or content-type
        content_type = file.content_type or ''
        has_valid_extension = DocumentValidator.allowed_file(file.filename)
        
        # If extension is not valid, try to validate based on content-type
        if not has_valid_extension:
            # Allow files based on content-type if extension is missing or invalid
            content_type_lower = content_type.lower()
            if 'pdf' in content_type_lower or 'application/pdf' in content_type_lower:
                # PDF file - allow it
                pass  # Will be validated later by content-type check
            elif 'image/png' in content_type_lower or 'image/jpeg' in content_type_lower or 'image/jpg' in content_type_lower:
                # Image file - allow it
                pass  # Will be validated later by content-type check
            elif '.' not in file.filename:
                # No extension in filename - try content-type
                if not content_type:
                    return False, f"File type not allowed. Allowed types: {', '.join(sorted(DocumentValidator.ALLOWED_EXTENSIONS))}"
                # If we have content-type, let it pass to be validated later
            else:
                # Has extension but not in allowed list
                return False, f"File type not allowed. Allowed types: {', '.join(sorted(DocumentValidator.ALLOWED_EXTENSIONS))}"
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)  # Reset file pointer
        
        if file_size > DocumentValidator.MAX_FILE_SIZE:
            max_size_mb = DocumentValidator.MAX_FILE_SIZE / (1024 * 1024)
            return False, f"File too large. Maximum size: {max_size_mb}MB"
        
        if file_size == 0:
            return False, "File is empty"
        
        return True, None
    
    @staticmethod
    def validate_document_type(file, document_type):
        """
        Validate document based on its type
        
        All document types (including company_registration) accept all allowed file types:
        PDF, PNG, JPG, JPEG. There are no document-type-specific file type restrictions.
        
        Returns: (is_valid, error_message)
        """
        is_valid, error = DocumentValidator.validate_file(file)
        if not is_valid:
            return False, error
        
        # Additional validation based on document type
        filename = secure_filename(file.filename)
        extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        
        # Validate file extension matches content type (if content type is provided)
        # Note: Some browsers/clients may not send content-type or may send generic types,
        # so we're lenient and only validate when content-type is clearly mismatched
        content_type = file.content_type or ''
        if content_type:  # Only validate if content-type is provided
            content_type_lower = content_type.lower()
            # For PDF files, accept application/pdf or any content-type containing 'pdf'
            if extension == 'pdf' and 'pdf' not in content_type_lower and 'application' not in content_type_lower:
                # Only fail if content-type is clearly wrong (e.g., image/* for PDF)
                if content_type_lower.startswith('image/') or content_type_lower.startswith('text/'):
                    return False, "File extension doesn't match content type"
            # For image files, accept image/* types
            if extension in ['png', 'jpg', 'jpeg'] and 'image' not in content_type_lower:
                # Only fail if content-type is clearly wrong (e.g., application/pdf for image)
                if 'pdf' in content_type_lower or 'application' in content_type_lower:
                    return False, "File extension doesn't match content type"
        
        return True, None
    
    @staticmethod
    def extract_text_from_pdf(file_path):
        """
        Extract text from PDF file
        Returns: extracted text or None if error
        """
        try:
            doc = fitz.open(file_path)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return None
    
    @staticmethod
    def check_document_expiry(document_type, file_path):
        """
        Check if document has expired (for documents with expiry dates)
        Currently only checks company registration certificate age
        Returns: (is_valid, days_old, error_message)
        """
        if document_type != 'company_registration':
            return True, 0, None
        
        try:
            # Get file modification time as proxy for document date
            # In production, this should extract date from PDF metadata or OCR
            file_mtime = os.path.getmtime(file_path)
            file_date = datetime.fromtimestamp(file_mtime)
            days_old = (datetime.now() - file_date).days
            
            max_age_days = Config.KYC_DOCUMENT_MAX_AGE_DAYS
            
            if days_old > max_age_days:
                return False, days_old, f"Document is {days_old} days old. Maximum age is {max_age_days} days."
            
            return True, days_old, None
        except Exception as e:
            return False, 0, f"Error checking document expiry: {str(e)}"
    
    @staticmethod
    def get_safe_filename(filename):
        """Get secure filename"""
        return secure_filename(filename)

