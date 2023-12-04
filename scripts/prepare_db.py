import requests
import json
import uuid
from pathlib import Path
from typing import Any

URL = "http://localhost:8080/api"


def login(user: str, pw: str) -> requests.Session:
    s = requests.Session()
    r = s.post(
        f"{URL}/users/login", json={"user": user, "password": pw}
    )
    r.raise_for_status()
    return s


def change_password(s: requests.Session, newpw: str):
    user_data: dict[str, Any] = s.get(f"{URL}/users/current").json()
    user_data["password"] = newpw
    s.post(f"{URL}/users", json=user_data).raise_for_status()


def create_user(s: requests.Session, user: str, pw: str):
    s.post(
        f"{URL}/users", json={"name": user, "password": pw}
    ).raise_for_status()


def logout(s: requests.Session):
    s.post(f"{URL}/users/logout").raise_for_status()


def main():
    # login as admin, change the default password,
    # and create an example user
    s = login("admin", "admin")
    change_password(s, "eaef390de73a")
    create_user(s, "user", "eaef390de73a")
    logout(s)

    # login as user, and create a product
    s = login("user", "eaef390de73a")
    product_json = Path(__file__).parent / "smartphone.json"
    with open(product_json, "r", encoding="utf-8") as f:
        product = json.load(f)
        product["id"] = str(uuid.uuid4())
        s.put(f"{URL}/products", json=product).raise_for_status()
    logout(s)

    """
    # post pocesses
    processes_json = Path(__file__).parent / "processes.json"
    with open(processes_json, "r", encoding="utf-8") as f:
        processes: list = json.load(f)
        for process in processes:
            s.put(f"{URL}/processes", json=process).raise_for_status()
    """

if __name__ == "__main__":
    main()
