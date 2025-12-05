"""Celestial body enumeration for planetary positions"""

from enum import Enum


class CelestialBody(str, Enum):
    """
    Celestial bodies used in Human Design calculations.
    13 activation points per person (personality + design).
    """

    SUN = "Sun"
    EARTH = "Earth"
    MOON = "Moon"
    NORTH_NODE = "North Node"
    SOUTH_NODE = "South Node"
    MERCURY = "Mercury"
    VENUS = "Venus"
    MARS = "Mars"
    JUPITER = "Jupiter"
    SATURN = "Saturn"
    URANUS = "Uranus"
    NEPTUNE = "Neptune"
    PLUTO = "Pluto"
