import os
import subprocess
from dotenv import load_dotenv

load_dotenv()

class Config:
    PORT = int(os.getenv("PORT", 5000))
    JUDGE0_URL = os.getenv("JUDGE0_URL", "http://localhost:2358").rstrip('/')
    AUTO_DETECT_WSL = os.getenv("AUTO_DETECT_WSL", "true").lower() == "true"

    @classmethod
    def get_wsl_ip(cls):
        try:
            output = subprocess.check_output(["wsl", "hostname", "-I"], text=True, timeout=3).strip()
            first_ip = output.split()[0] if output else None
            return first_ip
        except Exception:
            return None
