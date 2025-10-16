import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import HomeScreen from "../screens/HomeScreen";
import LoginPage from "../screens/LoginPage";
import RegistrationPage from "../screens/RegistrationPage";


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
                Component: LoginPage
            },
            {
                path: 'register',
                Component: RegistrationPage
            }
        ] 
    }
])
