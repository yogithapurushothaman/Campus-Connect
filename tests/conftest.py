import pytest
import os

# Set test environment
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'

from campus_connect.app import create_app
from campus_connect.database.session import db_session, Base, engine

@pytest.fixture(scope='session')
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
    })
    yield app

@pytest.fixture(scope='function')
def client(app):
    with app.test_client() as client:
        yield client
