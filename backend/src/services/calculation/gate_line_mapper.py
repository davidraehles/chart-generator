"""
Gate and line mapper for Human Design.

Maps ecliptic longitude (0-360°) to Human Design gates (1-64) and lines (1-6).
The I'Ching wheel is divided into 64 gates of 5.625° each, with 6 lines per gate.
"""

from typing import Tuple

# Human Design gate sequence starting at 0° Aries (ecliptic longitude 0°)
# The wheel follows the I'Ching quaternary sequence
GATE_SEQUENCE = [
    41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
    27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
    31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
    28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
]


def ecliptic_to_gate_line(ecliptic_longitude: float) -> Tuple[int, int]:
    """
    Convert ecliptic longitude to Human Design gate and line.

    Args:
        ecliptic_longitude: Position in degrees (0-360)

    Returns:
        Tuple of (gate, line) where gate is 1-64 and line is 1-6

    Example:
        >>> ecliptic_to_gate_line(0.0)
        (41, 1)  # Gate 41, Line 1
        >>> ecliptic_to_gate_line(5.625)
        (19, 1)  # Gate 19, Line 1
    """
    # Normalize to 0-360 range
    longitude = ecliptic_longitude % 360.0

    # Each gate covers 5.625° (360° / 64 gates)
    degrees_per_gate = 360.0 / 64.0  # 5.625°

    # Each line covers 0.9375° (5.625° / 6 lines)
    degrees_per_line = degrees_per_gate / 6.0  # 0.9375°

    # Find which gate index (0-63) this longitude falls into
    gate_index = int(longitude / degrees_per_gate)

    # Handle edge case: exactly 360° should be gate 0
    if gate_index >= 64:
        gate_index = 0

    # Get the actual gate number from the sequence
    gate = GATE_SEQUENCE[gate_index]

    # Find position within the gate (0 to 5.625°)
    position_in_gate = longitude - (gate_index * degrees_per_gate)

    # Find which line (0-5) within the gate
    line_index = int(position_in_gate / degrees_per_line)

    # Handle edge case: if exactly at gate boundary, it's the last line of previous gate
    if line_index >= 6:
        line_index = 5

    # Lines are 1-indexed (1-6)
    line = line_index + 1

    return (gate, line)


def format_gate_line(gate: int, line: int) -> str:
    """
    Format gate and line as a string.

    Args:
        gate: Gate number (1-64)
        line: Line number (1-6)

    Returns:
        Formatted string like "41.3"

    Example:
        >>> format_gate_line(41, 3)
        "41.3"
    """
    return f"{gate}.{line}"


def get_gate_info(gate: int) -> dict:
    """
    Get basic information about a gate (placeholder for future expansion).

    Args:
        gate: Gate number (1-64)

    Returns:
        Dictionary with gate information

    Note:
        This is a placeholder. Full gate names, keywords, and descriptions
        can be added in future phases.
    """
    return {
        "number": gate,
        "name": None,  # Can be populated with gate names later
        "keywords": None,  # Can be populated with gate keywords later
    }
