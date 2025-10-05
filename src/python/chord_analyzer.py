import sys
import json
import librosa
import numpy as np

def analyze_song(audio_file):
    try:
        y, sr = librosa.load(audio_file, duration=60)
        
        # 1. TEMPO
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        
        # 2. KEY
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
        key_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        key_index = np.argmax(np.sum(chroma, axis=1))
        key = key_names[key_index]
        
        # 3. IMPROVED CHORD DETECTION - Template Matching
        chords = detect_chords_from_chroma(chroma, key_names)
        
        return {
            'tempo': round(float(tempo), 2),
            'key': key,
            'scale': f"{key} Major",
            'chords': chords[:4]  # Top 4 most common
        }
        
    except Exception as e:
        return {'error': str(e)}

def detect_chords_from_chroma(chroma, key_names):
    """Template-based chord detection"""
    # Define chord templates (major triads)
    chord_templates = {
        'C': [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
        'C#': [0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
        'D': [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
        'D#': [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
        'E': [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
        'F': [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
        'F#': [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
        'G': [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        'G#': [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
        'A': [0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
        'A#': [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0],
        'B': [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1]
    }
    
    # Average chroma over time
    chroma_mean = np.mean(chroma, axis=1)
    
    # Calculate similarity to each template
    similarities = {}
    for chord_name, template in chord_templates.items():
        similarity = np.dot(chroma_mean, template)
        similarities[chord_name] = similarity
    
    # Get top 4 chords
    sorted_chords = sorted(similarities.items(), key=lambda x: x[1], reverse=True)
    return [chord for chord, _ in sorted_chords[:4]]
