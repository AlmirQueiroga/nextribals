import { HeroDict } from "./types";

export type MapsDict = {
    [mapId : string]: HeroDict
  };

export type Match = {
    match_uid: string;
    game_mode_id: number;
    match_play_duration: number;
    match_map_id?: string;
    match_player?: MatchPlayer;
    match_players?: MatchPlayer[]
}

export type MatchPlayer = {
    player_uid: string;
    is_win?: boolean;
    player_heroes?: PlayerHero[]
}

export type PlayerHero = {
  hero_id: string;
  play_time: number;
  session_hit_rate: string;
}