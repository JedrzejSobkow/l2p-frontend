import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LoginPage from "./screens/LoginPage";
import RequireGuest from './components/RequireGuest'
import RequireAuth from './components/RequireAuth'
import RegistrationPage from "./screens/RegistrationPage";
import ForgotPasswordPage from "./screens/ForgotPasswordPage";
import ResetPasswordPage from "./screens/ResetPasswordPage";
import FindGamesScreen from "./screens/FindGamesScreen";
import FindLobbiesScreen from "./screens/FindLobbiesScreen";
import LobbyScreen from "./screens/LobbyScreen";
import GameScreen from "./screens/GameScreen";
import FriendsScreen from "./screens/FriendsScreen";

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
                element: <RequireAuth><ProfileScreen></ProfileScreen></RequireAuth> 
            },
            {
                path: 'find_games/:searchPhrase?',
                element: <RequireGuest> <FindGamesScreen /> </RequireGuest>
            },
            {
                path: 'game/:gameName?',
                element: <RequireGuest> <GameScreen /> </RequireGuest>
            },
            {
                path: 'lobby/:lobbyName',
                element: <RequireGuest> <LobbyScreen /> </RequireGuest>
            },
            {
                path: 'friends',
                element: <RequireAuth><FriendsScreen /></RequireAuth>
            }
        ] 
    }
])



