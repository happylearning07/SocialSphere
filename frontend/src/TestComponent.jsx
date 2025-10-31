import { useSelector } from "react-redux"

function TestComponent() {
  const user = useSelector(state => state.auth.user)
  return <p>User: {JSON.stringify(user)}</p>
}

export default TestComponent
