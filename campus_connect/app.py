from flask import Flask, render_template, redirect, url_for, request, g
from flask_cors import CORS
from campus_connect.config import Config
from campus_connect.database.session import db_session, Base, engine
from campus_connect.database.models import User, Event, Activity, Club, Complaint, Notification, ContentReport
from campus_connect.database.init_db import init_database
from campus_connect.core.auth import get_session_from_request
from campus_connect.core.middleware import login_required, require_faculty
from campus_connect.api.auth import auth_bp
from campus_connect.api.events import events_bp
from campus_connect.api.activities import activities_bp
from campus_connect.api.clubs import clubs_bp
from campus_connect.api.complaints import complaints_bp, admin_bp
from campus_connect.api.map import map_bp
from campus_connect.api.ai import ai_bp
from campus_connect.api.notices import notices_bp
from campus_connect.api.users import users_bp
from campus_connect.api.team_requests import team_requests_bp
from campus_connect.api.notifications import notifications_bp
from campus_connect.api.reports import reports_bp, admin_reports_bp

def create_app():
    app = Flask(
        __name__,
        template_folder=str(Config.TEMPLATES_FOLDER),
        static_folder=str(Config.STATIC_FOLDER),
    )
    app.config.from_object(Config)

    # Enable CORS for React Frontend
    CORS(
        app,
        supports_credentials=True,
        origins=[
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
        ],
        allow_headers=["Content-Type", "Authorization", "Cookie"],
        expose_headers=["Set-Cookie"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    )

    # Initialize Database Schema & Seed Data
    init_database()

    # Register API Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(activities_bp)
    app.register_blueprint(clubs_bp)
    app.register_blueprint(complaints_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(map_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(notices_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(team_requests_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(admin_reports_bp)


    @app.teardown_appcontext
    def shutdown_session(exception=None):
        db_session.remove()

    @app.before_request
    def load_user_context():
        session = get_session_from_request()
        if session:
            g.session = session
            g.current_user = db_session.query(User).filter_by(id=session.get("id")).first()
        else:
            g.session = None
            g.current_user = None

    # Web Page Views (Unified Fallback)
    @app.route("/")
    def index():
        if g.session and g.current_user:
            return redirect(url_for("dashboard"))
        return redirect(url_for("login_view"))

    @app.route("/dashboard")
    @login_required
    def dashboard():
        session = db_session()
        events = session.query(Event).order_by(Event.created_at.desc()).all()
        activities = session.query(Activity).order_by(Activity.created_at.desc()).all()
        clubs = session.query(Club).order_by(Club.name.asc()).all()
        complaints = session.query(Complaint).order_by(Complaint.created_at.desc()).all()

        return render_template(
            "dashboard.html",
            current_user=g.current_user,
            events=events,
            activities=activities,
            clubs=clubs,
            complaints=complaints,
        )

    @app.route("/login")
    def login_view():
        if g.session and g.current_user:
            return redirect(url_for("dashboard"))
        return render_template("login.html", current_user=None)

    @app.route("/signup")
    def signup_view():
        if g.session and g.current_user:
            return redirect(url_for("dashboard"))
        return render_template("signup.html", current_user=None)

    @app.route("/student-dashboard")
    @login_required
    def student_dashboard_view():
        return redirect(url_for("dashboard"))

    @app.route("/staff-dashboard")
    @app.route("/faculty-dashboard")
    @require_faculty
    def faculty_dashboard_view():
        return redirect(url_for("dashboard"))

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
