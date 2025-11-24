"""Service to normalize HD API responses to internal format"""
from typing import Dict, Any
from src.models.chart import (
    ChartResponse,
    TypeInfo,
    AuthorityInfo,
    ProfileInfo,
    Center,
    Channel,
    IncarnationCross
)


class NormalizationService:
    """Normalize external HD API responses to internal ChartResponse format"""

    @staticmethod
    def normalize_chart(raw_data: Dict[str, Any], first_name: str) -> ChartResponse:
        """
        Convert raw HD API response to ChartResponse model

        Args:
            raw_data: Raw response from HD API
            first_name: User's first name

        Returns:
            Normalized ChartResponse
        """
        # Extract type information
        type_data = raw_data.get("type", {})
        type_info = TypeInfo(
            code=type_data.get("code", "1"),
            label=type_data.get("name", "Generator"),
            shortDescription=type_data.get("description", "")
        )

        # Extract authority information
        auth_data = raw_data.get("authority", {})
        authority_info = AuthorityInfo(
            code=auth_data.get("code", "emotional"),
            label=auth_data.get("name", "Emotional"),
            decisionHint=auth_data.get("hint", "Warte auf emotionale Klarheit.")
        )

        # Extract profile information
        profile_data = raw_data.get("profile", {})
        profile_info = ProfileInfo(
            code=profile_data.get("code", "4/1"),
            shortDescription=profile_data.get("description", "")
        )

        # Extract centers
        centers_data = raw_data.get("centers", [])
        centers = [
            Center(
                name=c.get("name", ""),
                code=c.get("code", ""),
                defined=c.get("defined", False)
            )
            for c in centers_data
        ]

        # Extract channels
        channels_data = raw_data.get("channels", [])
        channels = [
            Channel(code=ch.get("code", ""))
            for ch in channels_data
        ]

        # Extract gates
        gates_data = raw_data.get("gates", {})
        gates = {
            "conscious": gates_data.get("conscious", []),
            "unconscious": gates_data.get("unconscious", [])
        }

        # Extract incarnation cross
        cross_data = raw_data.get("incarnationCross", {})
        incarnation_cross = IncarnationCross(
            code=cross_data.get("code", ""),
            name=cross_data.get("name", ""),
            gates=cross_data.get("gates", [])
        )

        # Generate short impulse
        short_impulse = NormalizationService._generate_impulse(
            type_info.code,
            authority_info.code
        )

        return ChartResponse(
            firstName=first_name,
            type=type_info,
            authority=authority_info,
            profile=profile_info,
            centers=centers,
            channels=channels,
            gates=gates,
            incarnationCross=incarnation_cross,
            shortImpulse=short_impulse
        )

    @staticmethod
    def _generate_impulse(type_code: str, authority_code: str) -> str:
        """
        Generate personalized impulse message based on Type + Authority

        Args:
            type_code: Type code (1-5)
            authority_code: Authority code

        Returns:
            Personalized German sentence
        """
        # Simple impulse mapping (can be expanded from config file)
        impulses = {
            ("1", "emotional"): "Wenn du deiner emotionalen Klarheit vertraust, kann deine Energie Wunder bewegen.",
            ("1", "sakral"): "Deine sakrale Antwort zeigt dir den Weg zu echter Erfüllung.",
            ("2", "emotional"): "Mit emotionaler Klarheit wird deine manifestierende Kraft unaufhaltsam.",
            ("2", "sakral"): "Dein Sakral und deine Geduld sind deine größten Geschenke.",
            ("3", "milz"): "Deine spontane Wahrnehmung führt dich zu den richtigen Entscheidungen.",
            ("3", "selbst_projektiert"): "Wenn du auf Einladungen wartest, öffnen sich die richtigen Türen.",
            ("4", "ego_manifestiert"): "Deine Willenskraft bringt Visionen in die Realität.",
            ("4", "emotional"): "Mit emotionaler Klarheit manifestierst du kraftvoll und nachhaltig.",
            ("5", "lunar"): "Im Rhythmus des Mondes findest du deine einzigartige Perspektive.",
        }

        key = (type_code, authority_code)
        return impulses.get(
            key,
            "Vertraue deiner inneren Autorität - sie kennt deinen Weg."
        )
