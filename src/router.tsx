import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LoginPage from "./screens/LoginPage";
import RequireGuest from './components/RequireGuest'
import RegistrationPage from "./screens/RegistrationPage";
import ForgotPasswordPage from "./screens/ForgotPasswordPage";
import ResetPasswordPage from "./screens/ResetPasswordPage";
import FindGamesScreen from "./screens/FindGamesScreen";
import FindLobbiesScreen from "./screens/FindLobbiesScreen";
import LobbyScreen from "./screens/LobbyScreen";

export const router = createBrowserRouter([
    {
        path: '/',
        Component: Layout,
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
                Component: ProfileScreen 
            },
            {
                path: 'find_games/:searchPhrase?',
                element: <RequireGuest> <FindGamesScreen /> </RequireGuest>
            },
            {
                path: 'find_lobbies/',
                element: <RequireGuest> <FindLobbiesScreen /> </RequireGuest>
            },
            {
                path: 'find_lobbies/phrase/:searchPhrase?',
                element: <RequireGuest> <FindLobbiesScreen /> </RequireGuest>
            },
            {
                path: 'find_lobbies/game/:gameName?',
                element: <RequireGuest> <FindLobbiesScreen /> </RequireGuest>
            },
            {
                path: 'lobby/:lobby',
                element: <RequireGuest> <LobbyScreen /> </RequireGuest>
            }
        ] 
    }
])



