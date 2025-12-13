export interface LoadData {
  [span: number]: number | null; // Span in cm -> Load in kg/m2
}

export interface PanelSpec {
  id: string;
  thickness: number; // mm
  steelExt: number; // mm
  steelInt: number; // mm
  weight: number; // kg/m2
  transmittance?: number; // W/m2K
  loads: LoadData;
}

export interface FilterState {
  thickness: number | 'all';
  steelExt: number | 'all';
  steelInt: number | 'all';
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  role: MessageRole;
  text: string;
  isError?: boolean;
}