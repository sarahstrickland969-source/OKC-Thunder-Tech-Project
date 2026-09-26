"""Aggregate player combinations across possessions on both ends of the court."""

from collections import defaultdict
from itertools import combinations

from app.dbmodels.models import Player, Possession, Team

STATS = (
    'points', 'shot_attempts', 'fg2_made', 'fg2_attempted', 'fg3_made',
    'fg3_attempted', 'fg_made', 'fg_attempted', 'ft_made', 'ft_attempted',
    'rebounds_offense', 'rebounds_defense', 'rebound_opportunities',
    'assists', 'steals', 'turnovers', 'blocks', 'offensive_fouls',
    'defensive_fouls', 'shooting_fouls', 'shot_attempt_points',
    'ft_potential_points', 'transition_take_fouls',
)


def _ratio(numerator, denominator):
    return round(numerator / denominator, 3) if denominator else 0


def aggregate_lineups(possessions, players, teams, lineup_size=5):
    """Count each possession for every subset on its offense and defense sides.

    Defensive stats represent what the opponent achieved against the lineup.
    """
    size = max(1, min(5, int(lineup_size)))
    grouped = {}
    for possession in possessions:
        for side, team_key, player_key in (
            ('offensive', 'offensive_team_id', 'offensive_player_ids'),
            ('defensive', 'defensive_team_id', 'defensive_player_ids'),
        ):
            team_id = str(possession[team_key])
            for subset in combinations(sorted(map(str, possession[player_key])), size):
                key = (team_id, subset)
                row = grouped.setdefault(key, defaultdict(int))
                row[f'{side}_possessions'] += 1
                for stat in STATS:
                    row[f'{side}_{stat}'] += possession[stat]

    results = []
    for (team_id, ids), values in grouped.items():
        row = {f'{side}_{stat}': values[f'{side}_{stat}']
               for side in ('offensive', 'defensive') for stat in STATS}
        for side in ('offensive', 'defensive'):
            row[f'{side}_possessions'] = values[f'{side}_possessions']
            for suffix, made, attempted in (
                ('fg_pct', 'fg_made', 'fg_attempted'),
                ('fg2_pct', 'fg2_made', 'fg2_attempted'),
                ('fg3_pct', 'fg3_made', 'fg3_attempted'),
            ):
                row[f'{side}_{suffix}'] = _ratio(values[f'{side}_{made}'], values[f'{side}_{attempted}'])
        offense, defense = row['offensive_possessions'], row['defensive_possessions']
        row.update(
            team_id=team_id, team_name=teams.get(team_id, 'Unknown team'),
            player_ids=list(ids),
            players=[{'player_id': id_, 'name': players.get(id_, 'Unknown player')} for id_ in ids],
            total_possessions=offense + defense,
            point_differential=row['offensive_points'] - row['defensive_points'],
            offensive_rating=round(100 * row['offensive_points'] / offense, 1) if offense else 0,
            defensive_rating=round(100 * row['defensive_points'] / defense, 1) if defense else 0,
            offensive_rebound_rate=_ratio(row['offensive_rebounds_offense'], row['offensive_rebound_opportunities']),
            defensive_rebound_rate=_ratio(row['defensive_rebounds_defense'], row['defensive_rebound_opportunities']),
        )
        row['net_rating'] = round(row['offensive_rating'] - row['defensive_rating'], 1) if offense and defense else None
        results.append(row)
    return sorted(results, key=lambda row: (
        row['net_rating'] is None, -(row['net_rating'] or 0), -row['total_possessions'], row['team_name'], row['player_ids']))


def get_lineup_league_summary_stats(lineup_size=5):
    fields = ('offensive_team_id', 'defensive_team_id', 'offensive_player_ids',
              'defensive_player_ids', *STATS)
    possessions = Possession.objects.values(*fields).iterator(chunk_size=2000)
    players = {str(id_): name for id_, name in Player.objects.values_list('id', 'name')}
    teams = {str(id_): name for id_, name in Team.objects.values_list('id', 'name')}
    return aggregate_lineups(possessions, players, teams, lineup_size)
