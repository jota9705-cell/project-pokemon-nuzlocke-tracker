#!/usr/bin/env python3
"""
Script para extraer datos de Pokemon Añil y convertirlos a JSON
Soporta múltiples modos de juego (Normal/Completo/Radical)
"""
import json
import re
from pathlib import Path

# Ruta a los archivos PBS
PBS_PATH = Path("/Users/a4694516/Downloads/POKEMON_ANIL/Pokemon Anil/PBS")

def parse_encounters():
    """Parsea encounters.txt y extrae rutas con sus pokemon (ambos modos)"""
    encounters_file = PBS_PATH / "encounters.txt"
    encounters = []

    with open(encounters_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Dividir por bloques de rutas
    blocks = re.split(r'#={30,}', content)

    for block in blocks:
        if not block.strip():
            continue

        # Extraer ID y nombre de la ruta
        route_match = re.search(r'\[(\d+)\]\s*#\s*(.+)', block)
        if not route_match:
            continue

        route_id = route_match.group(1)
        route_name = route_match.group(2).strip()

        # Extraer pokemon de encuentros terrestres COMPLETO (Land)
        pokemon_complete = []
        land_section = re.search(r'Land,\d+\n((?:\s+\d+,.+\n)+)', block)

        if land_section:
            for line in land_section.group(1).strip().split('\n'):
                # Formato: 25,PIDGEY,2,4
                match = re.search(r'\s*\d+,(\w+),(\d+),(\d+)', line)
                if match:
                    pokemon_name = match.group(1)
                    min_level = int(match.group(2))
                    max_level = int(match.group(3))

                    # Evitar duplicados
                    if pokemon_name not in [p['name'] for p in pokemon_complete]:
                        pokemon_complete.append({
                            'name': pokemon_name,
                            'min_level': min_level,
                            'max_level': max_level
                        })

        # Extraer pokemon de encuentros CLÁSICOS (LandClassic)
        pokemon_classic = []
        land_classic_section = re.search(r'LandClassic,\d+\n((?:\s+\d+,.+\n)+)', block)

        if land_classic_section:
            for line in land_classic_section.group(1).strip().split('\n'):
                match = re.search(r'\s*\d+,(\w+),(\d+),(\d+)', line)
                if match:
                    pokemon_name = match.group(1)
                    min_level = int(match.group(2))
                    max_level = int(match.group(3))

                    if pokemon_name not in [p['name'] for p in pokemon_classic]:
                        pokemon_classic.append({
                            'name': pokemon_name,
                            'min_level': min_level,
                            'max_level': max_level
                        })

        if pokemon_complete or pokemon_classic:
            encounters.append({
                'id': route_id,
                'name': route_name,
                'pokemon_complete': pokemon_complete,
                'pokemon_classic': pokemon_classic
            })

    return encounters

def parse_gym_leaders():
    """Parsea trainers.txt y extrae líderes de gimnasio"""
    trainers_file = PBS_PATH / "trainers.txt"
    gym_leaders = []

    with open(trainers_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Buscar bloques de líderes (LIDER1, LIDER2, etc.)
    # Formato: [LIDER1,Brock]
    leader_blocks = re.finditer(
        r'\[LIDER(\d+)(?:HOENN)?,([^\]]+)\]\n'
        r'LoseText = ([^\n]+)\n'
        r'((?:.*\n)*?)'
        r'(?=#---------|$)',
        content,
        re.MULTILINE
    )

    seen_leaders = {}

    for match in leader_blocks:
        gym_number = int(match.group(1))
        leader_name = match.group(2).strip()
        lose_text = match.group(3).strip()
        team_block = match.group(4)

        # Extraer pokemon del equipo
        team = []
        pokemon_entries = re.finditer(r'Pokemon = (\w+),(\d+)', team_block)

        for pkmn in pokemon_entries:
            team.append({
                'name': pkmn.group(1),
                'level': int(pkmn.group(2))
            })

        if team:
            # Agrupar variantes por líder
            leader_key = f"{gym_number}_{leader_name.split(',')[0]}"

            if leader_key not in seen_leaders:
                seen_leaders[leader_key] = {
                    'gym_number': gym_number,
                    'name': leader_name.split(',')[0],
                    'quote': lose_text,
                    'variants': []
                }

            seen_leaders[leader_key]['variants'].append({
                'variant_name': leader_name,
                'team': team
            })

    return sorted(seen_leaders.values(), key=lambda x: x['gym_number'])

def parse_map_metadata():
    """Parsea map_metadata.txt para obtener nombres de zonas"""
    metadata_file = PBS_PATH / "map_metadata.txt"
    maps = []

    with open(metadata_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Buscar bloques [ID] Name = ...
    map_blocks = re.finditer(
        r'\[(\d+)\][^\n]*\n'
        r'Name = ([^\n]+)',
        content
    )

    for match in map_blocks:
        map_id = match.group(1)
        map_name = match.group(2).strip()

        if map_name and map_name != "Intro":
            maps.append({
                'id': map_id,
                'name': map_name
            })

    return maps

def generate_nuzlocke_rules():
    """Genera las reglas configurables de Nuzlocke"""
    return {
        "basic_rules": [
            {
                "id": "first_encounter",
                "name": "Primera captura",
                "description": "Solo puedes capturar el primer Pokémon de cada ruta",
                "default": True,
                "mandatory": True
            },
            {
                "id": "fainted_is_dead",
                "name": "Debilitado = Muerto",
                "description": "Si un Pokémon se debilita, se considera muerto y debe ser liberado o boxeado permanentemente",
                "default": True,
                "mandatory": True
            },
            {
                "id": "must_nickname",
                "name": "Apodos obligatorios",
                "description": "Debes ponerle un apodo a todos los Pokémon capturados",
                "default": True,
                "mandatory": True
            }
        ],
        "optional_rules": [
            {
                "id": "dupes_clause",
                "name": "Dupes Clause",
                "description": "Si encuentras un Pokémon que ya tienes, puedes buscar otro en la misma ruta",
                "default": False
            },
            {
                "id": "shiny_clause",
                "name": "Shiny Clause",
                "description": "Los Pokémon shiny pueden ser capturados sin importar la regla de primera captura",
                "default": True
            },
            {
                "id": "level_cap",
                "name": "Level Cap",
                "description": "No puedes superar el nivel del siguiente líder de gimnasio",
                "default": False
            },
            {
                "id": "no_items_battle",
                "name": "Sin ítems en combate",
                "description": "No puedes usar ítems durante los combates (excepto held items)",
                "default": False
            },
            {
                "id": "set_mode",
                "name": "Modo Set",
                "description": "No puedes cambiar de Pokémon cuando el rival va a sacar uno nuevo",
                "default": False
            },
            {
                "id": "no_overleveling",
                "name": "Sin sobreentrenamiento",
                "description": "No puedes entrenar más allá del nivel cap del próximo gimnasio",
                "default": False
            },
            {
                "id": "species_clause",
                "name": "Species Clause",
                "description": "Solo puedes tener un Pokémon de cada especie en tu equipo al mismo tiempo",
                "default": False
            }
        ]
    }

def main():
    print("🔍 Extrayendo datos de Pokemon Añil...")

    # Extraer encuentros
    print("\n📍 Procesando encuentros por ruta (ambos modos)...")
    encounters = parse_encounters()
    print(f"   ✅ {len(encounters)} rutas encontradas")

    # Extraer líderes de gimnasio
    print("\n🏅 Procesando líderes de gimnasio...")
    gym_leaders = parse_gym_leaders()
    print(f"   ✅ {len(gym_leaders)} líderes encontrados")

    # Extraer mapas
    print("\n🗺️  Procesando metadatos de mapas...")
    maps = parse_map_metadata()
    print(f"   ✅ {len(maps)} mapas encontrados")

    # Generar reglas de Nuzlocke
    print("\n📜 Generando reglas de Nuzlocke configurables...")
    nuzlocke_rules = generate_nuzlocke_rules()
    print(f"   ✅ {len(nuzlocke_rules['basic_rules'])} reglas básicas")
    print(f"   ✅ {len(nuzlocke_rules['optional_rules'])} reglas opcionales")

    # Guardar en JSON
    output_dir = Path(__file__).parent / "game_data"
    output_dir.mkdir(exist_ok=True)

    with open(output_dir / "encounters.json", 'w', encoding='utf-8') as f:
        json.dump(encounters, f, indent=2, ensure_ascii=False)

    with open(output_dir / "gym_leaders.json", 'w', encoding='utf-8') as f:
        json.dump(gym_leaders, f, indent=2, ensure_ascii=False)

    with open(output_dir / "maps.json", 'w', encoding='utf-8') as f:
        json.dump(maps, f, indent=2, ensure_ascii=False)

    with open(output_dir / "nuzlocke_rules.json", 'w', encoding='utf-8') as f:
        json.dump(nuzlocke_rules, f, indent=2, ensure_ascii=False)

    print(f"\n✨ Datos extraídos exitosamente en: {output_dir}/")
    print("\nArchivos generados:")
    print("  - encounters.json (rutas con Pokemon por modo)")
    print("  - gym_leaders.json (líderes con variantes)")
    print("  - maps.json (mapas y zonas)")
    print("  - nuzlocke_rules.json (reglas configurables)")

    # Mostrar preview
    print("\n📊 Preview de datos:")
    print(f"\n🎯 Primeras 3 rutas:")
    for enc in encounters[:3]:
        print(f"  - {enc['name']}:")
        print(f"    • Modo Completo: {len(enc['pokemon_complete'])} Pokemon")
        print(f"    • Modo Clásico: {len(enc['pokemon_classic'])} Pokemon")

    print(f"\n🏅 Líderes de gimnasio:")
    for leader in gym_leaders[:4]:
        print(f"  {leader['gym_number']}. {leader['name']} - {len(leader['variants'])} variantes")

if __name__ == "__main__":
    main()
