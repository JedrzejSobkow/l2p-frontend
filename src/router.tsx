import { createBrowserRouter } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LoginPage from "./screens/LoginPage";
import RequireGuest from './components/RequireGuest'
import RequireAuth from './components/RequireAuth'
import RegistrationPage from "./screens/RegistrationPage";
import ForgotPasswordPage from "./screens/ForgotPasswordPage";
import ResetPasswordPage from "./screens/ResetPasswordPage";
import FindGamesScreen from "./screens/FindGamesScreen";
import GameScreen from "./screens/GameScreen";
import FriendsScreen from "./screens/FriendsScreen";
import VerifyEmailPage from './screens/VerifyEmailPage';
import { LobbyScreen } from "./screens/LobbyScreen";
import LobbyInGameScreen from "./screens/LobbyInGameScreen";
import ErrorPage from "./components/ErrorPage";
import { RootProviders } from "./layouts/RootProviders";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootProviders/>,
        errorElement: <ErrorPage/>,
        children: [
            {
                index: true,
                Component: HomeScreen
            },
            {
                path: 'login',
                element: <RequireGuest><LoginPage/></RequireGuest>
            },
            {
                path: 'forgot-password',
                element: <RequireGuest><ForgotPasswordPage /></RequireGuest>
            },
            {
                path: 'reset-password',
                element: <RequireGuest><ResetPasswordPage /></RequireGuest>
            },
            {
                path: 'register',
                element: <RequireGuest><RegistrationPage /></RequireGuest>
            },
            { 
                path: "profile", 
                element: <RequireAuth> <ProfileScreen /> </RequireAuth>
            },
            {
                path: 'find_games/:searchPhrase?',
                element:  <FindGamesScreen />
            },
            {
                path: 'game/:gameName?',
                element: <GameScreen /> 
            },
            // {
            //     path: 'lobby/:lobbyCode?',
            //     element: <RequireAuth> <LobbyScreen /> </RequireAuth>
            // },
            {
                path: 'lobby/:lobbyCode?',
                element: <LobbyScreen />
            },
            {
                path: 'lobby/ingame',
                element:<LobbyInGameScreen /> 
            },
            // {
            //     path: 'gameplay',
            //     element: <RequireAuth> <GamePlayScreen /> </RequireAuth>
            // },
            {
                path: 'friends',
                element: <RequireAuth><FriendsScreen /></RequireAuth>
            },
            {
                path: 'verify-email',
                element: <VerifyEmailPage />,
            },
            {
                path: '*',
                element: <ErrorPage customCode={404} customTitle="Page not found" customMessage="The page you are looking for does not exist." />
            }
        ] 
    }
])



