export interface QuizOption {
  id: string;
  textKey: string;
}

export interface QuizQuestion {
  id: string;
  promptKey: string;
  options: QuizOption[];
  correctId: string;
  whyKey: string;
}
