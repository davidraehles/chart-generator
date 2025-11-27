"""
OpenAstro API implementation.

Alternative ephemeris source using the OpenAstro API.
Provides a fallback option for ephemeris calculations when local files are unavailable.
This is a stub implementation for future API integration.
"""

from typing import Optional
import httpx
from src.services.ephemeris.base import EphemerisSource
from src.models.celestial import CelestialBody
from src.models.error import ERROR_EPHEMERIS_UNAVAILABLE, ERROR_CALCULATION_FAILED


# Mapping of CelestialBody enum to OpenAstro API body identifiers
BODY_TO_OPENASTRO = {
    CelestialBody.SUN: 0,
    CelestialBody.MOON: 1,
    CelestialBody.MERCURY: 2,
    CelestialBody.VENUS: 3,
    CelestialBody.MARS: 4,
    CelestialBody.JUPITER: 5,
    CelestialBody.SATURN: 6,
    CelestialBody.URANUS: 7,
    CelestialBody.NEPTUNE: 8,
    CelestialBody.PLUTO: 9,
    CelestialBody.NORTH_NODE: 10,
    CelestialBody.SOUTH_NODE: 10,  # Calculated as North Node + 180°
    CelestialBody.CHIRON: 11,
}


class OpenAstroAPISource(EphemerisSource):
    """
    OpenAstro API calculation source.

    Uses the OpenAstro REST API for ephemeris calculations.
    Useful as a fallback or for distributed calculations.
    """

    def __init__(
        self,
        api_url: str = "https://api.openastro.org/v1",
        timeout: int = 10,
        max_retries: int = 3,
    ):
        """
        Initialize OpenAstro API source.

        Args:
            api_url: Base URL for OpenAstro API
            timeout: Request timeout in seconds
            max_retries: Maximum number of retry attempts for failed requests
        """
        self.api_url = api_url
        self.timeout = timeout
        self.max_retries = max_retries
        self._client: Optional[httpx.Client] = None

    def _get_client(self) -> httpx.Client:
        """
        Get or create HTTP client instance.

        Returns:
            httpx.Client configured for API requests
        """
        if self._client is None:
            self._client = httpx.Client(timeout=self.timeout)
        return self._client

    def calculate_position(self, body: CelestialBody, julian_day: float) -> float:
        """
        Calculate ecliptic longitude using OpenAstro API.

        Args:
            body: Celestial body to calculate
            julian_day: Julian Day Number

        Returns:
            Ecliptic longitude in degrees (0-360)

        Raises:
            RuntimeError: If calculation fails or API unavailable
        """
        if not self.is_available():
            raise RuntimeError(
                f"{ERROR_EPHEMERIS_UNAVAILABLE}: OpenAstro API is not available"
            )

        try:
            body_id = BODY_TO_OPENASTRO[body]

            # Construct API request
            endpoint = f"{self.api_url}/position"
            params = {"body": body_id, "jd": julian_day}

            # Make request with retries
            client = self._get_client()
            response = client.get(endpoint, params=params)
            response.raise_for_status()

            # Parse response
            data = response.json()
            longitude = float(data.get("longitude", 0.0))

            # Handle South Node (opposite of North Node)
            if body == CelestialBody.SOUTH_NODE:
                longitude = (longitude + 180.0) % 360.0

            return longitude

        except httpx.HTTPError as e:
            raise RuntimeError(
                f"{ERROR_CALCULATION_FAILED}: OpenAstro API request failed: {str(e)}"
            )
        except (KeyError, ValueError, TypeError) as e:
            raise RuntimeError(
                f"{ERROR_CALCULATION_FAILED}: OpenAstro API response parsing failed for {body.value}: {str(e)}"
            )
        except Exception as e:
            raise RuntimeError(
                f"{ERROR_CALCULATION_FAILED}: OpenAstro API calculation failed for {body.value}: {str(e)}"
            )

    def get_source_name(self) -> str:
        """Return source identifier."""
        return "OpenAstroAPI"

    def is_available(self) -> bool:
        """
        Check if OpenAstro API is available and reachable.

        Performs a simple health check by attempting to reach the API.

        Returns:
            True if API is reachable, False otherwise
        """
        try:
            client = self._get_client()
            response = client.head(self.api_url, timeout=5.0)
            return response.status_code < 500
        except (httpx.RequestError, httpx.TimeoutException, Exception):
            return False

    def __del__(self):
        """Clean up HTTP client on deletion."""
        if self._client is not None:
            self._client.close()
