import { Outlet } from 'react-router-dom';
import { GlobalErrorProvider } from '../components/GlobalErrorContext';
import { PopupProvider } from '@/components/PopupContext';
import { AuthProvider } from '@/components/AuthContext';
import { FriendsProvider } from '../components/friends/FriendsContext';
import { LobbyProvider } from '../components/lobby/LobbyContext';
import { ChatProvider } from '../components/chat/ChatProvider';
import { ChatDockProvider } from '../components/chat/ChatDockContext';
import Layout from './Layout';

export const RootProviders = () => {
  return (
    <GlobalErrorProvider>
      <PopupProvider>
        <AuthProvider>
          <FriendsProvider>
            <LobbyProvider>
              <ChatProvider>
                <ChatDockProvider>
                  <Layout/>
                </ChatDockProvider>
              </ChatProvider>
            </LobbyProvider>
          </FriendsProvider>
        </AuthProvider>
      </PopupProvider>
    </GlobalErrorProvider>
  );
};