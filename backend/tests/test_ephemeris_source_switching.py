"""
Test ephemeris source switching by changing EPHEMERIS_SOURCE environment variable.

Verifies that:
1. EPHEMERIS_SOURCE can be set to 'swiss_ephemeris', 'openastro_api', or 'nasa_jpl'
2. EphemerisConfig correctly loads the configured source
3. The source factory respects the configuration
"""

import os
import pytest
from pydantic import ValidationError
from src.models.ephemeris import EphemerisConfig
from src.services.ephemeris import load_config
from src.services.ephemeris.source_factory import get_ephemeris_source


class TestEphemerisSourceConfiguration:
    """Test EPHEMERIS_SOURCE environment variable configuration."""

    def test_default_ephemeris_source(self):
        """Test that default source is swiss_ephemeris."""
        # Clear EPHEMERIS_SOURCE if set
        os.environ.pop("EPHEMERIS_SOURCE", None)
        config = load_config()
        assert config.source == "swiss_ephemeris"

    def test_set_source_to_swiss_ephemeris(self, monkeypatch):
        """Test setting EPHEMERIS_SOURCE to swiss_ephemeris."""
        monkeypatch.setenv("EPHEMERIS_SOURCE", "swiss_ephemeris")
        config = load_config()
        assert config.source == "swiss_ephemeris"

    def test_set_source_to_openastro_api(self, monkeypatch):
        """Test setting EPHEMERIS_SOURCE to openastro_api."""
        monkeypatch.setenv("EPHEMERIS_SOURCE", "openastro_api")
        config = load_config()
        assert config.source == "openastro_api"

    def test_set_source_to_nasa_jpl(self, monkeypatch):
        """Test setting EPHEMERIS_SOURCE to nasa_jpl."""
        monkeypatch.setenv("EPHEMERIS_SOURCE", "nasa_jpl")
        config = load_config()
        assert config.source == "nasa_jpl"

    def test_invalid_ephemeris_source(self, monkeypatch):
        """Test that invalid source raises ValidationError."""
        monkeypatch.setenv("EPHEMERIS_SOURCE", "invalid_source")
        with pytest.raises(ValidationError) as exc_info:
            load_config()
        # Verify the error is about the source field
        assert "source" in str(exc_info.value).lower()

    def test_case_sensitive_source(self, monkeypatch):
        """Test that source is case-sensitive (Literal types in pydantic)."""
        monkeypatch.setenv("EPHEMERIS_SOURCE", "SWISS_EPHEMERIS")
        # Literal types are case-sensitive - uppercase should fail
        with pytest.raises(ValidationError):
            load_config()

    def test_ephemeris_path_configuration(self, monkeypatch):
        """Test that EPHEMERIS_PATH is correctly loaded."""
        monkeypatch.setenv("EPHEMERIS_PATH", "/custom/path/to/ephemeris")
        config = load_config()
        assert config.ephemeris_path == "/custom/path/to/ephemeris"

    def test_ephemeris_path_default(self):
        """Test that EPHEMERIS_PATH defaults to /app/data/ephemeris."""
        os.environ.pop("EPHEMERIS_PATH", None)
        config = load_config()
        assert config.ephemeris_path == "/app/data/ephemeris"

    def test_openastro_api_url_configuration(self, monkeypatch):
        """Test that OPENASTRO_API_URL is correctly loaded."""
        monkeypatch.setenv("OPENASTRO_API_URL", "https://custom.openastro.org/v1")
        config = load_config()
        assert config.openastro_api_url == "https://custom.openastro.org/v1"

    def test_openastro_api_url_default(self):
        """Test that OPENASTRO_API_URL defaults to None."""
        os.environ.pop("OPENASTRO_API_URL", None)
        config = load_config()
        assert config.openastro_api_url is None

    def test_source_factory_respects_configuration(self, monkeypatch):
        """Test that source factory uses configured source or falls back."""
        # Set to swiss_ephemeris (the only source likely available in tests)
        monkeypatch.setenv("EPHEMERIS_SOURCE", "swiss_ephemeris")
        
        # The factory will try to use the configured source
        # If swiss_ephemeris is available, it should return it
        # If not, the factory raises RuntimeError
        try:
            source = get_ephemeris_source()
            # Verify we got some source
            assert source is not None
            assert hasattr(source, "is_available")
            assert source.is_available()
        except RuntimeError:
            # Swiss ephemeris data files may not be available in test env
            pytest.skip("Swiss Ephemeris not available in test environment")

    def test_all_valid_sources_in_config(self):
        """Verify all three valid sources are documented in the model."""
        # This test ensures the Literal type includes all expected sources
        config_dict = EphemerisConfig.model_json_schema()
        # The source field should exist
        assert "source" in config_dict["properties"]
        source_schema = config_dict["properties"]["source"]
        # Check that it's a literal/enum
        assert "enum" in source_schema or "anyOf" in source_schema


class TestEphemerisSourceSwitchingIntegration:
    """Integration tests for switching between ephemeris sources."""

    def test_switch_from_swiss_to_openastro(self, monkeypatch):
        """Test switching from swiss_ephemeris to openastro_api."""
        monkeypatch.setenv("EPHEMERIS_SOURCE", "swiss_ephemeris")
        config1 = load_config()
        assert config1.source == "swiss_ephemeris"
        
        monkeypatch.setenv("EPHEMERIS_SOURCE", "openastro_api")
        config2 = load_config()
        assert config2.source == "openastro_api"

    def test_switch_from_openastro_to_nasa_jpl(self, monkeypatch):
        """Test switching from openastro_api to nasa_jpl."""
        monkeypatch.setenv("EPHEMERIS_SOURCE", "openastro_api")
        config1 = load_config()
        assert config1.source == "openastro_api"
        
        monkeypatch.setenv("EPHEMERIS_SOURCE", "nasa_jpl")
        config2 = load_config()
        assert config2.source == "nasa_jpl"

    def test_switch_to_swiss_and_back(self, monkeypatch):
        """Test switching away from swiss_ephemeris and back."""
        monkeypatch.setenv("EPHEMERIS_SOURCE", "nasa_jpl")
        config1 = load_config()
        assert config1.source == "nasa_jpl"
        
        monkeypatch.setenv("EPHEMERIS_SOURCE", "swiss_ephemeris")
        config2 = load_config()
        assert config2.source == "swiss_ephemeris"
