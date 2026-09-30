from flask import Blueprint, request, jsonify
from services import judge0_service
from datetime import datetime, timezone

compiler_bp = Blueprint("compiler", __name__)

SUPPORTED_LANGUAGES = [
    {"id": 71, "name": "Python", "version": "3.8.1", "extension": ".py"},
    {"id": 50, "name": "C", "version": "GCC 9.2.0", "extension": ".c"},
    {"id": 54, "name": "C++", "version": "GCC 9.2.0", "extension": ".cpp"},
    {"id": 62, "name": "Java", "version": "OpenJDK 13.0.1", "extension": ".java"},
]

@compiler_bp.route("/health", methods=["GET"])
def health():
    judge0_info = judge0_service.get_status()
    return jsonify({
        "status": "ok",
        "backend": "Online",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "judge0": judge0_info
    })

@compiler_bp.route("/judge0/status", methods=["GET"])
def judge0_status():
    status = judge0_service.get_status()
    return jsonify(status)

@compiler_bp.route("/languages", methods=["GET"])
def languages():
    return jsonify({"languages": SUPPORTED_LANGUAGES})

@compiler_bp.route("/run", methods=["POST"])
def run_code():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"success": False, "error": "Invalid JSON body provided."}), 400

    language_id = data.get("language_id")
    source_code = data.get("source_code")
    stdin = data.get("stdin", "")

    if not language_id or source_code is None or source_code.strip() == "":
        return jsonify({
            "success": False,
            "error": "Both 'language_id' and 'source_code' are required."
        }), 400

    try:
        result = judge0_service.execute_code(
            language_id=int(language_id),
            source_code=source_code,
            stdin=stdin or ""
        )
        return jsonify({
            "success": True,
            "action": "run",
            "result": result
        })
    except ConnectionError as ce:
        return jsonify({
            "success": False,
            "error": str(ce)
        }), 503
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Execution error: {str(e)}"
        }), 502
