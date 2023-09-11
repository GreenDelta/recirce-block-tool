import requests
import uuid

def main():
    s = requests.Session()
    s.post("http://localhost:8080/api/products", json={
        "id": str(uuid.uuid4()),
        "name": "Smartphone",
        "components": [
            {

            }
        ]
    })


if __name__ == "__main__":
    main()
