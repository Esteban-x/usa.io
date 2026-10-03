import HomeExplorer from './components/HomeExplorer'
import { states } from './data/states'
import { toLite } from './lib/lite'

export default function Home() {
  return <HomeExplorer states={states.map(toLite)} />
}
