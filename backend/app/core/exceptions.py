class AppException(Exception):
    def __init__(self, message: str, error_code: str = "APP_ERROR", status_code: int = 400):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        super().__init__(message)
