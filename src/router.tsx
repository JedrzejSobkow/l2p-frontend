import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LoginPage from "./screens/LoginPage";
import RequireGuest from './components/RequireGuest'
import RegistrationPage from "./screens/RegistrationPage";
import ForgotPasswordPage from "./screens/ForgotPasswordPage";
import ResetPasswordPage from "./screens/ResetPasswordPage";
import SelectLobbyByGameScreen from "./screens/SelectLobbyByGameScreen";
import SearchGamesScreen from "./screens/SearchGamesScreen";
import SearchLobbiesScreen from "./screens/SearchLobbiesScreen";

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
                path: 'select_lobby_by_game/:gameName',
                Component: SelectLobbyByGameScreen
            },
            {
                path: 'search_games/:searchPhrase?',
                Component: SearchGamesScreen
            },
            {
                path: 'search_lobbies/:searchPhrase?',
                Component: SearchLobbiesScreen
            }
        ] 
    }
])



