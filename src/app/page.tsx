// Page d'accueil = Page de login
// On redirige vers la page login
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/login')
}
