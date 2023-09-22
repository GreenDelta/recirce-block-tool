import requests
import json
from pathlib import Path
from typing import Any


def main():
    url = "http://localhost:8080/api"
    s = requests.Session()

    # login as default admin
    r = s.post(
        f"{url}/users/login", json={"user": "admin", "password": "admin"}
    )
    r.raise_for_status()
    admin: dict[str, Any] = s.get(f"{url}/users/current").json()

     # change password of admin
    admin_data = admin.copy()
    admin_data["password"] = "eaef390de73a"
    s.post(f"{url}/users", json=admin_data).raise_for_status()
    print(admin)

    # create a test user
    # s.post(
    #     f"{url}/users", json={"name": "Test", "password": "eaef390de73a"}
    # ).raise_for_status()

    example = Path(__file__).parent / "example.json"
    with open(example, "r", encoding="utf-8") as f:
        product = json.load(f)
        s.put(f"{url}/products", json=product).raise_for_status()

if __name__ == "__main__":
    main()
