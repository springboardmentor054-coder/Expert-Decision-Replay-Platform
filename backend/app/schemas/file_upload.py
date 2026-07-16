from pydantic import BaseModel


class FileUploadBase(BaseModel):
    file_name: str
    file_path: str
    decision_id: int


class FileUploadCreate(FileUploadBase):
    pass


class FileUploadResponse(FileUploadBase):
    id: int

    class Config:
        from_attributes = True