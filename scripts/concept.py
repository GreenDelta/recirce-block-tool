import uuid
from dataclasses import dataclass


@dataclass
class Material:
    name: str
    parent: str | None = None


@dataclass
class MaterialPart:
    uid: str
    material: str
    mass: float
    materials: list["MaterialPart"]

    @staticmethod
    def of(material: str, mass: float) -> "MaterialPart":
        return MaterialPart(uid(), material, mass, [])


@dataclass
class Component:
    uid: str
    name: str
    mass: float
    components: list["Component"]
    materials: list["MaterialPart"]

    @staticmethod
    def of(name: str, mass: float) -> "Component":
        return Component(uid(), name, mass, [], [])


@dataclass
class Product(Component):
    @staticmethod
    def of(name: str, mass: float) -> "Product":
        return Product(uid(), name, mass, [], [])


def uid() -> str:
    return str(uuid.uuid4())


def main():
    c1 = Component.of("Casing", 66)

    c2 = Component.of("Display", 222.2)

    c3 = Component.of("c3")
    c1.components.append(c2)
    c2.components.append(c3)
    p = Product.of("p")
    p.components.append(c1)
    print(p)


if __name__ == "__main__":
    main()
