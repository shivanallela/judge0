import base64
import time
import requests
from config import Config

class Judge0Service:
    def __init__(self):
        self._cached_url = Config.JUDGE0_URL
        self._last_resolved_at = 0
        self._cache_ttl = 60 # seconds

    def _test_url(self, url: str) -> bool:
        try:
            resp = requests.get(f"{url}/about", timeout=2)
            return resp.status_code == 200
        except Exception:
            return False

    def resolve_url(self) -> str:
        now = time.time()
        if self._cached_url and (now - self._last_resolved_at < self._cache_ttl):
            return self._cached_url

        candidate_urls = [
            Config.JUDGE0_URL,
            "http://localhost:2358",
            "http://127.0.0.1:2358"
        ]

        for url in candidate_urls:
            if url and self._test_url(url):
                self._cached_url = url
                self._last_resolved_at = now
                return url

        if Config.AUTO_DETECT_WSL:
            wsl_ip = Config.get_wsl_ip()
            if wsl_ip:
                wsl_url = f"http://{wsl_ip}:2358"
                if self._test_url(wsl_url):
                    self._cached_url = wsl_url
                    self._last_resolved_at = now
                    return wsl_url

        return Config.JUDGE0_URL or "http://localhost:2358"

    def get_status(self) -> dict:
        url = self.resolve_url()
        try:
            resp = requests.get(f"{url}/about", timeout=3)
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "connected": True,
                    "url": url,
                    "version": data.get("version", "unknown")
                }
        except Exception as e:
            return {
                "connected": False,
                "url": url,
                "error": str(e)
            }
        return {
            "connected": False,
            "url": url,
            "error": "Failed to reach Judge0"
        }

    def execute_code(self, language_id: int, source_code: str, stdin: str = "") -> dict:
        url = self.resolve_url()
        endpoint = f"{url}/submissions?base64_encoded=true&wait=true"

        def to_b64(text: str) -> str:
            if not text:
                return ""
            return base64.b64encode(text.encode("utf-8")).decode("utf-8")

        def from_b64(b64_str: str) -> str:
            if not b64_str:
                return ""
            try:
                return base64.b64decode(b64_str.encode("utf-8")).decode("utf-8", errors="replace")
            except Exception:
                return b64_str

        payload = {
            "language_id": int(language_id),
            "source_code": to_b64(source_code),
            "stdin": to_b64(stdin)
        }

        try:
            resp = requests.post(
                endpoint,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
        except requests.exceptions.RequestException as e:
            self._last_resolved_at = 0
            raise ConnectionError("Judge0 execution service is unavailable.") from e

        if resp.status_code not in (200, 201):
            raise RuntimeError(f"Judge0 responded with status {resp.status_code}: {resp.text}")

        res = resp.json()

        status_obj = res.get("status", {})
        status_id = status_obj.get("id")
        status_desc = status_obj.get("description", "Unknown")

        raw_stdout = from_b64(res.get("stdout"))
        raw_stderr = from_b64(res.get("stderr"))
        raw_compile_output = from_b64(res.get("compile_output"))
        raw_message = from_b64(res.get("message"))

        time_val = res.get("time")
        time_str = f"{time_val}s" if time_val is not None else None

        memory_val = res.get("memory")

        return {
            "token": res.get("token"),
            "status": status_desc,
            "status_id": status_id,
            "stdout": raw_stdout,
            "stderr": raw_stderr,
            "compile_output": raw_compile_output,
            "message": raw_message,
            "time": time_str,
            "memory": memory_val,
            "exit_code": res.get("exit_code"),
            "exit_signal": res.get("exit_signal")
        }

judge0_service = Judge0Service()
