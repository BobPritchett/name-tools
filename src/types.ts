/**
 * Represents a person's name broken down into its component parts
 */
export interface ParsedName {
  prefix?: string;
  first: string;
  middle?: string;
  last: string;
  suffix?: string;
  nickname?: string;
}

