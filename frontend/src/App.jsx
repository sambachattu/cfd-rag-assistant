import FilePanel from './components/FilePanel';
import ChatWindow from './components/ChatWindow';

export default function App() {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f172a', overflow: 'hidden' }}>
      <FilePanel />
      <ChatWindow />
    </div>
  );
}
