"""
Celestial body definitions for Human Design calculations.

Defines the 13 celestial bodies used in Human Design charts.
"""

from enum import Enum


class CelestialBody(str, Enum):
    """
    Celestial bodies used in Human Design chart calculations.

    Total: 13 bodies
    - Sun, Moon, 8 planets
    - North Node, South Node (lunar nodes)
    - Chiron (minor planet)
    """

    SUN = "Sun"
    MOON = "Moon"
    MERCURY = "Mercury"
    VENUS = "Venus"
    MARS = "Mars"
    JUPITER = "Jupiter"
    SATURN = "Saturn"
    URANUS = "Uranus"
    NEPTUNE = "Neptune"
    PLUTO = "Pluto"
    NORTH_NODE = "North Node"
    SOUTH_NODE = "South Node"
    CHIRON = "Chiron"

    @classmethod
    def all_bodies(cls) -> list["CelestialBody"]:
        """Return all 13 celestial bodies in order."""
        return [
            cls.SUN,
            cls.MOON,
            cls.MERCURY,
            cls.VENUS,
            cls.MARS,
            cls.JUPITER,
            cls.SATURN,
            cls.URANUS,
            cls.NEPTUNE,
            cls.PLUTO,
            cls.NORTH_NODE,
            cls.SOUTH_NODE,
            cls.CHIRON,
        ]
