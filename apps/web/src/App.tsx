import Sender from "./features/sender/components/Sender";
import Receiver from "./features/receiver/components/Receiver";

function App() {
  const path = window.location.pathname;

  // Simple routing: If URL contains "/receive/", show Receiver
  if (path.includes("/receive/")) {
    return <Receiver />;
  }

  // Default to Sender
  return <Sender />;
}

export default App;