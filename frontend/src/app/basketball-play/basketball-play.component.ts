import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';

type Move = 'pass' | 'dunk' | 'three' | 'foul';
interface Player {
  name: string; number: number; x: number; y: number; expression: string; line: string;
  skinTone: string; eyeColor: string; hairType: string; hairColor: string; identity: string;
}
interface Team { id: string; league: 'NBA' | 'WNBA'; name: string; color: string; players: { id: string; name: string }[]; }

@Component({
  selector: 'basketball-play',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './basketball-play.component.html',
  styleUrl: './basketball-play.component.scss',
})
export class BasketballPlayComponent {
  teams: Team[] = [];
  selectedLeague: 'NBA' | 'WNBA' = 'NBA';
  selectedTeam = '';
  get availableTeams(): Team[] { return this.teams.filter(team => team.league === this.selectedLeague); }
  changeLeague(): void { this.selectedTeam = this.availableTeams[0]?.id || ''; this.opponentTeam = ''; this.reset(); }
  opponentTeam = '';
  loading = true;
  error = '';
  private readonly colors = ['#6945ad', '#278ac0', '#d86142'];
  homeScore = 0;
  awayScore = 0;
  turn = 1;
  ballHolder = 0;
  busy = false;
  message = 'Tip-off! Pick a player, then choose a play.';
  history: string[] = [];
  players: Player[] = [];
  opponents: Player[] = [];
  readonly skinTones = [
    { label: 'Deep brown', value: '#694536' }, { label: 'Medium brown', value: '#a56d4c' },
    { label: 'Tan', value: '#cc916b' }, { label: 'Light', value: '#e9b894' },
    { label: 'Fair', value: '#f6d7b7' },
  ];
  readonly eyeColors = ['Brown', 'Hazel', 'Green', 'Blue', 'Gray'];
  readonly hairTypes = ['Short', 'Curls', 'Coils', 'Braids', 'Long', 'Bald'];
  readonly hairColors = [
    { label: 'Black', value: '#24232a' }, { label: 'Brown', value: '#593c31' },
    { label: 'Blonde', value: '#d8b66a' }, { label: 'Red', value: '#a34c32' },
    { label: 'Silver', value: '#c6c6c6' },
  ];

  constructor(private http: HttpClient, route: ActivatedRoute) {
    this.selectedLeague = route.snapshot.queryParamMap.get('league') === 'WNBA' ? 'WNBA' : 'NBA';
    const base = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
      ? 'http://127.0.0.1:8000/api/v1' : `${environment.BACKEND_PUBLIC_DOMAIN}/api/v1`;
    this.http.get<Omit<Team, 'color'>[]>(`${base}/play/teams`).subscribe({
      next: teams => {
        this.teams = teams.filter(team => team.players.length >= 5).map((team, i) => ({ ...team, color: this.colors[i % this.colors.length] }));
        this.loading = false;
        if (this.teams.length < 2) { this.error = 'At least two teams with five players are needed.'; return; }
        this.selectedTeam = this.availableTeams[0].id;
        this.reset();
      },
      error: () => { this.loading = false; this.error = 'Could not load teams. Start the backend and import the project data, then reload.'; },
    });
  }

  get team(): Team { return this.teams.find(team => team.id === this.selectedTeam)!; }
  get opponent(): Team { return this.teams.find(team => team.id === this.opponentTeam)!; }
  get quarter(): number { return Math.min(4, Math.ceil(this.turn / 8)); }
  get finished(): boolean { return this.turn > 32; }
  get selectedPlayer(): Player { return this.players[this.ballHolder]; }
  get abbreviation(): string { return this.team.name.split(' ').map(word => word[0]).join(''); }
  get opponentAbbreviation(): string { return this.opponent.name.split(' ').map(word => word[0]).join(''); }

  private makePlayer(name: string, i: number, ourTeam: boolean): Player {
    return {
      name, number: i + (ourTeam ? 1 : 6),
      x: (ourTeam ? [24, 36, 47, 58, 37] : [62, 73, 81, 65, 78])[i],
      y: (ourTeam ? [28, 66, 38, 67, 84] : [22, 35, 55, 75, 85])[i],
      expression: '🙂', line: '', skinTone: this.skinTones[(i + (ourTeam ? 0 : 2)) % 5].value,
      eyeColor: this.eyeColors[i % 5], hairType: this.hairTypes[i % 5],
      hairColor: this.hairColors[i % 5].value, identity: '',
    };
  }

  reset(): void {
    if (!this.team) return;
    if (this.opponentTeam === this.selectedTeam || !this.opponentTeam) this.opponentTeam = this.availableTeams.find(team => team.id !== this.selectedTeam)?.id || '';
    if (!this.opponent) return;
    this.homeScore = 0; this.awayScore = 0; this.turn = 1; this.ballHolder = 0;
    this.message = 'Tip-off! Pick a player, then choose a play.'; this.history = [];
    this.players = this.team.players.slice(0, 5).map((player, i) => this.makePlayer(player.name, i, true));
    this.opponents = this.opponent.players.slice(0, 5).map((player, i) => this.makePlayer(player.name, i, false));
  }

  selectPlayer(index: number): void {
    if (this.busy || this.finished) return;
    this.ballHolder = index;
    this.message = `${this.players[index].name} has the ball. What's the play?`;
  }

  play(move: Move): void {
    if (this.busy || this.finished) return;
    const player = this.players[this.ballHolder];
    this.players.forEach(p => { p.expression = '🙂'; p.line = ''; });
    this.opponents.forEach(p => { p.expression = '😐'; p.line = ''; });
    const defender = this.opponents[this.turn % 5];
    if (move === 'pass') {
      this.ballHolder = (this.ballHolder + 1 + Math.floor(Math.random() * 4)) % 5;
      player.line = 'I see you!';
      this.players[this.ballHolder].line = 'Got it!';
      this.message = `${player.name} passes to ${this.players[this.ballHolder].name}. The possession continues.`;
    } else {
      const made = Math.random() < (move === 'dunk' ? .72 : move === 'three' ? .42 : .65);
      if (move === 'foul') {
        defender.expression = '😤'; defender.line = 'Foul!'; player.line = 'Two shots!';
        const points = Number(Math.random() < .75) + Number(Math.random() < .75);
        this.homeScore += points;
        this.message = `${defender.name} fouls ${player.name}. ${player.name} makes ${points} of 2 free throws.`;
      } else {
        player.expression = made ? '🤩' : '😣';
        player.line = made ? (move === 'dunk' ? 'Boom!' : 'Splash!') : 'Next one!';
        defender.line = made ? 'Tough shot!' : 'Good stop!';
        if (made) this.homeScore += move === 'dunk' ? 2 : 3;
        this.message = `${player.name} ${move === 'dunk' ? 'drives for a dunk' : 'shoots a three'} — ${made ? 'it scores!' : 'it misses.'}`;
      }
      this.history.unshift(`Q${this.quarter} · ${this.message}`);
      const opponentPoints = Math.random() < .53 ? (Math.random() < .35 ? 3 : 2) : 0;
      this.awayScore += opponentPoints;
      this.history.unshift(`Q${this.quarter} · ${this.opponent.name} ${opponentPoints ? `answer with ${opponentPoints} points` : 'miss their shot'}.`);
      this.turn++;
      this.ballHolder = this.turn % 5;
      if (this.finished) {
        const result = this.homeScore === this.awayScore ? 'Tie game!' :
          this.homeScore > this.awayScore ? `${this.team.name} win!` : `${this.opponent.name} win!`;
        this.message += ` Final: ${result}`;
      }
    }
  }
}
