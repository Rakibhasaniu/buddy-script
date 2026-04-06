import { redirect } from 'next/navigation';

// root "/" always redirects to login
export default function RootPage() {
  redirect('/login');
}
