import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { LineupsService } from '../_services/lineups.service';
import { RouterLink } from '@angular/router';

interface Lineup {
  team_id: string;
  team_name: string;
  players: { player_id: string; name: string }[];
  total_possessions: number;
  offensive_possessions: number;
  defensive_possessions: number;
  offensive_points: number;
  defensive_points: number;
  offensive_rating: number;
  defensive_rating: number;
  net_rating: number | null;
  offensive_rebound_rate: number;
  defensive_rebound_rate: number;
}

@Component({
  selector: 'lineups-summary-component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lineups-summary.component.html',
  styleUrl: './lineups-summary.component.scss',
})
export class LineupsSummaryComponent implements OnInit {
  private readonly lineupsService = inject(LineupsService);
  private readonly cdr = inject(ChangeDetectorRef);
  lineups: Lineup[] = [];
  lineupSize = 5;
  search = '';
  team = '';
  sortBy: 'net_rating' | 'total_possessions' | 'offensive_rebound_rate' | 'defensive_rebound_rate' = 'net_rating';
  loading = false;
  error = '';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.lineupsService.getLineupsLeagueSummary(this.lineupSize).subscribe({
      next: ({ apiResponse }) => {
        this.lineups = apiResponse as Lineup[];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Could not load lineups. Make sure the backend and database are running.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  get teams(): string[] { return [...new Set(this.lineups.map(row => row.team_name))].sort(); }

  get visible(): Lineup[] {
    const query = this.search.trim().toLowerCase();
    return this.lineups.filter(row =>
      (!this.team || row.team_name === this.team) &&
      (!query || row.team_name.toLowerCase().includes(query) ||
        row.players.some(player => player.name.toLowerCase().includes(query)))
    ).sort((a, b) => (b[this.sortBy] ?? -Infinity) - (a[this.sortBy] ?? -Infinity) ||
      b.total_possessions - a.total_possessions);
  }

  get leader(): Lineup | undefined { return this.visible.find(row => row.net_rating !== null); }
  get reboundLeader(): Lineup | undefined {
    return [...this.visible].sort((a, b) =>
      (b.offensive_rebound_rate + b.defensive_rebound_rate) -
      (a.offensive_rebound_rate + a.defensive_rebound_rate))[0];
  }
}
