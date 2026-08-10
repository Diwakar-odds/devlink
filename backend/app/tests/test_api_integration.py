import pytest
from fastapi import status
from fastapi.testclient import TestClient

from app.core.security import create_verification_token


def test_user_registration_and_authentication_flow(client: TestClient, db):
    # 1. Register a new user
    register_data = {
        "first_name": "Integration",
        "last_name": "Test",
        "username": "integrationtest",
        "email": "integration@example.com",
        "password": "Vermilion-Kestrel97!"
    }
    response = client.post("/api/auth/register", json=register_data)
    assert response.status_code == status.HTTP_201_CREATED, response.text
    user_id = response.json()["id"]

    # 2. Verify the email
    token = create_verification_token(user_id)
    response = client.post("/api/auth/verify-email", json={"token": token})
    assert response.status_code == status.HTTP_200_OK, response.text

    # 3. Log in to retrieve the access token
    login_data = {
        "email": "integration@example.com",
        "password": "Vermilion-Kestrel97!"
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == status.HTTP_200_OK, response.text
    access_token = response.json()["access_token"]

    # 4. Fetch the current user profile
    headers = {"Authorization": f"Bearer {access_token}"}
    response = client.get("/api/users/me", headers=headers)
    assert response.status_code == status.HTTP_200_OK, response.text
    assert response.json()["email"] == "integration@example.com"
    assert response.json()["username"] == "integrationtest"


def test_project_creation_flow(client: TestClient, register_and_login):
    # Register and login a user
    user_id, access_token = register_and_login(
        email="creator@example.com", username="creatoruser"
    )
    headers = {"Authorization": f"Bearer {access_token}"}

    # Create a project
    project_data = {
        "title": "Integration Test Project",
        "slug": "integration-test-project",
        "description": "A project created during integration tests.",
        "stage": "idea",
        "tech_stack": "Python, FastAPI",
        "max_team_size": 5
    }
    response = client.post("/api/projects/", json=project_data, headers=headers)
    assert response.status_code == status.HTTP_201_CREATED, response.text
    project_id = response.json()["id"]

    # Verify the project exists
    response = client.get(f"/api/projects/{project_id}", headers=headers)
    assert response.status_code == status.HTTP_200_OK, response.text
    assert response.json()["title"] == "Integration Test Project"


def test_project_application_and_notification_flow(client: TestClient, register_and_login):
    # Register and login User A (Project Owner)
    owner_id, owner_token = register_and_login(
        email="owner@example.com", username="owneruser"
    )
    owner_headers = {"Authorization": f"Bearer {owner_token}"}

    # User A creates a project
    project_data = {
        "title": "Collaboration Project",
        "slug": "collab-project",
        "description": "Looking for collaborators.",
        "stage": "idea",
        "tech_stack": "React",
        "max_team_size": 3
    }
    response = client.post("/api/projects/", json=project_data, headers=owner_headers)
    assert response.status_code == status.HTTP_201_CREATED, response.text
    project_id = response.json()["id"]

    # User A creates a Builder Flare
    flare_data = {
        "title": "React Developer Needed",
        "description": "Looking for an experienced React developer.",
        "role": "Frontend Developer",
        "project_id": project_id
    }
    response = client.post("/api/flare/", json=flare_data, headers=owner_headers)
    assert response.status_code == status.HTTP_201_CREATED, response.text
    flare_id = response.json()["id"]

    # Register and login User B (Applicant)
    applicant_id, applicant_token = register_and_login(
        email="applicant@example.com", username="applicantuser"
    )
    applicant_headers = {"Authorization": f"Bearer {applicant_token}"}

    # User B applies to the project
    application_data = {
        "project_id": project_id,
        "flare_id": flare_id,
        "message": "I would love to help with the React frontend."
    }
    response = client.post("/api/applications/applications/", json=application_data, headers=applicant_headers)
    assert response.status_code == status.HTTP_201_CREATED, response.text
    
    # Authenticate as User A (Project Owner) and check notifications
    response = client.get("/api/notifications/", headers=owner_headers)
    assert response.status_code == status.HTTP_200_OK, response.text
    notifications = response.json()
    
    # Usually applying creates a notification
    assert len(notifications) > 0, "Expected a notification for the project application"
    assert any("appl" in n.get("type", "").lower() or "project" in n.get("type", "").lower() for n in notifications)
