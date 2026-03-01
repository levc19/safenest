"""
SafeNest Backend - Domain Configuration

Defines domain-specific signal weights and configurations for
multi-domain risk scoring.
"""

DOMAIN_CONFIGS = {
    'child_safety': {
        'label': 'Child Safety',
        'description': 'Detect risks to children in public spaces',
        'signal_weights': {
            'distress_scream_detected': 45,
            'rapid_motion_detected': 35,
            'child_stopped_moving': 25,
            'adult_loitering_detected': 30,
            'multiple_reports': 20,
            'after_school_hours': 10,
        }
    },
    'elder_care': {
        'label': 'Elder Care',
        'description': 'Monitor elderly persons for health & safety risks',
        'signal_weights': {
            'fall_detected': 50,
            'no_movement_extended': 40,
            'caregiver_absent': 35,
            'emergency_call_pressed': 45,
            'abnormal_vitals': 38,
            'isolation_risk': 25,
        }
    },
    'environmental': {
        'label': 'Environmental Hazards',
        'description': 'Detect environmental risks (fire, flooding, hazmat)',
        'signal_weights': {
            'smoke_detected': 55,
            'heat_anomaly': 45,
            'water_flooding': 50,
            'toxic_fumes': 60,
            'fire_smoke_detected': 70,
            'fire_glow_detected': 65,
            'structural_damage': 40,
            'power_outage': 20,
        }
    },
    'crime_prevention': {
        'label': 'Crime Prevention',
        'description': 'Detect suspicious activity & crime risk indicators',
        'signal_weights': {
            'loitering_pattern': 35,
            'forced_entry': 55,
            'multiple_people_gathered': 30,
            'weapon_detected': 60,
            'theft_in_progress': 50,
            'after_hours_access': 25,
        }
    },
}


def get_domain_config(domain_id):
    """
    Get domain configuration by ID.
    Returns child_safety config as default if domain not found.
    
    Args:
        domain_id: Domain identifier (e.g., 'child_safety', 'elder_care')
        
    Returns:
        Dict with label, description, and signal_weights
    """
    return DOMAIN_CONFIGS.get(domain_id, DOMAIN_CONFIGS['child_safety'])


def get_all_domains():
    """
    Get list of all available domains.
    
    Returns:
        List of domain configuration dicts
    """
    return list(DOMAIN_CONFIGS.values())
