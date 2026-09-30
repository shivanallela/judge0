from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from routes import compiler_bp
from services import judge0_service

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for Next.js frontend (localhost:3000) and dev clients
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    app.register_blueprint(compiler_bp, url_prefix="/api")

    @app.route("/")
    def index():
        return jsonify({
            "name": "CodeSphere Backend (Flask)",
            "version": "2.0.0",
            "status": "online",
            "endpoints": [
                "/api/health",
                "/api/judge0/status",
                "/api/languages",
                "/api/run"
            ]
        })

    return app

app = create_app()

if __name__ == "__main__":
    print(f"====================================================")
    print(f">> CodeSphere Flask Backend starting on port {Config.PORT}")
    print(f"Configured Judge0 URL: {Config.JUDGE0_URL}")
    status = judge0_service.get_status()
    if status.get("connected"):
        print(f"[OK] Judge0 Connected: {status.get('url')} (v{status.get('version')})")
    else:
        print(f"[WARN] Judge0 Connection Warning: {status.get('error')}")
    print(f"====================================================")
    app.run(host="0.0.0.0", port=Config.PORT, debug=False)
