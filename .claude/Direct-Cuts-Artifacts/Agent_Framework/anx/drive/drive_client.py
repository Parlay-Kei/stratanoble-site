
import os
import io
import json
from pathlib import Path
from typing import Optional, List, Dict, Union

# Google Drive API imports
try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload, MediaIoBaseUpload
    GOOGLE_API_AVAILABLE = True
except ImportError:
    GOOGLE_API_AVAILABLE = False

class DriveClient:
    """
    Low-level wrapper for Google Drive API operations.
    Handles auth, path resolution, and basic CRUD.
    """
    
    SCOPES = ['https://www.googleapis.com/auth/drive.file']
    
    def __init__(self, root_id: str, credentials_path: str, token_path: str):
        self.root_id = root_id
        self.credentials_path = credentials_path
        self.token_path = token_path
        self.service = None
        self.folder_cache: Dict[str, str] = {}
        
        if not GOOGLE_API_AVAILABLE:
            raise ImportError("Google API libraries not installed. Run: pip install google-auth-oauthlib google-api-python-client")
            
        self._authenticate()

    def _authenticate(self):
        creds = None
        if os.path.exists(self.token_path):
            creds = Credentials.from_authorized_user_file(self.token_path, self.SCOPES)
            
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                except Exception as e:
                    print(f"Token refresh failed: {e}")
                    creds = None

            if not creds:
                if not os.path.exists(self.credentials_path):
                    raise FileNotFoundError(f"Credentials not found at {self.credentials_path}")
                
                print("Initiating new authentication flow...")
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_path, self.SCOPES)
                creds = flow.run_local_server(port=0)
                
            with open(self.token_path, 'w') as token:
                token.write(creds.to_json())
                
        self.service = build('drive', 'v3', credentials=creds)

    def resolve_path(self, path: str) -> Optional[str]:
        """Resolves a slash-separated path to a File/Folder ID."""
        path = path.strip('/')
        if not path or path == '.':
            return self.root_id
            
        parts = path.split('/')
        current_id = self.root_id
        
        for part in parts:
            found = self._find_child(current_id, part)
            if found:
               current_id = found['id']
            else:
                return None
        return current_id

    def _find_child(self, parent_id: str, name: str) -> Optional[dict]:
        query = f"name='{name}' and '{parent_id}' in parents and trashed=false"
        results = self.service.files().list(q=query, fields="files(id, name, mimeType)").execute()
        files = results.get('files', [])
        return files[0] if files else None

    def list_files(self, folder_id: str) -> List[Dict]:
        query = f"'{folder_id}' in parents and trashed=false"
        results = self.service.files().list(
            q=query, 
            fields="files(id, name, mimeType, modifiedTime, webViewLink)",
            orderBy="folder,name"
        ).execute()
        return results.get('files', [])

    def create_folder(self, parent_id: str, name: str) -> str:
        metadata = {
            'name': name,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': [parent_id]
        }
        file = self.service.files().create(body=metadata, fields='id').execute()
        return file.get('id')

    def upload_file(self, parent_id: str, name: str, content: Union[str, bytes], mime_type: str = 'text/plain') -> str:
        # Check if exists to update
        existing = self._find_child(parent_id, name)
        
        if isinstance(content, str):
            content = content.encode('utf-8')
            
        # Use in-memory upload to avoid file locking issues
        fh = io.BytesIO(content)
        media_body = MediaIoBaseUpload(fh, mimetype=mime_type, resumable=True)
            
        if existing:
            self.service.files().update(
                fileId=existing['id'],
                media_body=media_body
            ).execute()
            return existing['id']
        else:
            metadata = {'name': name, 'parents': [parent_id]}
            file = self.service.files().create(
                body=metadata,
                media_body=media_body,
                fields='id'
            ).execute()
            return file.get('id')

    def read_file(self, file_id: str) -> str:
        """Reads text content of a file."""
        request = self.service.files().get_media(fileId=file_id)
        fh = io.BytesIO()
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while done is False:
            status, done = downloader.next_chunk()
        
        return fh.getvalue().decode('utf-8')
