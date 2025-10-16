import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import HomeScreen from "../screens/HomeScreen";


export const router = createBrowserRouter([
    {
        path: '/',
        Component: Layout,
        children: [
            {
                index: true,
                Component: HomeScreen
            }
        ] 
    }
])
