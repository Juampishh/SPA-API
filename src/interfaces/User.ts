export interface User {
  id?: number;
  type: "admin" | "client" | "masseuse" | "beautician" | "secretariat";
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  created_at?: Date;
}
