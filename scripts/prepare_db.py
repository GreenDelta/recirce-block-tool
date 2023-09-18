import requests

from typing import Any


def main():
    url = "http://localhost:8080/api"
    s = requests.Session()

    # login as default admin
    r = s.post(
        f"{url}/users/login", json={"user": "Admin", "password": "admin"}
    )
    r.raise_for_status()
    admin: dict[str, Any] = s.get(f"{url}/users/current").json()

    # change password of admin
    admin_data = admin.copy()
    admin_data["password"] = "eaef390de73a"
    s.post(f"{url}/users", json=admin_data).raise_for_status()

    # create a test user
    s.post(
        f"{url}/users", json={"name": "Test", "password": "eaef390de73a"}
    ).raise_for_status()

    print(admin)


if __name__ == "__main__":
    main()
