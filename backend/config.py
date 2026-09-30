import os
import subprocess
from dotenv import load_dotenv

load_dotenv()

class Config:
    PORT = int(os.getenv("PORT", 5000))
    JUDGE0_URL = os.getenv("JUDGE0_URL", "").rstrip('/')
    AUTO_DETECT_WSL = os.getenv("AUTO_DETECT_WSL", "true" if not os.getenv("JUDGE0_URL") else "false").lower() == "true"

    @classmethod
    def get_wsl_ip(cls):
        if not cls.AUTO_DETECT_WSL:
            return None
        try:
            output = subprocess.check_output(["wsl", "hostname", "-I"], text=True, timeout=5).strip()
            first_ip = output.split()[0] if output else None
            return first_ip
        except Exception:
            return None
