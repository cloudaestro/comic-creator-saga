export interface Panel {
  id: string;
  image_url: string;
  sequence_number: number;
  text_content: string | null;
}

export interface Comic {
  id: string;
  title: string;
  description: string;
  created_at: string;
  is_public: boolean;
  user_id: string;
  panels: Panel[];
}