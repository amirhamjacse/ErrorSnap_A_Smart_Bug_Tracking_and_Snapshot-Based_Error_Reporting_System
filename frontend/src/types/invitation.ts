export type invitation = {
  id: number;
  user_id: number;
  project_id: string;
  invited_by: number;
  is_approved: number;
  project_name: string;
  project_description: string;
  invited_by_username: string;
};
